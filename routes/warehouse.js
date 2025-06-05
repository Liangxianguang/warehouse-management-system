const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取可用库存
router.post('/available-stock', async (req, res) => {
    try {
        const { searchTerm = '', strategy = 'FIFO' } = req.body;

        // 简化查询，移除 NULLS LAST（MySQL不支持此语法）
        let sql = `
            SELECT 
                p.ProductID,
                p.ProductName,
                p.StockQuantity as TotalStock,
                COALESCE(bs.BatchNo, 'DEFAULT') as BatchNo,
                COALESCE(bs.InboundDate, NOW()) as InboundDate,
                COALESCE(bs.Location, '默认库位') as Location,
                COALESCE(bs.RemainingQuantity, p.StockQuantity) as AvailableQuantity
            FROM Product p
            LEFT JOIN BatchStock bs ON p.ProductID = bs.ProductID
            WHERE p.StockQuantity > 0
                AND (p.ProductName LIKE ? OR p.ProductID LIKE ?)
        `;

        // 修改排序语句
        switch(strategy) {
            case 'FIFO':
                sql += ' ORDER BY COALESCE(bs.InboundDate, NOW()) ASC';
                break;
            case 'LIFO':
                sql += ' ORDER BY COALESCE(bs.InboundDate, NOW()) DESC';
                break;
            case 'BATCH':
                sql += ' ORDER BY bs.BatchNo ASC';
                break;
            case 'LOCATION':
                sql += ' ORDER BY bs.Location ASC';
                break;
            default:
                sql += ' ORDER BY COALESCE(bs.InboundDate, NOW()) ASC';
        }

        const searchPattern = `%${searchTerm}%`;
        const [results] = await db.execute(sql, [searchPattern, searchPattern]);

        res.json(results || []);
        
    } catch (error) {
        console.error('Error in /available-stock:', error);
        res.status(500).json({
            error: '获取库存信息失败',
            details: error.message
        });
    }
});

// 提交出库处理
router.post('/outbound', async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const {outboundNo, outboundType, operatorId, note, strategy, items} = req.body;

        // 1. 插入出库主表
        const outboundSql = `
            INSERT INTO Outbound (
                OutboundNo, OutboundType, OperatorID, OutboundStrategy, Note
            ) VALUES (?, ?, ?, ?, ?)
        `;
        const result = await conn.query(outboundSql, [
            outboundNo, outboundType, operatorId, strategy, note
        ]);
        const outboundId = result.insertId;

        // 2. 处理每个出库项
        for (const item of items) {
            // 2.1 插入出库明细
            await conn.query(`
                INSERT INTO OutboundDetail (
                    OutboundID, ProductID, BatchNo, Quantity, Location
                ) VALUES (?, ?, ?, ?, ?)
            `, [outboundId, item.productId, item.batchNo, item.quantity, item.location]);

            // 2.2 更新批次库存
            const updateBatchSql = `
                UPDATE BatchStock 
                SET RemainingQuantity = RemainingQuantity - ?
                WHERE ProductID = ? AND BatchNo = ? AND Location = ?
                AND RemainingQuantity >= ?
            `;
            const updateBatchResult = await conn.query(updateBatchSql, [
                item.quantity, item.productId, item.batchNo, 
                item.location, item.quantity
            ]);

            if (updateBatchResult.affectedRows === 0) {
                throw new Error(`商品 ${item.productId} 的批次 ${item.batchNo} 库存不足`);
            }

            // 2.3 更新商品总库存
            const updateProductSql = `
                UPDATE Product 
                SET StockQuantity = StockQuantity - ?
                WHERE ProductID = ? AND StockQuantity >= ?
            `;
            const updateProductResult = await conn.query(updateProductSql, [
                item.quantity, item.productId, item.quantity
            ]);

            if (updateProductResult.affectedRows === 0) {
                throw new Error(`商品 ${item.productId} 库存不足`);
            }
        }

        await conn.commit();
        res.json({ success: true, message: '出库成功' });

    } catch (error) {
        await conn.rollback();
        console.error('Error processing outbound:', error);
        res.status(500).json({ 
            success: false, 
            error: '出库处理失败',
            message: error.message 
        });
    } finally {
        conn.release();
    }
});

module.exports = router;
