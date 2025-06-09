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
// 获取统计数据（折线图、柱状图、饼图）
router.get('/advanced', async (req, res) => {
    const {
        startDate, endDate,
        mainStatType, subStatType,
        supplierId, customerId, category
    } = req.query;

    try {
        // 1. 折线图数据（按天统计）
        let lineData = { dates: [], in: [], out: [], stock: [] };
        // 2. 柱状图数据（商品名为横轴）
        let barData = { products: [], in: [], out: [], stock: [] };
        // 3. 饼图数据（商品名为分类）
        let pieData = { products: [] };

        // --------- 库存统计 ---------
        if (mainStatType === 'stock') {
            // 1. 折线图：每日所有商品库存总量（以product表StockQuantity为准，历史库存需业务支持，这里仅返回当前库存）
            const [stockRows] = await pool.query(`
                SELECT pr.ProductName, pr.Category, pr.StockQuantity
                FROM product pr
                ${supplierId ? 'WHERE pr.SupplierID = ?' : ''}
                ${supplierId && category ? ' AND pr.Category = ?' : (category ? 'WHERE pr.Category = ?' : '')}
            `, [ ...(supplierId ? [supplierId] : []), ...(category ? [category] : []) ]);
            // 当前库存折线图仅有一条数据（当前日期）
            const today = new Date().toISOString().slice(0, 10);
            lineData.dates = [today];
            lineData.stock = [stockRows.reduce((sum, r) => sum + Number(r.StockQuantity), 0)];

            // 2. 柱状图：各商品当前库存
            barData.products = stockRows.map(r => r.ProductName);
            barData.stock = stockRows.map(r => Number(r.StockQuantity));

            // 3. 饼图：各商品当前库存
            pieData.products = stockRows.map(r => ({
                name: r.ProductName,
                value: Number(r.StockQuantity)
            }));

        // --------- 出入库统计 ---------
        } else if (mainStatType === 'inout') {
            // 入库条件
            let inWhere = [];
            let inParams = [];
            if (startDate) { inWhere.push('DATE(p.PurchaseDate) >= ?'); inParams.push(startDate); }
            if (endDate)   { inWhere.push('DATE(p.PurchaseDate) <= ?'); inParams.push(endDate); }
            if (category)  { inWhere.push('pr.Category = ?'); inParams.push(category); }
            if (supplierId) { inWhere.push('p.SupplierID = ?'); inParams.push(supplierId); }

            // 出库条件
            let outWhere = [];
            let outParams = [];
            if (startDate) { outWhere.push('DATE(s.SaleDate) >= ?'); outParams.push(startDate); }
            if (endDate)   { outWhere.push('DATE(s.SaleDate) <= ?'); outParams.push(endDate); }
            if (category)  { outWhere.push('pr.Category = ?'); outParams.push(category); }
            if (customerId) { outWhere.push('s.CustomerID = ?'); outParams.push(customerId); }

            // --------- 出入库.全部 ---------
            if (!subStatType || subStatType === '') {
                // 折线图：按天统计入库/出库
                const [inRows] = await pool.query(`
                    SELECT DATE(p.PurchaseDate) as date, SUM(p.Quantity) as inQty
                    FROM purchase p
                    LEFT JOIN product pr ON p.ProductID = pr.ProductID
                    ${inWhere.length ? 'WHERE ' + inWhere.join(' AND ') : ''}
                    GROUP BY DATE(p.PurchaseDate)
                    ORDER BY DATE(p.PurchaseDate)
                `, inParams);
                const [outRows] = await pool.query(`
                    SELECT DATE(s.SaleDate) as date, SUM(sd.Quantity) as outQty
                    FROM saledetail sd
                    JOIN sale s ON sd.SaleID = s.SaleID
                    LEFT JOIN product pr ON sd.ProductID = pr.ProductID
                    ${outWhere.length ? 'WHERE ' + outWhere.join(' AND ') : ''}
                    GROUP BY DATE(s.SaleDate)
                    ORDER BY DATE(s.SaleDate)
                `, outParams);
                // 合并日期
                const dateSet = new Set();
                inRows.forEach(r => dateSet.add(r.date));
                outRows.forEach(r => dateSet.add(r.date));
                const dates = Array.from(dateSet).sort();
                const inMap = Object.fromEntries(inRows.map(r => [r.date, Number(r.inQty)]));
                const outMap = Object.fromEntries(outRows.map(r => [r.date, Number(r.outQty)]));
                lineData.dates = dates;
                lineData.in = dates.map(d => inMap[d] || 0);
                lineData.out = dates.map(d => outMap[d] || 0);

                // 柱状图：各商品入库/出库总量
                // 所有筛选条件都放到 WHERE 子句
                let barWhere = [];
                let barParams = [];
                if (category) { barWhere.push('pr.Category = ?'); barParams.push(category); }
                // 入库相关
                let inBarWhere = [];
                let inBarParams = [];
                if (startDate) { inBarWhere.push('DATE(p.PurchaseDate) >= ?'); inBarParams.push(startDate); }
                if (endDate)   { inBarWhere.push('DATE(p.PurchaseDate) <= ?'); inBarParams.push(endDate); }
                if (supplierId) { inBarWhere.push('p.SupplierID = ?'); inBarParams.push(supplierId); }
                // 出库相关
                let outBarWhere = [];
                let outBarParams = [];
                if (startDate) { outBarWhere.push('DATE(s.SaleDate) >= ?'); outBarParams.push(startDate); }
                if (endDate)   { outBarWhere.push('DATE(s.SaleDate) <= ?'); outBarParams.push(endDate); }
                if (customerId) { outBarWhere.push('s.CustomerID = ?'); outBarParams.push(customerId); }

                const [barRows] = await pool.query(`
                    SELECT pr.ProductName,
                        (SELECT SUM(p.Quantity) FROM purchase p
                            WHERE p.ProductID = pr.ProductID
                            ${inBarWhere.length ? ' AND ' + inBarWhere.join(' AND ') : ''}
                        ) as inQty,
                        (SELECT SUM(sd.Quantity) FROM saledetail sd
                            JOIN sale s ON sd.SaleID = s.SaleID
                            WHERE sd.ProductID = pr.ProductID
                            ${outBarWhere.length ? ' AND ' + outBarWhere.join(' AND ') : ''}
                        ) as outQty
                    FROM product pr
                    ${barWhere.length ? 'WHERE ' + barWhere.join(' AND ') : ''}
                    GROUP BY pr.ProductID, pr.ProductName
                    ORDER BY inQty DESC, outQty DESC
                `, [
                    ...inBarParams,
                    ...outBarParams,
                    ...barParams
                ]);
                barData.products = barRows.map(r => r.ProductName);
                barData.in = barRows.map(r => Number(r.inQty) || 0);
                barData.out = barRows.map(r => Number(r.outQty) || 0);

                // 饼图：各商品入库/出库总量
                pieData.products = barRows.map(r => ({
                    name: r.ProductName,
                    value: (Number(r.inQty) || 0) + (Number(r.outQty) || 0)
                }));

            // --------- 出入库.入库 ---------
            } else if (subStatType === 'in') {
                // 折线图
                const [inRows] = await pool.query(`
                    SELECT DATE(p.PurchaseDate) as date, SUM(p.Quantity) as inQty
                    FROM purchase p
                    LEFT JOIN product pr ON p.ProductID = pr.ProductID
                    ${inWhere.length ? 'WHERE ' + inWhere.join(' AND ') : ''}
                    GROUP BY DATE(p.PurchaseDate)
                    ORDER BY DATE(p.PurchaseDate)
                `, inParams);
                const dates = inRows.map(r => r.date);
                lineData.dates = dates;
                lineData.in = inRows.map(r => Number(r.inQty));

                // 柱状图
                const [barRows] = await pool.query(`
                    SELECT pr.ProductName, SUM(p.Quantity) as inQty
                    FROM purchase p
                    LEFT JOIN product pr ON p.ProductID = pr.ProductID
                    ${inWhere.length ? 'WHERE ' + inWhere.join(' AND ') : ''}
                    GROUP BY pr.ProductName
                    ORDER BY inQty DESC
                `, inParams);
                barData.products = barRows.map(r => r.ProductName);
                barData.in = barRows.map(r => Number(r.inQty));

                // 饼图：使用商品名
                pieData.products = barRows.map(r => ({
                    name: r.ProductName,
                    value: Number(r.inQty)
                }));

            // --------- 出入库.出库 ---------
            } else if (subStatType === 'out') {
                // 折线图
                const [outRows] = await pool.query(`
                    SELECT DATE(s.SaleDate) as date, SUM(sd.Quantity) as outQty
                    FROM saledetail sd
                    JOIN sale s ON sd.SaleID = s.SaleID
                    LEFT JOIN product pr ON sd.ProductID = pr.ProductID
                    ${outWhere.length ? 'WHERE ' + outWhere.join(' AND ') : ''}
                    GROUP BY DATE(s.SaleDate)
                    ORDER BY DATE(s.SaleDate)
                `, outParams);
                const dates = outRows.map(r => r.date);
                lineData.dates = dates;
                lineData.out = outRows.map(r => Number(r.outQty));

                // 柱状图
                const [barRows] = await pool.query(`
                    SELECT pr.ProductName, SUM(sd.Quantity) as outQty
                    FROM saledetail sd
                    JOIN sale s ON sd.SaleID = s.SaleID
                    LEFT JOIN product pr ON sd.ProductID = pr.ProductID
                    ${outWhere.length ? 'WHERE ' + outWhere.join(' AND ') : ''}
                    GROUP BY pr.ProductName
                    ORDER BY outQty DESC
                `, outParams);
                barData.products = barRows.map(r => r.ProductName);
                barData.out = barRows.map(r => Number(r.outQty));

                // 饼图：使用商品名
                pieData.products = barRows.map(r => ({
                    name: r.ProductName,
                    value: Number(r.outQty)
                }));
            }
        }

        // 返回所有图表数据
        res.json({
            line: lineData,
            bar: barData,
            pie: pieData
        });

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
