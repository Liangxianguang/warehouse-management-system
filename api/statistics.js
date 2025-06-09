const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// 复用主服务的数据库连接池
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123123',
    database: 'supermarket_db',
    port: 3306
};
const pool = mysql.createPool(dbConfig).promise();

// 高级统计接口
router.get('/advanced', async (req, res) => {
    const { startDate, endDate, category, type } = req.query;

    try {
        if (type === 'inout') {
            // 出入库趋势（按天统计入库和出库）
            let dateWhere = '';
            const params = [];
            if (startDate) {
                dateWhere += ' AND DATE(p.PurchaseDate) >= ?';
                params.push(startDate);
            }
            if (endDate) {
                dateWhere += ' AND DATE(p.PurchaseDate) <= ?';
                params.push(endDate);
            }
            if (category) {
                dateWhere += ' AND pr.Category = ?';
                params.push(category);
            }
            // 入库
            const [inRows] = await pool.query(`
                SELECT DATE(p.PurchaseDate) as date, SUM(p.Quantity) as inQty
                FROM Purchase p
                LEFT JOIN Product pr ON p.ProductID = pr.ProductID
                WHERE 1=1 ${dateWhere}
                GROUP BY DATE(p.PurchaseDate)
                ORDER BY DATE(p.PurchaseDate)
            `, params);
            // 出库
            let outWhere = '';
            const outParams = [];
            if (startDate) {
                outWhere += ' AND DATE(s.SaleDate) >= ?';
                outParams.push(startDate);
            }
            if (endDate) {
                outWhere += ' AND DATE(s.SaleDate) <= ?';
                outParams.push(endDate);
            }
            if (category) {
                outWhere += ' AND pr.Category = ?';
                outParams.push(category);
            }
            const [outRows] = await pool.query(`
                SELECT DATE(s.SaleDate) as date, SUM(sd.Quantity) as outQty
                FROM SaleDetail sd
                JOIN Sale s ON sd.SaleID = s.SaleID
                LEFT JOIN Product pr ON sd.ProductID = pr.ProductID
                WHERE 1=1 ${outWhere}
                GROUP BY DATE(s.SaleDate)
                ORDER BY DATE(s.SaleDate)
            `, outParams);

            // 合并日期
            const dateSet = new Set();
            inRows.forEach(r => dateSet.add(r.date));
            outRows.forEach(r => dateSet.add(r.date));
            const dates = Array.from(dateSet).sort().reverse(); // 按日期排序

            const inMap = Object.fromEntries(inRows.map(r => [r.date, Number(r.inQty)]));
            const outMap = Object.fromEntries(outRows.map(r => [r.date, Number(r.outQty)]));

            res.json({
                dates,
                in: dates.map(d => inMap[d] || 0),
                out: dates.map(d => outMap[d] || 0)
            });
        } else if (type === 'category') {
            // 按类别分布（饼图）
            let where = '';
            const params = [];
            if (startDate) {
                where += ' AND DATE(s.SaleDate) >= ?';
                params.push(startDate);
            }
            if (endDate) {
                where += ' AND DATE(s.SaleDate) <= ?';
                params.push(endDate);
            }
            if (category) {
                where += ' AND pr.Category = ?';
                params.push(category);
            }
            const [rows] = await pool.query(`
                SELECT pr.Category as name, SUM(sd.Quantity) as value
                FROM SaleDetail sd
                JOIN Sale s ON sd.SaleID = s.SaleID
                LEFT JOIN Product pr ON sd.ProductID = pr.ProductID
                WHERE 1=1 ${where}
                GROUP BY pr.Category
                ORDER BY value DESC
            `, params);
            res.json({ categories: rows });
        } else if (type === 'supplier') {
            // 按供应商统计（柱状图）
            let where = '';
            const params = [];
            if (startDate) {
                where += ' AND DATE(p.PurchaseDate) >= ?';
                params.push(startDate);
            }
            if (endDate) {
                where += ' AND DATE(p.PurchaseDate) <= ?';
                params.push(endDate);
            }
            if (category) {
                where += ' AND pr.Category = ?';
                params.push(category);
            }
            const [rows] = await pool.query(`
                SELECT s.SupplierName, SUM(p.Quantity) as amount
                FROM Purchase p
                LEFT JOIN Supplier s ON p.SupplierID = s.SupplierID
                LEFT JOIN Product pr ON p.ProductID = pr.ProductID
                WHERE 1=1 ${where}
                GROUP BY s.SupplierName
                ORDER BY amount DESC
            `, params);
            res.json({
                suppliers: rows.map(r => r.SupplierName),
                amounts: rows.map(r => Number(r.amount))
            });
        } else if (type === 'customer') {
            // 按客户统计（柱状图）
            let where = '';
            const params = [];
            if (startDate) {
                where += ' AND DATE(s.SaleDate) >= ?';
                params.push(startDate);
            }
            if (endDate) {
                where += ' AND DATE(s.SaleDate) <= ?';
                params.push(endDate);
            }
            if (category) {
                where += ' AND pr.Category = ?';
                params.push(category);
            }
            const [rows] = await pool.query(`
                SELECT c.CustomerName, SUM(sd.Quantity) as amount
                FROM SaleDetail sd
                JOIN Sale s ON sd.SaleID = s.SaleID
                LEFT JOIN Customer c ON s.CustomerID = c.CustomerID
                LEFT JOIN Product pr ON sd.ProductID = pr.ProductID
                WHERE 1=1 ${where}
                GROUP BY c.CustomerName
                ORDER BY amount DESC
            `, params);
            res.json({
                customers: rows.map(r => r.CustomerName),
                amounts: rows.map(r => Number(r.amount))
            });
        } else {
            res.status(400).json({ error: '未知统计类型' });
        }
    } catch (error) {
        console.error('Error in /api/statistics/advanced:', error);
        res.status(500).json({ error: '服务器错误', message: error.message });
    }
});


