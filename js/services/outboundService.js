const db = require('../db');

class OutboundService {
    // 获取可用库存
    async getAvailableStock(searchTerm = '', strategy = 'FIFO') {
        const sql = `
            SELECT 
                p.ProductID,
                p.ProductName,
                bs.BatchNo,
                bs.InboundDate,
                bs.Location,
                bs.RemainingQuantity as AvailableQuantity
            FROM Product p
            JOIN BatchStock bs ON p.ProductID = bs.ProductID
            WHERE bs.RemainingQuantity > 0
                AND (p.ProductName LIKE ? OR p.ProductID LIKE ?)
            ORDER BY ${this.getOrderByClause(strategy)}
        `;
        
        const searchPattern = `%${searchTerm}%`;
        return await db.query(sql, [searchPattern, searchPattern]);
    }

    // 不同策略的排序方式
    getOrderByClause(strategy) {
        switch(strategy) {
            case 'FIFO':
                return 'bs.InboundDate ASC';  // 先进先出
            case 'LIFO':
                return 'bs.InboundDate DESC'; // 后进先出
            case 'BATCH':
                return 'bs.BatchNo ASC';      // 按批次号
            case 'LOCATION':
                return 'bs.Location ASC';     // 按库位
            default:
                return 'bs.InboundDate ASC';  // 默认FIFO
        }
    }

    // 处理出库
    async processOutbound(outboundData) {
        try {
            await db.beginTransaction();

            // 1. 插入出库主表
            const outboundSql = `
                INSERT INTO Outbound (OutboundNo, OutboundType, OperatorID, OutboundStrategy, Note)
                VALUES (?, ?, ?, ?, ?)
            `;
            const outboundResult = await db.query(outboundSql, [
                outboundData.outboundNo,
                outboundData.outboundType,
                outboundData.operatorId,
                outboundData.strategy,
                outboundData.note
            ]);

            const outboundId = outboundResult.insertId;

            // 2. 处理每个出库项
            for (const item of outboundData.items) {
                // 2.1 插入出库明细
                await db.query(`
                    INSERT INTO OutboundDetail (OutboundID, ProductID, BatchNo, Quantity, Location)
                    VALUES (?, ?, ?, ?, ?)
                `, [outboundId, item.productId, item.batchNo, item.quantity, item.location]);

                // 2.2 更新批次库存
                const updateBatchSql = `
                    UPDATE BatchStock 
                    SET RemainingQuantity = RemainingQuantity - ?
                    WHERE ProductID = ? AND BatchNo = ? AND Location = ?
                `;
                await db.query(updateBatchSql, [
                    item.quantity,
                    item.productId,
                    item.batchNo,
                    item.location
                ]);

                // 2.3 更新商品总库存
                const updateProductSql = `
                    UPDATE Product 
                    SET StockQuantity = StockQuantity - ?
                    WHERE ProductID = ?
                `;
                await db.query(updateProductSql, [item.quantity, item.productId]);
            }

            await db.commit();
            return { success: true };

        } catch (error) {
            await db.rollback();
            throw error;
        }
    }
}

module.exports = new OutboundService();
