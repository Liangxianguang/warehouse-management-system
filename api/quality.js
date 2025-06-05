const express = require('express');
const router = express.Router();

// 引入数据库连接池
const mysql = require('mysql2');
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'supermarket_db',
    port: 3306
};
const pool = mysql.createPool(dbConfig);

/**
 * 新增质检记录（主表+明细）
 * POST /api/quality/inspection
 * body: { purchaseId, inspector, supplierId, note, details: [{productId, quantity, result, remark}] }
 */
router.post('/inspection', async (req, res) => {
    let { purchaseId, inspector, supplierId, note, details } = req.body;
    if (!purchaseId || !inspector || !details || !Array.isArray(details) || details.length === 0) {
        return res.status(400).json({ error: '参数不完整' });
    }
    // 处理supplierId为字符串'null'或空字符串的情况
    if (supplierId === undefined || supplierId === null || supplierId === '' || supplierId === 'null' || supplierId === 'undefined') {
        supplierId = null;
    }
    pool.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: '数据库连接失败' });
        connection.beginTransaction(async err => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: '事务开启失败' });
            }
            try {
                // 插入质检主表
                const [mainResult] = await connection.promise().query(
                    'INSERT INTO QualityInspection (PurchaseID, Inspector, SupplierID, Note) VALUES (?, ?, ?, ?)',
                    [purchaseId, inspector, supplierId, note]
                );
                const inspectionId = mainResult.insertId;
                // 插入明细
                for (const item of details) {
                    await connection.promise().query(
                        'INSERT INTO QualityInspectionDetail (InspectionID, ProductID, Quantity, Result, Remark) VALUES (?, ?, ?, ?, ?)',
                        [inspectionId, item.productId, item.quantity, item.result, item.remark]
                    );
                }
                await connection.promise().commit();
                res.json({ success: true, inspectionId });
            } catch (e) {
                await connection.promise().rollback();
                console.error('质检保存失败', e); // 输出详细错误
                res.status(500).json({ error: '质检记录保存失败', detail: e.message });
            } finally {
                connection.release();
            }
        });
    });
});

/**
 * 质检结果查询
 * GET /api/quality/query?startDate=...&endDate=...&productName=...&result=...
 * 支持按时间范围、商品名、质检结果等条件查询
 */
router.get('/query', async (req, res) => {
    const { startDate, endDate, productName, result } = req.query;
    let sql = `
        SELECT q.InspectionID, q.InspectionDate, q.Inspector, q.Note, 
               s.SupplierName, p.ProductName, d.Quantity, d.Result, d.Remark
        FROM QualityInspection q
        JOIN Supplier s ON q.SupplierID = s.SupplierID
        JOIN QualityInspectionDetail d ON q.InspectionID = d.InspectionID
        JOIN Product p ON d.ProductID = p.ProductID
        WHERE 1=1
    `;
    const params = [];
    if (startDate) {
        sql += ' AND q.InspectionDate >= ?';
        params.push(startDate);
    }
    if (endDate) {
        sql += ' AND q.InspectionDate <= ?';
        params.push(endDate);
    }
    if (productName) {
        sql += ' AND p.ProductName LIKE ?';
        params.push(`%${productName}%`);
    }
    if (result) {
        sql += ' AND d.Result = ?';
        params.push(result);
    }
    sql += ' ORDER BY q.InspectionDate DESC, q.InspectionID DESC';
    pool.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: '查询失败', detail: err.message });
        }
        res.json(results);
    });
});

/**
 * 获取所有进货记录（用于质检，确保有ProductID等字段）
 * GET /api/quality/purchases
 */
router.get('/purchases', async (req, res) => {
    const sql = `
        SELECT 
            p.PurchaseID,
            p.ProductID,
            pr.ProductName,
            p.SupplierID,
            s.SupplierName,
            p.Quantity,
            p.PurchasePrice,
            p.TotalAmount,
            p.PurchaseDate
        FROM Purchase p
        LEFT JOIN Product pr ON p.ProductID = pr.ProductID
        LEFT JOIN Supplier s ON p.SupplierID = s.SupplierID
        ORDER BY p.PurchaseDate DESC
    `;
    pool.query(sql, [], (err, results) => {
        if (err) {
            return res.status(500).json({ error: '查询进货记录失败', detail: err.message });
        }
        // 保证ProductID字段有值
        const formatted = results.map(r => ({
            ...r,
            ProductID: r.ProductID, // 明确返回
            ProductName: r.ProductName || '已删除商品',
            SupplierID: r.SupplierID,
            SupplierName: r.SupplierName || '已删除供应商',
            Quantity: r.Quantity
        }));
        res.json(formatted);
    });
});

module.exports = router;