// 获取某天的入库/出库趋势（按小时）
router.get('/stocktrend', async (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ error: '缺少日期参数' });
    }
    try {
        // 入库（按小时）
        const [inRows] = await pool.query(`
            SELECT HOUR(p.PurchaseDate) as hour, SUM(p.Quantity) as inQty
            FROM Purchase p
            WHERE DATE(p.PurchaseDate) = ?
            GROUP BY hour
            ORDER BY hour
        `, [date]);
        // 出库（按小时）
        const [outRows] = await pool.query(`
            SELECT HOUR(s.SaleDate) as hour, SUM(sd.Quantity) as outQty
            FROM SaleDetail sd
            JOIN Sale s ON sd.SaleID = s.SaleID
            WHERE DATE(s.SaleDate) = ?
            GROUP BY hour
            ORDER BY hour
        `, [date]);

        // 生成0~23小时的完整数组
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const inMap = Object.fromEntries(inRows.map(r => [r.hour, Number(r.inQty)]));
        const outMap = Object.fromEntries(outRows.map(r => [r.hour, Number(r.outQty)]));
        res.json({
            dates: hours.map(h => `${h}:00`),
            in: hours.map(h => inMap[h] || 0),
            out: hours.map(h => outMap[h] || 0)
        });
    } catch (error) {
        console.error('Error in /api/statistics/stocktrend:', error);
        res.status(500).json({ error: '服务器错误', message: error.message });
    }
});

// 获取某月的每日入库/出库趋势
router.get('/inouttrend', async (req, res) => {
    const { month } = req.query;
    if (!month) {
        return res.status(400).json({ error: '缺少月份参数' });
    }
    try {
        // 入库（按天）
        const [inRows] = await pool.query(`
            SELECT DATE(p.PurchaseDate) as date, SUM(p.Quantity) as inQty
            FROM Purchase p
            WHERE DATE_FORMAT(p.PurchaseDate, '%Y-%m') = ?
            GROUP BY date
            ORDER BY date
        `, [month]);
        // 出库（按天）
        const [outRows] = await pool.query(`
            SELECT DATE(s.SaleDate) as date, SUM(sd.Quantity) as outQty
            FROM SaleDetail sd
            JOIN Sale s ON sd.SaleID = s.SaleID
            WHERE DATE_FORMAT(s.SaleDate, '%Y-%m') = ?
            GROUP BY date
            ORDER BY date
        `, [month]);

        // 合并所有日期
        const dateSet = new Set();
        inRows.forEach(r => dateSet.add(r.date));
        outRows.forEach(r => dateSet.add(r.date));
        const dates = Array.from(dateSet).sort().reverse(); // 按日期降序
        const inMap = Object.fromEntries(inRows.map(r => [r.date, Number(r.inQty)]));
        const outMap = Object.fromEntries(outRows.map(r => [r.date, Number(r.outQty)]));
        res.json({
            dates,
            in: dates.map(d => inMap[d] || 0),
            out: dates.map(d => outMap[d] || 0)
        });
    } catch (error) {
        console.error('Error in /api/statistics/inouttrend:', error);
        res.status(500).json({ error: '服务器错误', message: error.message });
    }
});

module.exports = router;
