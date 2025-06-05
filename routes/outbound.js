const express = require('express');
const router = express.Router();
const db = require('../db');

// 调试路由
router.get('/test', (req, res) => {
    res.json({ status: 'outbound route ok' });
});

// 获取可用库存
router.post('/available-stock', async (req, res) => {
    try {
        console.log('收到库存查询请求:', req.body);
        const { searchTerm = '', strategy = 'FIFO' } = req.body;

        const sql = `
            SELECT DISTINCT
                p.ProductID,
                p.ProductName,
                p.StockQuantity,
                COALESCE(bs.BatchNo, 'DEFAULT') as BatchNo,
                COALESCE(bs.InboundDate, NOW()) as InboundDate,
                COALESCE(bs.Location, '默认库位') as Location,
                COALESCE(bs.RemainingQuantity, p.StockQuantity) as AvailableQuantity
            FROM Product p
            LEFT JOIN BatchStock bs ON p.ProductID = bs.ProductID
            WHERE p.StockQuantity > 0
            AND (
                p.ProductName LIKE ? 
                OR CAST(p.ProductID AS CHAR) LIKE ?
            )
            ORDER BY 
                CASE ?
                    WHEN 'FIFO' THEN bs.InboundDate
                    WHEN 'LIFO' THEN bs.InboundDate * -1
                    WHEN 'BATCH' THEN bs.BatchNo
                    ELSE bs.Location
                END
        `;

        const searchPattern = `%${searchTerm}%`;
        console.log('执行SQL:', sql);
        console.log('参数:', [searchPattern, searchPattern, strategy]);

        const [results] = await db.query(sql, [searchPattern, searchPattern, strategy]);
        console.log('查询结果:', results);

        res.json(results || []);

    } catch (error) {
        console.error('查询出错:', error);
        res.status(500).json({
            error: '获取库存信息失败',
            message: error.message
        });
    }
});

// 修改提交出库路由,保存商品名称
router.post('/outbound', async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        
        const { outboundNo, outboundType, operatorId, note, items } = req.body;
        
        // 插入出库主表
        const [result] = await conn.query(
            `INSERT INTO Outbound (OutboundNo, OutboundType, OperatorID, Note) 
             VALUES (?, ?, ?, ?)`,
            [outboundNo, outboundType, operatorId, note]
        );
        
        const outboundId = result.insertId;

        // 处理出库明细，获取并保存商品名称
        for (const item of items) {
            // 获取商品名称
            const [product] = await conn.query(
                'SELECT ProductName FROM Product WHERE ProductID = ?',
                [item.productId]
            );

            // 插入出库明细，包含商品名称
            await conn.query(
                `INSERT INTO OutboundDetail 
                (OutboundID, ProductID, ProductName, BatchNo, Quantity, Location) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    outboundId, 
                    item.productId,
                    product[0].ProductName, // 保存商品名称
                    item.batchNo,
                    item.quantity,
                    item.location
                ]
            );

            // 更新库存
            await conn.query(
                `UPDATE BatchStock 
                SET RemainingQuantity = RemainingQuantity - ? 
                WHERE ProductID = ? AND BatchNo = ?`,
                [item.quantity, item.productId, item.batchNo]
            );
        }

        await conn.commit();
        res.json({ success: true, outboundId });
    } catch (error) {
        await conn.rollback();
        console.error('出库处理错误:', error);
        res.status(500).json({
            error: '出库处理失败',
            message: error.message
        });
    } finally {
        conn.release();
    }
});

// 修改出库记录查询路由
router.get('/record/:outboundNo', async (req, res) => {
    try {
        const { outboundNo } = req.params;
        
        // 查询出库主表信息
        const [outboundInfo] = await db.query(`
            SELECT 
                o.OutboundID,
                o.OutboundNo,
                o.OutboundType,
                o.OutboundDate,
                o.OutboundStrategy,
                o.Note,
                e.EmployeeName as OperatorName
            FROM Outbound o
            LEFT JOIN Employee e ON o.OperatorID = e.EmployeeID
            WHERE o.OutboundNo = ?
        `, [outboundNo]);

        if (!outboundInfo || outboundInfo.length === 0) {
            return res.status(404).json({ error: '出库记录不存在' });
        }

        // 查询出库明细
        const [details] = await db.query(`
            SELECT 
                od.DetailID,
                p.ProductName,
                od.BatchNo,
                od.Quantity,
                od.Location
            FROM OutboundDetail od
            JOIN Product p ON od.ProductID = p.ProductID
            WHERE od.OutboundID = ?
            ORDER BY od.DetailID
        `, [outboundInfo[0].OutboundID]);

        res.json({
            outboundInfo: outboundInfo[0],
            details: details
        });

    } catch (error) {
        console.error('获取出库记录失败:', error);
        res.status(500).json({
            error: '获取出库记录失败',
            message: error.message
        });
    }
});

// 修改获取最近的出库记录列表
router.get('/records', async (req, res) => {
    try {
        const query = `
            SELECT 
                o.OutboundNo,
                o.OutboundType,
                o.OutboundDate,
                e.EmployeeName as OperatorName,
                o.OutboundStrategy,
                GROUP_CONCAT(DISTINCT od.ProductName SEPARATOR '、') as ProductNames,
                SUM(od.Quantity) as TotalQuantity,
                GROUP_CONCAT(DISTINCT od.BatchNo SEPARATOR '、') as BatchNos,
                GROUP_CONCAT(DISTINCT od.Location SEPARATOR '、') as Locations,
                COUNT(DISTINCT od.ProductID) as ItemCount
            FROM Outbound o
            LEFT JOIN Employee e ON o.OperatorID = e.EmployeeID
            LEFT JOIN OutboundDetail od ON o.OutboundID = od.OutboundID  -- 修正JOIN条件
            WHERE od.ProductName IS NOT NULL
            GROUP BY 
                o.OutboundID, 
                o.OutboundNo, 
                o.OutboundType, 
                o.OutboundDate,
                o.OutboundStrategy, 
                e.EmployeeName
            ORDER BY o.OutboundDate DESC
        `;

        const [records] = await db.query(query);
        console.log('查询原始数据:', records);

        // 格式化数据
        const formattedRecords = records.map(record => ({
            ...record,
            OutboundDate: new Date(record.OutboundDate).toLocaleString(),
            ProductNames: record.ProductNames || '有暂无商品信息',
            BatchNos: record.BatchNos || '暂无批次信息',
            Locations: record.Locations || '暂无库位信息',
            ItemCount: parseInt(record.ItemCount || 0),
            TotalQuantity: parseInt(record.TotalQuantity || 0),
            OutboundType: {
                'SALE': '销售出库',
                'TRANSFER': '调拨出库',
                'DAMAGE': '损坏出库',
                'OTHER': '其他出库'
            }[record.OutboundType] || record.OutboundType,
            OutboundStrategy: {
                'FIFO': '先进先出',
                'LIFO': '后进先出',
                'BATCH': '按批次',
                'LOCATION': '库位优化'
            }[record.OutboundStrategy] || record.OutboundStrategy
        }));

        res.json(formattedRecords);
    } catch (error) {
        console.error('获取出库记录失败:', error);
        res.status(500).json({
            error: '获取出库记录失败',
            message: error.message
        });
    }
});

module.exports = router;
