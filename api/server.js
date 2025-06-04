const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();

// 设置静态文件目录
app.use(express.static(path.join(__dirname, '..'))); // 使用项目根目录作为静态文件目录

app.use(cors());
app.use(express.json());

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'supermarket_db',
    port: 3306
};

// 修改连接池配置
const pool = mysql.createPool(dbConfig);

// 修改普通连接配置
const connection = mysql.createConnection(dbConfig);

// 改进数据库连接处理
connection.connect(error => {
    if (error) {
        console.error('Error connecting to the database:', error);
        return;
    }
    console.log("Successfully connected to the database.");
});

// 添加连接错误处理
connection.on('error', function(err) {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection was closed. Reconnecting...');
        handleDisconnect();
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
        console.log('Database has too many connections.');
    } else if (err.code === 'ECONNREFUSED') {
        console.log('Database connection was refused.');
    } else {
        console.log('Unknown database error:', err);
    }
});

// 处理断开连接的情况
function handleDisconnect() {
    connection.connect(function(err) {
        if(err) {
            console.log('Error when connecting to database:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });
}

// 记录操作日志的工具函数
async function logOperation(userId, username, operation, module, details, req) {
    try {
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        const query = `
            INSERT INTO OperationLogs 
            (UserID, Username, Operation, Module, Details, IPAddress)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await pool.promise().query(query, [
            userId, 
            username, 
            operation, 
            module, 
            details, 
            ipAddress
        ]);
        
        console.log(`操作日志已记录: ${username} - ${operation}`);
    } catch (error) {
        console.error('记录操作日志失败:', error);
    }
}

// API路由
// 获取所有商品
app.get('/api/products', (req, res) => {
    pool.query('SELECT * FROM Product', (error, results) => {
        if (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: '数据库错误' });
            return;
        }
        res.json(results);
    });
});

// 获取所有客户
app.get('/api/customers', (req, res) => {
    pool.query('SELECT * FROM Customer', (error, results) => {
        if (error) {
            console.error('Error fetching customers:', error);
            res.status(500).json({ error: '数据库错误' });
            return;
        }
        res.json(results);
    });
});

// 获取所有供应商
app.get('/api/suppliers', (req, res) => {
    pool.query('SELECT * FROM Supplier', (error, results) => {
        if (error) {
            console.error('Error fetching suppliers:', error);
            res.status(500).json({ error: '数据库错误' });
            return;
        }
        res.json(results);
    });
});

// 添加新商品
app.post('/api/products', async (req, res) => {
    const { ProductName, Category, Price, PurchasePrice, StockQuantity } = req.body;
    
    try {
        const query = `
            INSERT INTO Product 
            (ProductName, Category, Price, PurchasePrice, StockQuantity) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.promise().query(query, [ProductName, Category, Price, PurchasePrice, StockQuantity]);
        
        // 记录操作日志
        if (req.body.currentUser) {
            await logOperation(
                req.body.currentUser.userId,
                req.body.currentUser.username,
                '添加商品',
                '基础信息管理',
                `添加商品: ${ProductName}, 类别: ${Category}, 价格: ${Price}`,
                req
            );
        }
        
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: '添加商品失败' });
    }
});

// 添加新销售记录
app.post('/api/sales', async (req, res) => {
    const { customerId, employeeId, paymentMethod, totalAmount, discountAmount, finalAmount, items } = req.body;

    // 开始事务
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            res.status(500).json({ error: '数据库连接失败' });
            return;
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                res.status(500).json({ error: '开始事务失败' });
                return;
            }

            try {
                // 插入销售主表
                const [saleResult] = await connection.promise().query(
                    `INSERT INTO Sale 
                    (CustomerID, EmployeeID, SaleDate, PaymentMethod, TotalAmount, DiscountAmount, FinalAmount) 
                    VALUES (?, ?, NOW(), ?, ?, ?, ?)`,
                    [customerId, employeeId, paymentMethod, totalAmount, discountAmount, finalAmount]
                );

                const saleId = saleResult.insertId;

                // 插入销售明细并更新库存
                for (const item of items) {
                    // 插入销售明细
                    await connection.promise().query(
                        `INSERT INTO SaleDetail 
                        (SaleID, ProductID, Quantity, Price, Subtotal) 
                        VALUES (?, ?, ?, ?, ?)`,
                        [saleId, item.productId, item.quantity, item.price, item.subtotal]
                    );

                    // 更新库存
                    await connection.promise().query(
                        'UPDATE Product SET StockQuantity = StockQuantity - ? WHERE ProductID = ?',
                        [item.quantity, item.productId]
                    );
                }

                await connection.promise().commit();
                res.json({ success: true, saleId });
            } catch (error) {
                await connection.promise().rollback();
                console.error('Error creating sale:', error);
                res.status(500).json({ error: '创建销售订单失败' });
            } finally {
                connection.release();
            }
        });
    });
});

// 删除商品
app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    
    try {
        // 获取商品信息用于日志记录
        const [products] = await pool.promise().query('SELECT * FROM Product WHERE ProductID = ?', [productId]);
        const product = products[0];
        
        const query = 'DELETE FROM Product WHERE ProductID = ?';
        await pool.promise().query(query, [productId]);
        
        // 记录操作日志
        const currentUser = req.query.currentUser ? JSON.parse(req.query.currentUser) : null;
        if (currentUser) {
            await logOperation(
                currentUser.userId,
                currentUser.username,
                '删除商品',
                '基础信息管理',
                `删除商品ID: ${productId}, 名称: ${product ? product.ProductName : '未知'}`,
                req
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: '删除商品失败' });
    }
});

// 更新商品信息
app.put('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const { ProductName, Category, Price, PurchasePrice, StockQuantity, currentUser } = req.body;
    
    try {
        const query = `
            UPDATE Product 
            SET ProductName = ?, 
                Category = ?, 
                Price = ?, 
                PurchasePrice = ?, 
                StockQuantity = ? 
            WHERE ProductID = ?
        `;
        
        await pool.promise().query(query, [ProductName, Category, Price, PurchasePrice, StockQuantity, productId]);
        
        // 记录操作日志
        if (currentUser) {
            await logOperation(
                currentUser.userId,
                currentUser.username,
                '更新商品',
                '基础信息管理',
                `更新商品ID: ${productId}, 名称: ${ProductName}, 价格: ${Price}`,
                req
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: '更新商品失败' });
    }
});

// 获取单个商品信息
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'SELECT * FROM Product WHERE ProductID = ?';
    pool.query(query, [productId], (error, results) => {
        if (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(results[0]);
    });
});

// 修改仪表板数据获取接口
app.get('/api/dashboard', async (req, res) => {
    try {
        // 使用 Promise.all 并行执行所有查询
        const [todaySales, monthSales, lowStockCount, customerCount] = await Promise.all([
            // 今日销售额 - 从Sale表获取今日的FinalAmount总和
            pool.promise().query(`
                SELECT COALESCE(SUM(FinalAmount), 0) as total 
                FROM Sale 
                WHERE DATE(SaleDate) = CURRENT_DATE()
            `),
            
            // 本月销售额 - 从Sale表获取本月的FinalAmount总和
            pool.promise().query(`
                SELECT COALESCE(SUM(FinalAmount), 0) as total 
                FROM Sale 
                WHERE DATE(SaleDate) >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
            `),
            
            // 库存预警数量 - 从Product表获取库存低于50的商品数量
            pool.promise().query(`
                SELECT COUNT(*) as count 
                FROM Product 
                WHERE StockQuantity < 50
            `),
            
            // 会员总数 - 只统计VIP会员
            pool.promise().query(`
                SELECT COUNT(*) as count 
                FROM Customer
                WHERE VIPStatus = true
            `)
        ]);

        // 格式化返回数据
        res.json({
            todaySales: parseFloat(todaySales[0][0].total) || 0,
            monthSales: parseFloat(monthSales[0][0].total) || 0,
            lowStockCount: parseInt(lowStockCount[0][0].count) || 0,
            customerCount: parseInt(customerCount[0][0].count) || 0
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 员工相关API
app.get('/api/employees', (req, res) => {
    pool.query('SELECT * FROM Employee', (error, results) => {
        if (error) {
            console.error('Error fetching employees:', error);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});


app.post('/api/employees', (req, res) => {
    const { EmployeeName, Position, Salary, HireDate, PhoneNumber } = req.body;
    const query = 'INSERT INTO Employee (EmployeeName, Position, Salary, HireDate, PhoneNumber) VALUES (?, ?, ?, ?, ?)';
    pool.query(query, [EmployeeName, Position, Salary, HireDate, PhoneNumber], (error, results) => {
        if (error) {
            console.error('Error creating employee:', error);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ success: true, id: results.insertId });
    });
});

app.put('/api/employees/:id', (req, res) => {
    const employeeId = req.params.id;
    const { EmployeeName, Position, Salary, HireDate, PhoneNumber } = req.body;
    const query = 'UPDATE Employee SET EmployeeName = ?, Position = ?, Salary = ?, HireDate = ?, PhoneNumber = ? WHERE EmployeeID = ?';
    pool.query(query, [EmployeeName, Position, Salary, HireDate, PhoneNumber, employeeId], (error, results) => {
        if (error) {
            console.error('Error updating employee:', error);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ success: true });
    });
});

app.delete('/api/employees/:id', (req, res) => {
    const employeeId = req.params.id;
    const query = 'DELETE FROM Employee WHERE EmployeeID = ?';
    pool.query(query, [employeeId], (error, results) => {
        if (error) {
            console.error('Error deleting employee:', error);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ success: true });
    });
});

// 获取单个员工信息
app.get('/api/employees/:id', (req, res) => {
    const employeeId = req.params.id;
    const query = 'SELECT * FROM Employee WHERE EmployeeID = ?';
    pool.query(query, [employeeId], (error, results) => {
        if (error) {
            console.error('Error fetching employee:', error);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }
        res.json(results[0]);
    });
});

// 客户相关API
app.post('/api/customers', (req, res) => {
    const { CustomerName, PhoneNumber, Email, VIPStatus } = req.body;
    
    // 验证必要字段
    if (!CustomerName || !PhoneNumber) {
        res.status(400).json({ error: '客户名称和电话号码为必填项' });
        return;
    }

    const query = 'INSERT INTO Customer (CustomerName, PhoneNumber, Email, VIPStatus) VALUES (?, ?, ?, ?)';
    pool.query(
        query, 
        [CustomerName, PhoneNumber, Email, VIPStatus],
        (error, results) => {
            if (error) {
                console.error('Error creating customer:', error);
                res.status(500).json({ error: '数据库错误: ' + error.message });
                return;
            }
            res.json({ success: true, id: results.insertId });
        }
    );
});

app.put('/api/customers/:id', (req, res) => {
    const customerId = req.params.id;
    const { CustomerName, PhoneNumber, Email, VIPStatus } = req.body;
    const query = 'UPDATE Customer SET CustomerName = ?, PhoneNumber = ?, Email = ?, VIPStatus = ? WHERE CustomerID = ?';
    pool.query(query, [CustomerName, PhoneNumber, Email, VIPStatus, customerId], (error, results) => {
        if (error) {
            console.error('Error updating customer:', error);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ success: true });
    });
});

app.delete('/api/customers/:id', (req, res) => {
    const customerId = req.params.id;
    const query = 'DELETE FROM Customer WHERE CustomerID = ?';
    pool.query(query, [customerId], (error, results) => {
        if (error) {
            console.error('Error deleting customer:', error);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ success: true });
    });
});

// 获取单个客户信息
app.get('/api/customers/:id', (req, res) => {
    const customerId = req.params.id;
    const query = 'SELECT * FROM Customer WHERE CustomerID = ?';
    pool.query(query, [customerId], (error, results) => {
        if (error) {
            console.error('Error fetching customer:', error);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json(results[0]);
    });
});

// 供应商相关API
app.post('/api/suppliers', (req, res) => {
    const { SupplierName, ContactPerson, PhoneNumber, Address } = req.body;
    
    if (!SupplierName) {
        res.status(400).json({ error: '供应商名称不能为空' });
        return;
    }

    const query = `
        INSERT INTO Supplier (SupplierName, ContactPerson, PhoneNumber, Address) 
        VALUES (?, ?, ?, ?)
    `;
    
    pool.query(query, [SupplierName, ContactPerson, PhoneNumber, Address], (error, results) => {
        if (error) {
            console.error('Error adding supplier:', error);
            res.status(500).json({ error: '添加供应商失败' });
            return;
        }
        res.json({ success: true, id: results.insertId });
    });
});

app.put('/api/suppliers/:id', (req, res) => {
    const supplierId = req.params.id;
    const { SupplierName, ContactPerson, PhoneNumber, Address } = req.body;
    
    const query = `
        UPDATE Supplier 
        SET SupplierName = ?, 
            ContactPerson = ?, 
            PhoneNumber = ?, 
            Address = ?
        WHERE SupplierID = ?
    `;
    
    pool.query(query, [SupplierName, ContactPerson, PhoneNumber, Address, supplierId], 
        (error, results) => {
            if (error) {
                console.error('Error updating supplier:', error);
                res.status(500).json({ error: '更新供应商失败' });
                return;
            }
            res.json({ success: true });
        });
});

app.delete('/api/suppliers/:id', (req, res) => {
    const supplierId = req.params.id;
    
    const query = 'DELETE FROM Supplier WHERE SupplierID = ?';
    
    pool.query(query, [supplierId], (error, results) => {
        if (error) {
            console.error('Error deleting supplier:', error);
            res.status(500).json({ error: '删除供应商失败' });
            return;
        }
        res.json({ success: true });
    });
});

// 添加进货记录
app.post('/api/purchases', async (req, res) => {
    const purchases = req.body;
    
    // 开始事务
    pool.getConnection(async (err, connection) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ error: '数据库错误' });
        }

        try {
            for (const purchase of purchases) {
                // 插入进货记录
                await new Promise((resolve, reject) => {
                    const query = `
                        INSERT INTO Purchase 
                        (ProductID, SupplierID, Quantity, PurchasePrice, TotalAmount) 
                        VALUES (?, ?, ?, ?, ?)
                    `;
                    connection.query(
                        query,
                        [purchase.ProductID, purchase.SupplierID, purchase.Quantity, 
                         purchase.PurchasePrice, purchase.TotalAmount],
                        (error, results) => {
                            if (error) reject(error);
                            else resolve(results);
                        }
                    );
                });

                // 更新库存
                await new Promise((resolve, reject) => {
                    const query = `
                        UPDATE Product 
                        SET StockQuantity = StockQuantity + ? 
                        WHERE ProductID = ?
                    `;
                    connection.query(
                        query,
                        [purchase.Quantity, purchase.ProductID],
                        (error, results) => {
                            if (error) reject(error);
                            else resolve(results);
                        }
                    );
                });
            }

            // 提交事务
            connection.commit(err => {
                if (err) {
                    console.error('Error committing transaction:', err);
                    connection.rollback(() => {
                        res.status(500).json({ error: '数据库错误' });
                    });
                    return;
                }
                res.json({ success: true });
            });
        } catch (error) {
            console.error('Error processing purchase:', error);
            connection.rollback(() => {
                res.status(500).json({ error: '数据库错误' });
            });
        } finally {
            connection.release();
        }
    });
});

// 查询进货记录
app.post('/api/purchases/query', (req, res) => {
    let query = `
        SELECT 
            p.PurchaseID,
            pr.ProductName,
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

    pool.query(query, [], (error, results) => {
        if (error) {
            console.error('Error querying purchases:', error);
            res.status(500).json({ error: '数据库错误' });
            return;
        }

        const formattedResults = results.map(record => ({
            ...record,
            ProductName: record.ProductName || '已删除商品',
            SupplierName: record.SupplierName || '已删除供应商',
            PurchasePrice: parseFloat(record.PurchasePrice).toFixed(2),
            TotalAmount: parseFloat(record.TotalAmount).toFixed(2),
            PurchaseDate: new Date(record.PurchaseDate).toLocaleString()
        }));

        res.json(formattedResults);
    });
});

// 修改入库记录查询接口
app.get('/api/purchases/query', (req, res) => {
    const { startDate, endDate, supplierID } = req.query;
    
    // 构建基础查询
    let query = `
        SELECT 
            p.PurchaseID,
            pr.ProductName,
            s.SupplierName,
            p.Quantity,
            CAST(p.PurchasePrice AS DECIMAL(10,2)) as PurchasePrice,
            CAST(p.TotalAmount AS DECIMAL(10,2)) as TotalAmount,
            p.PurchaseDate
        FROM Purchase p
        LEFT JOIN Product pr ON p.ProductID = pr.ProductID
        LEFT JOIN Supplier s ON p.SupplierID = s.SupplierID
        WHERE 1=1
    `;
    
    const queryParams = [];

    // 添加日期围条件
    if (startDate) {
        query += ` AND DATE(p.PurchaseDate) >= ?`;
        queryParams.push(startDate);
    }
    if (endDate) {
        query += ` AND DATE(p.PurchaseDate) <= ?`;
        queryParams.push(endDate);
    }

    // 添加供应商条件
    if (supplierID) {
        query += ` AND p.SupplierID = ?`;
        queryParams.push(supplierID);
    }

    // 按日期降序排序
    query += ` ORDER BY p.PurchaseDate DESC`;

    // 执行查询
    pool.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Error querying purchases:', error);
            res.status(500).json({ error: '查询入库记录失败' });
            return;
        }

        // 格式化数据
        const formattedResults = results.map(record => ({
            ...record,
            ProductName: record.ProductName || '已删除商品',
            SupplierName: record.SupplierName || '已删除供应商',
            PurchasePrice: Number(record.PurchasePrice),
            TotalAmount: Number(record.TotalAmount),
            PurchaseDate: record.PurchaseDate
        }));

        res.json(formattedResults);
    });
});

// 获取单个供应商信息
app.get('/api/suppliers/:id', (req, res) => {
    const supplierId = req.params.id;
    const query = 'SELECT * FROM Supplier WHERE SupplierID = ?';
    
    pool.query(query, [supplierId], (error, results) => {
        if (error) {
            console.error('Error fetching supplier:', error);
            res.status(500).json({ error: '数据库错误' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: '供应商不存在' });
            return;
        }
        res.json(results[0]);
    });
});

// 获取库统计数据
app.get('/api/warehouse/stats', (req, res) => {
    Promise.all([
        pool.promise().query('SELECT COUNT(*) as count FROM Product'),
        pool.promise().query('SELECT COUNT(*) as count FROM Product WHERE StockQuantity < 10'),
        pool.promise().query('SELECT SUM(StockQuantity * PurchasePrice) as total FROM Product'),
        pool.promise().query(`
            SELECT COUNT(*) as count 
            FROM Purchase 
            WHERE DATE_FORMAT(PurchaseDate, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
        `)
    ])
    .then(([[totalProducts], [lowStock], [totalValue], [monthlyPurchases]]) => {
        res.json({
            totalProducts: totalProducts[0].count,
            lowStockProducts: lowStock[0].count,
            totalValue: totalValue[0].total || 0,
            monthlyPurchases: monthlyPurchases[0].count
        });
    })
    .catch(error => {
        console.error('Error getting warehouse stats:', error);
        res.status(500).json({ error: '获取存统计数据失败' });
    });
});

// 获取商品类别列表
app.get('/api/products/categories', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT Category 
            FROM Product 
            WHERE Category IS NOT NULL AND Category != ''
            ORDER BY Category
        `;
        
        const [results] = await pool.promise().query(query);
        
        // 确保返回的是正确的格式
        const categories = results.map(row => ({
            Category: row.Category
        }));
        
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        // 返回空数组而不是错误，这样前端仍然可以继续运行
        res.json([]);
    }
});

// 修改搜索库存接口
app.post('/api/warehouse/search', async (req, res) => {
    try {
        const { productName, category, stockStatus } = req.body;
        
        let query = `
            SELECT 
                p.ProductID,
                p.ProductName,
                p.Category,
                p.Price,
                p.PurchasePrice,
                p.StockQuantity
            FROM Product p
            WHERE 1=1
        `;
        
        const params = [];

        // 添加商品名称搜索条件
        if (productName) {
            query += ` AND p.ProductName LIKE ?`;
            params.push(`%${productName}%`);
        }

        // 添加类别搜索条件
        if (category) {
            query += ` AND p.Category = ?`;
            params.push(category);
        }

        // 修改库存状态搜索条件
        if (stockStatus) {
            switch (stockStatus) {
                case 'low':
                    query += ` AND p.StockQuantity < 10`;
                    break;
                case 'warning':
                    query += ` AND p.StockQuantity >= 10 AND p.StockQuantity <= 50`;
                    break;
                case 'normal':
                    query += ` AND p.StockQuantity > 50 AND p.StockQuantity <= 500`;
                    break;
                case 'high':
                    query += ` AND p.StockQuantity > 500`;
                    break;
            }
        }

        // 按商品ID排序
        query += ` ORDER BY p.ProductID`;

        // 执行查询
        const [results] = await pool.promise().query(query, params);

        // 返回结果
        res.json(results);

    } catch (error) {
        console.error('Error searching inventory:', error);
        res.status(500).json({ 
            error: '查询库存失败',
            details: error.message 
        });
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Registered routes:');
    app._router.stack.forEach(function(r){
        if (r.route && r.route.path){
            console.log(r.route.path)
        }
    });
});

// 获取点单号
app.get('/api/stockcheck/newno', (req, res) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const checkNo = `PD${year}${month}${day}${random}`;
    res.json({ checkNo });
});

// 获取所有商品的当前库存
app.get('/api/stockcheck/products', (req, res) => {
    const query = `
        SELECT 
            p.ProductID,
            p.ProductName,
            p.Category,
            p.StockQuantity,
            s.SupplierName
        FROM Product p
        LEFT JOIN Supplier s ON p.SupplierID = s.SupplierID
        ORDER BY p.ProductID
    `;

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error getting products for stock check:', error);
            res.status(500).json({ error: '获取商品库存数据失败' });
            return;
        }
        res.json(results);
    });
});

// 保存盘点草稿
app.post('/api/stockcheck/draft', (req, res) => {
    const { checkNo, employeeId, note, details } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            res.status(500).json({ error: '数据库连接失败' });
            return;
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                res.status(500).json({ error: '开始事务失败' });
                return;
            }

            try {
                // 插入盘点主表
                const [checkResult] = await connection.promise().query(
                    'INSERT INTO StockCheck (CheckNo, CheckDate, EmployeeID, Status, Note) VALUES (?, CURDATE(), ?, "draft", ?)',
                    [checkNo, employeeId, note]
                );

                const checkId = checkResult.insertId;

                // 插入盘点明细
                for (const detail of details) {
                    await connection.promise().query(
                        `INSERT INTO StockCheckDetail 
                        (CheckID, ProductID, SystemStock, ActualStock, DifferenceQty, DifferenceReason)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            checkId,
                            detail.productId,
                            detail.systemStock,
                            detail.actualStock,
                            detail.differenceQty,
                            detail.differenceReason
                        ]
                    );
                }

                await connection.promise().commit();
                res.json({ success: true, checkId });
            } catch (error) {
                await connection.promise().rollback();
                console.error('Error saving stock check draft:', error);
                res.status(500).json({ error: '保存盘点草稿失败' });
            } finally {
                connection.release();
            }
        });
    });
});

// 提交盘点
app.post('/api/stockcheck/submit', (req, res) => {
    const { checkNo, employeeId, note, details } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            res.status(500).json({ error: '数据库连接失败' });
            return;
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                res.status(500).json({ error: '开始事务失败' });
                return;
            }

            try {
                // 插入盘点主表
                const [checkResult] = await connection.promise().query(
                    'INSERT INTO StockCheck (CheckNo, CheckDate, EmployeeID, Status, Note) VALUES (?, CURDATE(), ?, "submitted", ?)',
                    [checkNo, employeeId, note]
                );

                const checkId = checkResult.insertId;

                // 插入盘点明细并更新库存
                for (const detail of details) {
                    // 插入盘点明细
                    await connection.promise().query(
                        `INSERT INTO StockCheckDetail 
                        (CheckID, ProductID, SystemStock, ActualStock, DifferenceQty, DifferenceReason)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            checkId,
                            detail.productId,
                            detail.systemStock,
                            detail.actualStock,
                            detail.differenceQty,
                            detail.differenceReason
                        ]
                    );

                    // 更新商品库存
                    await connection.promise().query(
                        'UPDATE Product SET StockQuantity = ? WHERE ProductID = ?',
                        [detail.actualStock, detail.productId]
                    );
                }

                await connection.promise().commit();
                res.json({ success: true, checkId });
            } catch (error) {
                await connection.promise().rollback();
                console.error('Error submitting stock check:', error);
                res.status(500).json({ error: '提交盘点失败' });
            } finally {
                connection.release();
            }
        });
    });
});

// 获取最近的盘点记录
app.get('/api/stockcheck/recent', (req, res) => {
    const query = `
        SELECT 
            sc.CheckID,
            sc.CheckNo,
            sc.CheckDate,
            sc.Status,
            e.EmployeeName,
            SUM(scd.DifferenceQty) as DifferenceQty
        FROM StockCheck sc
        JOIN Employee e ON sc.EmployeeID = e.EmployeeID
        LEFT JOIN StockCheckDetail scd ON sc.CheckID = scd.CheckID
        GROUP BY sc.CheckID
        ORDER BY sc.CheckDate DESC
        LIMIT 10
    `;

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching recent stock checks:', error);
            res.status(500).json({ error: '获取盘点记录失败' });
            return;
        }
        res.json(results);
    });
});

// 获取库存预警信息
app.get('/api/warehouse/warnings', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.ProductID,
                p.ProductName,
                p.Category,
                p.StockQuantity,
                CASE
                    WHEN p.StockQuantity < 10 THEN '库存不足'
                    WHEN p.StockQuantity >= 10 AND p.StockQuantity <= 50 THEN '库存预警'
                    WHEN p.StockQuantity > 50 AND p.StockQuantity <= 500 THEN '库存正常'
                    ELSE '库存充足'
                END as Status
            FROM Product p
            WHERE p.StockQuantity < 50
            ORDER BY p.StockQuantity ASC
        `;

        const [results] = await pool.promise().query(query);
        res.json(results);
    } catch (error) {
        console.error('Error getting stock warnings:', error);
        res.status(500).json({ error: '获取库存预警信息失败' });
    }
});

// 获取库存数据
app.get('/api/warehouse/inventory', (req, res) => {
    const query = `
        SELECT 
            p.ProductID,
            p.ProductName,
            p.Category,
            p.Price,
            p.PurchasePrice,
            p.StockQuantity
        FROM Product p
        ORDER BY p.ProductID
    `;
    
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching inventory:', error);
            res.status(500).json({ error: '获取库存数据失败' });
            return;
        }
        res.json(results);
    });
});

// 获取盘点详情
app.get('/api/stockcheck/detail/:checkNo', async (req, res) => {
    const checkNo = req.params.checkNo;
    
    try {
        // 获取盘点主表信息
        const [checkInfo] = await pool.promise().query(`
            SELECT 
                sc.CheckID,
                sc.CheckNo,
                sc.CheckDate,
                sc.Status,
                sc.Note,
                e.EmployeeName
            FROM StockCheck sc
            JOIN Employee e ON sc.EmployeeID = e.EmployeeID
            WHERE sc.CheckNo = ?
        `, [checkNo]);

        if (checkInfo.length === 0) {
            res.status(404).json({ error: '盘点记录不存在' });
            return;
        }

        // 获取盘点明细
        const [items] = await pool.promise().query(`
            SELECT 
                scd.*,
                p.ProductName
            FROM StockCheckDetail scd
            JOIN Product p ON scd.ProductID = p.ProductID
            WHERE scd.CheckID = ?
        `, [checkInfo[0].CheckID]);

        // 组合返回数据
        const result = {
            checkNo: checkInfo[0].CheckNo,
            checkDate: checkInfo[0].CheckDate,
            status: checkInfo[0].Status,
            employeeName: checkInfo[0].EmployeeName,
            note: checkInfo[0].Note,
            items: items.map(item => ({
                productName: item.ProductName,
                systemStock: item.SystemStock,
                actualStock: item.ActualStock,
                differenceQty: item.DifferenceQty,
                differenceReason: item.DifferenceReason
            }))
        };

        res.json(result);
    } catch (error) {
        console.error('Error fetching check detail:', error);
        res.status(500).json({ error: '获取盘点详情失败' });
    }
});

// 修改销售订单提交接口
app.post('/api/sales/submit', async (req, res) => {
    const { customerId, employeeId, totalAmount, discountAmount, finalAmount, items } = req.body;

    // 输入验证
    if (!customerId || !employeeId || !items || items.length === 0) {
        res.status(400).json({ error: '缺少要的订单信息' });
        return;
    }

    // 开始事务
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            res.status(500).json({ error: '数据库连接失败' });
            return;
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                res.status(500).json({ error: '开始事务失败' });
                return;
            }

            try {
                // 验证客户是否存在
                const [customerResult] = await connection.promise().query(
                    'SELECT CustomerID FROM Customer WHERE CustomerID = ?',
                    [customerId]
                );

                if (customerResult.length === 0) {
                    throw new Error('客户不存在');
                }

                // 验证员工是否存在
                const [employeeResult] = await connection.promise().query(
                    'SELECT EmployeeID FROM Employee WHERE EmployeeID = ?',
                    [employeeId]
                );

                if (employeeResult.length === 0) {
                    throw new Error('员工不存在');
                }

                // 插入销售主表
                const [saleResult] = await connection.promise().query(
                    `INSERT INTO Sale 
                    (CustomerID, EmployeeID, SaleDate, TotalAmount, DiscountAmount, FinalAmount) 
                    VALUES (?, ?, NOW(), ?, ?, ?)`,
                    [customerId, employeeId, totalAmount, discountAmount, finalAmount]
                );

                const saleId = saleResult.insertId;

                // 插入销售明细并更新库存
                for (const item of items) {
                    // 检查库存是否足够
                    const [stockResult] = await connection.promise().query(
                        'SELECT ProductID, ProductName, StockQuantity FROM Product WHERE ProductID = ?',
                        [item.productId]
                    );

                    if (stockResult.length === 0) {
                        throw new Error(`商品ID ${item.productId} 不存在`);
                    }

                    if (stockResult[0].StockQuantity < item.quantity) {
                        throw new Error(`商品 ${stockResult[0].ProductName} 库存不足，当前库存: ${stockResult[0].StockQuantity}`);
                    }

                    // 插入销售明细
                    await connection.promise().query(
                        `INSERT INTO SaleDetail 
                        (SaleID, ProductID, Quantity, Price, Subtotal) 
                        VALUES (?, ?, ?, ?, ?)`,
                        [saleId, item.productId, item.quantity, item.price, item.subtotal]
                    );

                    // 更新库存
                    await connection.promise().query(
                        'UPDATE Product SET StockQuantity = StockQuantity - ? WHERE ProductID = ?',
                        [item.quantity, item.productId]
                    );
                }

                await connection.promise().commit();
                res.json({ success: true, saleId });
            } catch (error) {
                await connection.promise().rollback();
                console.error('Error creating sale:', error);
                res.status(400).json({ error: error.message || '创建销售订单失败' });
            } finally {
                connection.release();
            }
        });
    });
});

// 修改销售查询接口
app.get('/api/sales/query', async (req, res) => {
    try {
        console.log('Received query params:', req.query);  // 添加日志
        
        let query = `
            SELECT DISTINCT
                s.SaleID,
                c.CustomerName,
                e.EmployeeName,
                s.SaleDate,
                s.TotalAmount,
                COALESCE(s.DiscountAmount, 0) as DiscountAmount,
                s.FinalAmount,
                NOT EXISTS (
                    SELECT 1 
                    FROM SaleReturn sr 
                    WHERE sr.SaleID = s.SaleID
                ) as CanReturn
            FROM Sale s
            LEFT JOIN Customer c ON s.CustomerID = c.CustomerID
            LEFT JOIN Employee e ON s.EmployeeID = e.EmployeeID
            WHERE 1=1
            AND NOT EXISTS (
                SELECT 1 
                FROM SaleReturn sr 
                WHERE sr.SaleID = s.SaleID
            )
        `;
        
        const params = [];
        
        if (req.query.saleId) {
            query += ' AND s.SaleID = ?';
            params.push(req.query.saleId);
        }
        
        if (req.query.customerId) {
            query += ' AND s.CustomerID = ?';
            params.push(req.query.customerId);
        }
        
        if (req.query.startDate) {
            query += ' AND DATE(s.SaleDate) >= ?';
            params.push(req.query.startDate);
        }
        
        if (req.query.endDate) {
            query += ' AND DATE(s.SaleDate) <= ?';
            params.push(req.query.endDate);
        }
        
        if (req.query.employeeId) {
            query += ' AND s.EmployeeID = ?';
            params.push(req.query.employeeId);
        }
        
        query += ' ORDER BY s.SaleDate DESC';
        
        console.log('Executing query:', query, params);  // 添加日志
        
        const [results] = await pool.promise().query(query, params);
        console.log('Query results:', results);  // 添加日志
        
        // 格式化数字字段
        const formattedResults = results.map(row => ({
            ...row,
            TotalAmount: parseFloat(row.TotalAmount || 0),
            DiscountAmount: parseFloat(row.DiscountAmount || 0),
            FinalAmount: parseFloat(row.FinalAmount || 0),
            SaleDate: row.SaleDate
        }));
        
        res.json(formattedResults);
    } catch (error) {
        console.error('Error querying sales:', error);
        res.status(500).json({ 
            error: '查询销售记录失败',
            details: error.message,
            stack: error.stack
        });
    }
});

// 获取退货记录
app.get('/api/sales/returns', async (req, res) => {
    try {
        console.log('[Debug] 接收到退货记录查询请求, 参数:', req.query);
        
        let query = `
            SELECT 
                sr.ReturnID,
                sr.SaleID,
                DATE_FORMAT(sr.ReturnDate, '%Y-%m-%d %H:%i:%s') as ReturnDate,
                sr.Reason,
                sr.Quantity,
                COALESCE(c.CustomerName, '未知客户') as CustomerName,
                (
                    SELECT COALESCE(SUM(srd.Price * srd.Quantity), 0)
                    FROM SaleReturnDetail srd
                    WHERE srd.ReturnID = sr.ReturnID
                ) as TotalAmount
            FROM SaleReturn sr
            LEFT JOIN Sale s ON sr.SaleID = s.SaleID
            LEFT JOIN Customer c ON s.CustomerID = c.CustomerID
            WHERE 1=1
        `;

        const params = [];

        // 添加销售单号查询条件
        if (req.query.saleId) {
            query += ' AND sr.SaleID = ?';
            params.push(req.query.saleId);
        }

        // 添加客户查询条件
        if (req.query.customerId) {
            query += ' AND s.CustomerID = ?';
            params.push(req.query.customerId);
        }

        // 添加日期范围查询条件
        if (req.query.startDate) {
            query += ' AND DATE(sr.ReturnDate) >= ?';
            params.push(req.query.startDate);
        }
        if (req.query.endDate) {
            query += ' AND DATE(sr.ReturnDate) <= ?';
            params.push(req.query.endDate);
        }

        // 按退货日期降序排序
        query += ' ORDER BY sr.ReturnDate DESC';

        console.log('[Debug] 执行查询:', query, params);

        const [returns] = await pool.promise().query(query, params);
        console.log('[Debug] 查询到的退货记录数:', returns.length);
        
        const formattedReturns = returns.map(record => ({
            ReturnID: record.ReturnID,
            SaleID: record.SaleID,
            ReturnDate: record.ReturnDate,
            Reason: record.Reason,
            Quantity: parseInt(record.Quantity),
            CustomerName: record.CustomerName,
            TotalAmount: parseFloat(record.TotalAmount)
        }));

        res.json(formattedReturns);
        
    } catch (error) {
        console.error('[Debug] 获取退货记录失败:', error);
        res.status(500).json({
            error: '获取退货记录失败',
            message: error.message
        });
    }
});

// 获取销售订单详情
app.get('/api/sales/:id', async (req, res) => {
    try {
        const saleId = req.params.id;
        
        // 获取销售主表信息
        const [saleInfo] = await pool.promise().query(`
            SELECT 
                s.SaleID,
                s.SaleDate,
                s.TotalAmount,
                COALESCE(s.DiscountAmount, 0) as DiscountAmount,
                s.FinalAmount,
                c.CustomerName,
                e.EmployeeName
            FROM Sale s
            LEFT JOIN Customer c ON s.CustomerID = c.CustomerID
            LEFT JOIN Employee e ON s.EmployeeID = e.EmployeeID
            WHERE s.SaleID = ?
        `, [saleId]);

        if (!saleInfo || saleInfo.length === 0) {
            return res.status(404).json({ error: '销售订单不存在' });
        }

        // 获取销售明细
        const [items] = await pool.promise().query(`
            SELECT 
                sd.DetailID,
                sd.ProductID,
                p.ProductName,
                p.Category,
                sd.Price,
                sd.Quantity,
                sd.Subtotal
            FROM SaleDetail sd
            LEFT JOIN Product p ON sd.ProductID = p.ProductID
            WHERE sd.SaleID = ?
            ORDER BY sd.DetailID
        `, [saleId]);

        // 添加测试日志
        console.log('Sale Info:', saleInfo[0]);
        console.log('Sale Items:', items);

        // 组合返回数据
        const result = {
            SaleID: saleInfo[0].SaleID,
            SaleDate: saleInfo[0].SaleDate,
            TotalAmount: parseFloat(saleInfo[0].TotalAmount || 0),
            DiscountAmount: parseFloat(saleInfo[0].DiscountAmount || 0),
            FinalAmount: parseFloat(saleInfo[0].FinalAmount || 0),
            CustomerName: saleInfo[0].CustomerName,
            EmployeeName: saleInfo[0].EmployeeName,
            items: items.map(item => ({
                DetailID: item.DetailID,
                ProductID: item.ProductID,
                ProductName: item.ProductName || '未知商品',
                Category: item.Category || '未分类',
                Price: parseFloat(item.Price || 0),
                Quantity: parseInt(item.Quantity || 0),
                Subtotal: parseFloat(item.Subtotal || 0)
            }))
        };

        res.json(result);
    } catch (error) {
        console.error('Error fetching sale details:', error);
        res.status(500).json({ 
            error: '获取销售详情失败',
            message: error.message,
            stack: error.stack // 添加错误堆栈息以便调试
        });
    }
});

// 提交退货申请
app.post('/api/sales/return', async (req, res) => {
    const conn = await pool.promise().getConnection();
    try {
        await conn.beginTransaction();
        
        const { saleId, items, reason } = req.body;
        console.log('Received return request:', { saleId, items, reason });
        
        // 验证数据
        if (!saleId || !Array.isArray(items) || items.length === 0 || !reason) {
            throw new Error('无效的退货数据');
        }

        // 验证销售订单是否存在且未退货
        const [saleCheck] = await conn.query(
            `SELECT SaleID FROM Sale s 
             WHERE s.SaleID = ? 
             AND NOT EXISTS (
                 SELECT 1 FROM SaleReturn sr 
                 WHERE sr.SaleID = s.SaleID
             )`,
            [saleId]
        );

        if (saleCheck.length === 0) {
            throw new Error('销售订单不存在或已退货');
        }
        
        // 计算总退货数量
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        
        // 创建退货记录
        const [result] = await conn.query(
            'INSERT INTO SaleReturn (SaleID, ReturnDate, Reason, Quantity) VALUES (?, NOW(), ?, ?)',
            [saleId, reason, totalQuantity]
        );
        
        const returnId = result.insertId;
        console.log('Created return record:', returnId);
        
        // 添加退货商品明细
        for (const item of items) {
            console.log('Processing return item:', item);
            
            if (!item.productId || !item.quantity || item.quantity <= 0) {
                throw new Error('无效的退货商品数据');
            }
            
            // 验证退货数量是否超过原售出数量
            const [saleDetail] = await conn.query(
                'SELECT Quantity FROM SaleDetail WHERE SaleID = ? AND ProductID = ?',
                [saleId, item.productId]
            );
            
            if (saleDetail.length === 0) {
                throw new Error(`商品ID ${item.productId} 不在原销售订单中`);
            }
            
            if (item.quantity > saleDetail[0].Quantity) {
                throw new Error(`退货数量超过原售出数量`);
            }
            
            // 插入退货明细
            await conn.query(
                `INSERT INTO SaleReturnDetail 
                (ReturnID, ProductID, Quantity, Price) 
                VALUES (?, ?, ?, ?)`,
                [returnId, item.productId, item.quantity, item.price]
            );
            
            // 更新库存
            await conn.query(
                'UPDATE Product SET StockQuantity = StockQuantity + ? WHERE ProductID = ?',
                [item.quantity, item.productId]
            );
        }
        
        await conn.commit();
        console.log('Return process completed successfully');
        res.json({ success: true, message: '退货申请提交成功' });
        
    } catch (error) {
        await conn.rollback();
        console.error('Error processing return:', error);
        res.status(500).json({ 
            success: false, 
            error: '退货申请处理失败',
            message: error.message,
            details: error.stack
        });
    } finally {
        conn.release();
    }
}); 

// 添加获取销售单号列表的接口
app.get('/api/sales/list', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT
                s.SaleID,
                s.SaleDate,
                c.CustomerName,
                s.FinalAmount
            FROM Sale s
            JOIN Customer c ON s.CustomerID = c.CustomerID
            WHERE NOT EXISTS (
                SELECT 1 
                FROM SaleReturn sr 
                WHERE sr.SaleID = s.SaleID
            )
            ORDER BY s.SaleDate DESC
        `;
        
        const [results] = await pool.promise().query(query);
        
        if (!results || results.length === 0) {
            return res.json([]);
        }
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching sales list:', error);
        res.status(500).json({ 
            error: '获取销售单号列表失败',
            details: error.message 
        });
    }
});

// 修改销售查询接口
app.get('/api/sales/search', async (req, res) => {
    try {
        let query = `
            SELECT 
                s.SaleID,
                c.CustomerName,
                s.SaleDate,
                s.FinalAmount
            FROM Sale s
            JOIN Customer c ON s.CustomerID = c.CustomerID
            WHERE 1=1
        `;
        
        const params = [];
        
        if (req.query.saleId) {
            query += ' AND s.SaleID = ?';
            params.push(req.query.saleId);
        }
        
        if (req.query.customerId) {
            query += ' AND s.CustomerID = ?';
            params.push(req.query.customerId);
        }
        
        query += ' ORDER BY s.SaleDate DESC';
        
        const [results] = await pool.promise().query(query, params);
        res.json(results);
    } catch (error) {
        console.error('Error searching sales:', error);
        res.status(500).json({ 
            error: '查询销售订单失败',
            details: error.message
        });
    }
}); 

// 获取当日统计数据
app.get('/api/stats/daily', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log('Getting stats for date:', today);  // 添加日志
        
        // 获取销售汇总数据
        const [summaryResult] = await pool.promise().query(`
            SELECT 
                COUNT(DISTINCT s.SaleID) as orderCount,
                COALESCE(SUM(s.TotalAmount), 0) as totalSales,
                COALESCE(SUM(s.DiscountAmount), 0) as totalDiscount,
                COALESCE(SUM(s.FinalAmount), 0) as totalFinal,
                COALESCE(SUM(
                    sd.Quantity * (sd.Price - p.PurchasePrice)
                ), 0) as totalProfit,
                COALESCE((
                    SELECT COALESCE(SUM(srd.Quantity * srd.Price), 0)
                    FROM SaleReturn sr
                    JOIN SaleReturnDetail srd ON sr.ReturnID = srd.ReturnID
                    WHERE DATE(sr.ReturnDate) = ?
                ), 0) as returnAmount
            FROM Sale s
            LEFT JOIN SaleDetail sd ON s.SaleID = sd.SaleID
            LEFT JOIN Product p ON sd.ProductID = p.ProductID
            WHERE DATE(s.SaleDate) = ?
            GROUP BY DATE(s.SaleDate)
        `, [today, today]);

        console.log('Summary Result:', summaryResult);  // 添加日志

        // 获取销售明细数据
        const [detailsResult] = await pool.promise().query(`
            SELECT 
                s.SaleID,
                s.SaleDate,
                COALESCE(c.CustomerName, '未知客户') as CustomerName,
                COALESCE(e.EmployeeName, '未知员工') as EmployeeName,
                COALESCE(s.TotalAmount, 0) as TotalAmount,
                COALESCE(s.DiscountAmount, 0) as DiscountAmount,
                COALESCE(s.FinalAmount, 0) as FinalAmount,
                COALESCE(SUM(sd.Quantity * (sd.Price - p.PurchasePrice)), 0) as Profit
            FROM Sale s
            LEFT JOIN Customer c ON s.CustomerID = c.CustomerID
            LEFT JOIN Employee e ON s.EmployeeID = e.EmployeeID
            LEFT JOIN SaleDetail sd ON s.SaleID = sd.SaleID
            LEFT JOIN Product p ON sd.ProductID = p.ProductID
            WHERE DATE(s.SaleDate) = ?
            GROUP BY s.SaleID, s.SaleDate, c.CustomerName, e.EmployeeName, 
                     s.TotalAmount, s.DiscountAmount, s.FinalAmount
            ORDER BY s.SaleDate DESC
        `, [today]);

        console.log('Details Result:', detailsResult);  // 添加日志

        // 如果当天没有销售记录，提供默认值
        const summary = summaryResult.length > 0 ? summaryResult[0] : {
            orderCount: 0,
            totalSales: 0,
            totalDiscount: 0,
            totalFinal: 0,
            totalProfit: 0,
            returnAmount: 0
        };

        res.json({
            summary: {
                orderCount: parseInt(summary.orderCount || 0),
                totalSales: parseFloat(summary.totalSales || 0),
                totalDiscount: parseFloat(summary.totalDiscount || 0),
                totalFinal: parseFloat(summary.totalFinal || 0),
                totalProfit: parseFloat(summary.totalProfit || 0),
                returnAmount: parseFloat(summary.returnAmount || 0)
            },
            details: detailsResult.map(sale => ({
                ...sale,
                TotalAmount: parseFloat(sale.TotalAmount),
                DiscountAmount: parseFloat(sale.DiscountAmount),
                FinalAmount: parseFloat(sale.FinalAmount),
                Profit: parseFloat(sale.Profit)
            }))
        });
    } catch (error) {
        console.error('Error getting daily stats:', error);
        res.status(500).json({ 
            error: '获取当日统计数据失败',
            message: error.message,
            stack: error.stack
        });
    }
});

// 获取月度统计数据
app.get('/api/stats/monthly', async (req, res) => {
    try {
        const month = req.query.month || new Date().toISOString().slice(0, 7);
        const [year, monthNum] = month.split('-');
        
        console.log('Getting stats for month:', month);  // 添加日志
        
        // 获取月度汇总数据
        const [summaryResult] = await pool.promise().query(`
            SELECT 
                COUNT(DISTINCT s.SaleID) as orderCount,
                COALESCE(SUM(s.TotalAmount), 0) as totalSales,
                COALESCE(SUM(s.DiscountAmount), 0) as totalDiscount,
                COALESCE(SUM(s.FinalAmount), 0) as totalFinal,
                COALESCE(SUM(
                    sd.Quantity * (sd.Price - p.PurchasePrice)
                ), 0) as totalProfit,
                COALESCE((
                    SELECT COALESCE(SUM(srd.Quantity * srd.Price), 0)
                    FROM SaleReturn sr
                    JOIN SaleReturnDetail srd ON sr.ReturnID = srd.ReturnID
                    WHERE YEAR(sr.ReturnDate) = ? AND MONTH(sr.ReturnDate) = ?
                ), 0) as returnAmount
            FROM Sale s
            LEFT JOIN SaleDetail sd ON s.SaleID = sd.SaleID
            LEFT JOIN Product p ON sd.ProductID = p.ProductID
            WHERE YEAR(s.SaleDate) = ? AND MONTH(s.SaleDate) = ?
            GROUP BY YEAR(s.SaleDate), MONTH(s.SaleDate)
        `, [year, monthNum, year, monthNum]);

        console.log('Summary Result:', summaryResult);  // 添加日志

        // 获取日统计明细数据
        const [detailsResult] = await pool.promise().query(`
            WITH DailySales AS (
                SELECT 
                    DATE(s.SaleDate) as Date,
                    COALESCE(SUM(s.TotalAmount), 0) as TotalSales,
                    COALESCE(SUM(s.DiscountAmount), 0) as DiscountAmount,
                    COALESCE(SUM(s.FinalAmount), 0) as FinalAmount,
                    COALESCE(SUM(sd.Quantity * (sd.Price - p.PurchasePrice)), 0) as Profit,
                    COUNT(DISTINCT s.SaleID) as OrderCount
                FROM Sale s
                LEFT JOIN SaleDetail sd ON s.SaleID = sd.SaleID
                LEFT JOIN Product p ON sd.ProductID = p.ProductID
                WHERE YEAR(s.SaleDate) = ? AND MONTH(s.SaleDate) = ?
                GROUP BY DATE(s.SaleDate)
            ),
            DailyReturns AS (
                SELECT 
                    DATE(sr.ReturnDate) as Date,
                    COALESCE(SUM(srd.Quantity * srd.Price), 0) as ReturnAmount
                FROM SaleReturn sr
                JOIN SaleReturnDetail srd ON sr.ReturnID = srd.ReturnID
                WHERE YEAR(sr.ReturnDate) = ? AND MONTH(sr.ReturnDate) = ?
                GROUP BY DATE(sr.ReturnDate)
            )
            SELECT 
                ds.Date,
                ds.TotalSales,
                ds.DiscountAmount,
                ds.FinalAmount,
                COALESCE(dr.ReturnAmount, 0) as ReturnAmount,
                ds.FinalAmount - COALESCE(dr.ReturnAmount, 0) as NetSales,
                ds.Profit,
                ds.OrderCount
            FROM DailySales ds
            LEFT JOIN DailyReturns dr ON ds.Date = dr.Date
            ORDER BY ds.Date DESC
        `, [year, monthNum, year, monthNum]);

        console.log('Details Result:', detailsResult);  // 添加日志

        // 如果当月没有销售记录，提供默认值
        const summary = summaryResult.length > 0 ? summaryResult[0] : {
            orderCount: 0,
            totalSales: 0,
            totalDiscount: 0,
            totalFinal: 0,
            totalProfit: 0,
            returnAmount: 0
        };

        res.json({
            summary: {
                orderCount: parseInt(summary.orderCount || 0),
                totalSales: parseFloat(summary.totalSales || 0),
                totalDiscount: parseFloat(summary.totalDiscount || 0),
                totalFinal: parseFloat(summary.totalFinal || 0),
                totalProfit: parseFloat(summary.totalProfit || 0),
                returnAmount: parseFloat(summary.returnAmount || 0)
            },
            details: detailsResult.map(day => ({
                ...day,
                TotalSales: parseFloat(day.TotalSales || 0),
                DiscountAmount: parseFloat(day.DiscountAmount || 0),
                FinalAmount: parseFloat(day.FinalAmount || 0),
                ReturnAmount: parseFloat(day.ReturnAmount || 0),
                NetSales: parseFloat(day.NetSales || 0),
                Profit: parseFloat(day.Profit || 0),
                OrderCount: parseInt(day.OrderCount || 0)
            }))
        });
    } catch (error) {
        console.error('Error getting monthly stats:', error);
        res.status(500).json({ 
            error: '获取月度统计数据失败',
            message: error.message,
            stack: error.stack
        });
    }
}); 

// 修改商品状态判断的API接口
app.get('/api/products/status', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.ProductID,
                p.ProductName,
                p.Category,
                p.StockQuantity,
                CASE
                    WHEN p.StockQuantity < 10 THEN 'low'
                    WHEN p.StockQuantity >= 10 AND p.StockQuantity <= 50 THEN 'warning'
                    WHEN p.StockQuantity > 50 AND p.StockQuantity <= 500 THEN 'normal'
                    ELSE 'high'
                END as StockStatus
            FROM Product p
        `;

        const [results] = await pool.promise().query(query);
        res.json(results);
    } catch (error) {
        console.error('Error getting product status:', error);
        res.status(500).json({ error: '获取商品状态失败' });
    }
}); 

// 权限验证中间件
function checkPermission(permissionCode) {
    return async (req, res, next) => {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: '未授权访问' });
            }

            // 查询用户权限
            const query = `
                SELECT p.PermissionCode
                FROM Users u
                JOIN UserRoles ur ON u.UserID = ur.UserID
                JOIN RolePermissions rp ON ur.RoleID = rp.RoleID
                JOIN Permissions p ON rp.PermissionID = p.PermissionID
                WHERE u.UserID = ? AND u.Status = 1 AND p.PermissionCode = ?
            `;

            const [results] = await pool.promise().query(query, [userId, permissionCode]);
            
            if (results.length === 0) {
                return res.status(403).json({ error: '权限不足' });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: '权限验证失败' });
        }
    };
}

// 修改登录路由，支持角色权限
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const [users] = await pool.promise().query(
            'SELECT * FROM Users WHERE Username = ? AND Password = ?',
            [username, password]
        );
        
        if (users.length > 0) {
            const user = users[0];
            
            // 更新最后登录时间
            await pool.promise().query(
                'UPDATE Users SET LastLogin = NOW() WHERE UserID = ?',
                [user.UserID]
            );
            
            // 获取用户权限
            let permissions = [];
            if (user.Role === 'admin') {
                // 管理员拥有所有权限
                const [allPermissions] = await pool.promise().query('SELECT PermissionCode FROM Permissions');
                permissions = allPermissions.map(p => p.PermissionCode);
            } else {
                // 获取用户角色对应的权限
                const [userPermissions] = await pool.promise().query(`
                    SELECT p.PermissionCode
                    FROM UserRoles ur
                    JOIN RolePermissions rp ON ur.RoleID = rp.RoleID
                    JOIN Permissions p ON rp.PermissionID = p.PermissionID
                    WHERE ur.UserID = ?
                `, [user.UserID]);
                
                permissions = userPermissions.map(p => p.PermissionCode);
            }
            
            // 记录登录操作日志
            await logOperation(
                user.UserID, 
                user.Username, 
                '用户登录', 
                '系统', 
                `用户 ${user.Username} 登录系统`, 
                req
            );
            
            res.json({
                success: true,
                user: {
                    userId: user.UserID,
                    username: user.Username,
                    fullName: user.FullName || user.Username,
                    role: user.Role,
                    permissions: permissions
                }
            });
        } else {
            res.json({ success: false, message: '用户名或密码错误' });
        }
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ success: false, message: '登录失败' });
    }
});

// 用户管理API

// 获取所有用户
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await pool.promise().query(`
            SELECT u.*, GROUP_CONCAT(r.RoleName SEPARATOR ', ') AS Role
            FROM users u
            LEFT JOIN userroles ur ON u.UserID = ur.UserID
            LEFT JOIN roles r ON ur.RoleID = r.RoleID
            GROUP BY u.UserID
        `);
        res.json(users);
    } catch (err) {
        console.error('获取用户列表失败:', err);
        res.status(500).json({ message: '获取用户列表失败', error: err.message });
    }
});

// 获取单个用户
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // 获取用户基本信息
        const [users] = await pool.promise().query('SELECT * FROM users WHERE UserID = ?', [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }
        
        const user = users[0];
        
        // 获取用户角色
        const [roles] = await pool.promise().query(`
            SELECT r.* 
            FROM roles r
            JOIN userroles ur ON r.RoleID = ur.RoleID
            WHERE ur.UserID = ?
        `, [userId]);
        
        user.Roles = roles;
        
        res.json(user);
    } catch (err) {
        console.error('获取用户信息失败:', err);
        res.status(500).json({ message: '获取用户信息失败', error: err.message });
    }
});

// 添加用户
app.post('/api/users', async (req, res) => {
    const { username, password, fullName, email, phoneNumber, status, roles, currentUser } = req.body;
    
    try {
        // 开始事务
        const connection = await pool.promise().getConnection();
        await connection.beginTransaction();
        
        try {
            // 1. 插入用户基本信息
            const [userResult] = await connection.query(
                'INSERT INTO Users (Username, Password, FullName, Email, PhoneNumber, Status, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [username, password, fullName, email, phoneNumber, status]
            );
            
            const userId = userResult.insertId;
            
            // 2. 分配角色
            if (roles && roles.length > 0) {
                for (const roleId of roles) {
                    await connection.query(
                        'INSERT INTO UserRoles (UserID, RoleID, AssignedAt, AssignedBy) VALUES (?, ?, NOW(), ?)',
                        [userId, roleId, currentUser ? currentUser.userId : null]
                    );
                }
            }
            
            // 提交事务
            await connection.commit();
            
            // 记录操作日志
            if (currentUser) {
                await logOperation(
                    currentUser.userId,
                    currentUser.username,
                    '添加用户',
                    '基础信息管理',
                    `添加用户: ${username}, 姓名: ${fullName}`,
                    req
                );
            }
            
            res.json({ success: true, userId });
        } catch (error) {
            // 回滚事务
            await connection.rollback();
            throw error;
        } finally {
            // 释放连接
            connection.release();
        }
    } catch (error) {
        console.error('添加用户失败:', error);
        res.status(500).json({ error: '添加用户失败: ' + error.message });
    }
});

// 更新用户
app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { username, password, fullName, email, phoneNumber, status, roles, currentUser } = req.body;
    
    try {
        // 开始事务
        const connection = await pool.promise().getConnection();
        await connection.beginTransaction();
        
        try {
            // 1. 更新用户基本信息
            const updateFields = [];
            const updateParams = [];
            
            if (username) {
                updateFields.push('Username = ?');
                updateParams.push(username);
            }
            
            if (password) {
                updateFields.push('Password = ?');
                updateParams.push(password);
            }
            
            if (fullName !== undefined) {
                updateFields.push('FullName = ?');
                updateParams.push(fullName);
            }
            
            if (email !== undefined) {
                updateFields.push('Email = ?');
                updateParams.push(email);
            }
            
            if (phoneNumber !== undefined) {
                updateFields.push('PhoneNumber = ?');
                updateParams.push(phoneNumber);
            }
            
            if (status !== undefined) {
                updateFields.push('Status = ?');
                updateParams.push(status);
            }
            
            if (updateFields.length > 0) {
                updateParams.push(userId);
                await connection.query(
                    `UPDATE Users SET ${updateFields.join(', ')} WHERE UserID = ?`,
                    updateParams
                );
            }
            
            // 2. 更新角色分配
            if (roles) {
                // 删除现有角色
                await connection.query('DELETE FROM UserRoles WHERE UserID = ?', [userId]);
                
                // 分配新角色
                for (const roleId of roles) {
                    await connection.query(
                        'INSERT INTO UserRoles (UserID, RoleID, AssignedAt, AssignedBy) VALUES (?, ?, NOW(), ?)',
                        [userId, roleId, currentUser ? currentUser.userId : null]
                    );
                }
            }
            
            // 提交事务
            await connection.commit();
            
            // 记录操作日志
            if (currentUser) {
                await logOperation(
                    currentUser.userId,
                    currentUser.username,
                    '更新用户',
                    '基础信息管理',
                    `更新用户ID: ${userId}, 用户名: ${username || '未修改'}`,
                    req
                );
            }
            
            res.json({ success: true });
        } catch (error) {
            // 回滚事务
            await connection.rollback();
            throw error;
        } finally {
            // 释放连接
            connection.release();
        }
    } catch (error) {
        console.error('更新用户失败:', error);
        res.status(500).json({ error: '更新用户失败: ' + error.message });
    }
});

// 删除用户
app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    
    try {
        // 获取用户信息用于日志记录
        const [users] = await pool.promise().query('SELECT * FROM Users WHERE UserID = ?', [userId]);
        const user = users[0];
        
        // 删除用户
        await pool.promise().query('DELETE FROM Users WHERE UserID = ?', [userId]);
        
        // 记录操作日志
        const currentUser = req.query.currentUser ? JSON.parse(req.query.currentUser) : null;
        if (currentUser) {
            await logOperation(
                currentUser.userId,
                currentUser.username,
                '删除用户',
                '基础信息管理',
                `删除用户ID: ${userId}, 用户名: ${user ? user.Username : '未知'}`,
                req
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('删除用户失败:', error);
        res.status(500).json({ error: '删除用户失败: ' + error.message });
    }
});

// 角色管理API

// 获取所有角色
app.get('/api/roles', async (req, res) => {
    try {
        const [roles] = await pool.promise().query(`
            SELECT r.*, COUNT(ur.UserID) AS UserCount
            FROM roles r
            LEFT JOIN userroles ur ON r.RoleID = ur.RoleID
            GROUP BY r.RoleID
        `);
        res.json(roles);
    } catch (err) {
        console.error('获取角色列表失败:', err);
        res.status(500).json({ message: '获取角色列表失败', error: err.message });
    }
});

// 获取单个角色
app.get('/api/roles/:id', async (req, res) => {
    try {
        const roleId = req.params.id;
        
        const [roles] = await pool.promise().query('SELECT * FROM roles WHERE RoleID = ?', [roleId]);
        
        if (roles.length === 0) {
            return res.status(404).json({ message: '角色不存在' });
        }
        
        res.json(roles[0]);
    } catch (err) {
        console.error('获取角色信息失败:', err);
        res.status(500).json({ message: '获取角色信息失败', error: err.message });
    }
});

// 添加角色
app.post('/api/roles', async (req, res) => {
    const { roleName, roleDescription, status, currentUser } = req.body;
    
    try {
        const [result] = await pool.promise().query(
            'INSERT INTO Roles (RoleName, RoleDescription, Status, CreatedAt) VALUES (?, ?, ?, NOW())',
            [roleName, roleDescription, status]
        );
        
        // 记录操作日志
        if (currentUser) {
            await logOperation(
                currentUser.userId,
                currentUser.username,
                '添加角色',
                '基础信息管理',
                `添加角色: ${roleName}`,
                req
            );
        }
        
        res.json({ success: true, roleId: result.insertId });
    } catch (error) {
        console.error('创建角色失败:', error);
        res.status(500).json({ error: '创建角色失败: ' + error.message });
    }
});

// 更新角色
app.put('/api/roles/:id', async (req, res) => {
    const roleId = req.params.id;
    const { roleName, roleDescription, status, currentUser } = req.body;
    
    try {
        await pool.promise().query(
            'UPDATE Roles SET RoleName = ?, RoleDescription = ?, Status = ? WHERE RoleID = ?',
            [roleName, roleDescription, status, roleId]
        );
        
        // 记录操作日志
        if (currentUser) {
            await logOperation(
                currentUser.userId,
                currentUser.username,
                '更新角色',
                '基础信息管理',
                `更新角色ID: ${roleId}, 角色名: ${roleName}`,
                req
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('更新角色失败:', error);
        res.status(500).json({ error: '更新角色失败: ' + error.message });
    }
});

// 删除角色
app.delete('/api/roles/:id', async (req, res) => {
    const roleId = req.params.id;
    
    try {
        // 获取角色信息用于日志记录
        const [roles] = await pool.promise().query('SELECT * FROM Roles WHERE RoleID = ?', [roleId]);
        const role = roles[0];
        
        // 删除角色
        await pool.promise().query('DELETE FROM Roles WHERE RoleID = ?', [roleId]);
        
        // 记录操作日志
        const currentUser = req.query.currentUser ? JSON.parse(req.query.currentUser) : null;
        if (currentUser) {
            await logOperation(
                currentUser.userId,
                currentUser.username,
                '删除角色',
                '基础信息管理',
                `删除角色ID: ${roleId}, 角色名: ${role ? role.RoleName : '未知'}`,
                req
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('删除角色失败:', error);
        res.status(500).json({ error: '删除角色失败: ' + error.message });
    }
});

// 获取所有权限
app.get('/api/permissions', async (req, res) => {
    try {
        // 修改查询，直接从permissions表获取数据，使用ModuleName字段
        const [permissions] = await pool.promise().query(`
            SELECT p.*, p.ModuleName
            FROM permissions p
            ORDER BY p.ModuleName, p.PermissionID
        `);
        res.json(permissions);
    } catch (err) {
        console.error('获取权限列表失败:', err);
        res.status(500).json({ message: '获取权限列表失败', error: err.message });
    }
});

// 获取角色权限
app.get('/api/roles/:id/permissions', async (req, res) => {
    try {
        const roleId = req.params.id;
        
        // 修改查询，直接从permissions表获取数据，使用ModuleName字段
        const [permissions] = await pool.promise().query(`
            SELECT p.*, p.ModuleName
            FROM permissions p
            JOIN rolepermissions rp ON p.PermissionID = rp.PermissionID
            WHERE rp.RoleID = ?
            ORDER BY p.ModuleName, p.PermissionID
        `, [roleId]);
        
        res.json(permissions);
    } catch (err) {
        console.error('获取角色权限失败:', err);
        res.status(500).json({ message: '获取角色权限失败', error: err.message });
    }
});

// 更新角色权限
app.put('/api/roles/:id/permissions', async (req, res) => {
    try {
        const roleId = req.params.id;
        const { permissions } = req.body;
        
        // 开始事务
        await pool.promise().query('START TRANSACTION');
        
        // 删除旧权限
        await pool.promise().query('DELETE FROM rolepermissions WHERE RoleID = ?', [roleId]);
        
        // 添加新权限
        if (permissions && permissions.length > 0) {
            const permissionValues = permissions.map(permissionId => [roleId, permissionId]);
            await pool.promise().query('INSERT INTO rolepermissions (RoleID, PermissionID) VALUES ?', [permissionValues]);
        }
        
        // 提交事务
        await pool.promise().query('COMMIT');
        
        res.json({ message: '角色权限更新成功' });
    } catch (err) {
        // 回滚事务
        await pool.promise().query('ROLLBACK');
        console.error('更新角色权限失败:', err);
        res.status(500).json({ message: '更新角色权限失败', error: err.message });
    }
});

// 修改登录API，返回用户权限信息
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // 查询用户
        const [users] = await pool.promise().query('SELECT * FROM users WHERE Username = ? AND Password = ?', [username, password]);
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }
        
        const user = users[0];
        
        // 查询用户角色
        const [roles] = await pool.promise().query(`
            SELECT r.* 
            FROM roles r
            JOIN userroles ur ON r.RoleID = ur.RoleID
            WHERE ur.UserID = ?
        `, [user.UserID]);
        
        // 查询用户权限
        const [permissions] = await pool.promise().query(`
            SELECT DISTINCT p.PermissionCode
            FROM permissions p
            JOIN rolepermissions rp ON p.PermissionID = rp.PermissionID
            JOIN userroles ur ON rp.RoleID = ur.RoleID
            WHERE ur.UserID = ?
        `, [user.UserID]);
        
        // 提取权限代码
        const permissionCodes = permissions.map(p => p.PermissionCode);
        
        // 更新最后登录时间
        await pool.promise().query('UPDATE users SET LastLogin = NOW() WHERE UserID = ?', [user.UserID]);
        
        // 返回用户信息和权限
        res.json({
            success: true,
            user: {
                userId: user.UserID,
                username: user.Username,
                fullName: user.FullName,
                email: user.Email,
                phoneNumber: user.PhoneNumber,
                status: user.Status,
                roles: roles,
                permissions: permissionCodes
            }
        });
    } catch (err) {
        console.error('登录失败:', err);
        res.status(500).json({ success: false, message: '登录失败', error: err.message });
    }
});

// 获取操作日志列表
app.get('/api/operation-logs', async (req, res) => {
    try {
        const { startDate, endDate, username, module } = req.query;
        
        let query = `
            SELECT * FROM OperationLogs 
            WHERE 1=1
        `;
        
        const params = [];
        
        // 添加筛选条件
        if (startDate && endDate) {
            query += ` AND OperationTime BETWEEN ? AND ?`;
            params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }
        
        if (username) {
            query += ` AND Username LIKE ?`;
            params.push(`%${username}%`);
        }
        
        if (module) {
            query += ` AND Module = ?`;
            params.push(module);
        }
        
        // 添加排序
        query += ` ORDER BY OperationTime DESC`;
        
        const [results] = await pool.promise().query(query, params);
        res.json(results);
    } catch (error) {
        console.error('获取操作日志失败:', error);
        res.status(500).json({ error: '获取操作日志失败' });
    }
});

// 导出操作日志（CSV格式）
app.get('/api/operation-logs/export', async (req, res) => {
    try {
        const { startDate, endDate, username, module, format } = req.query;
        
        let query = `
            SELECT 
                LogID, 
                Username, 
                Operation, 
                DATE_FORMAT(OperationTime, '%Y-%m-%d %H:%i:%s') as OperationTime, 
                Module, 
                Details, 
                IPAddress 
            FROM OperationLogs 
            WHERE 1=1
        `;
        
        const params = [];
        
        // 添加筛选条件
        if (startDate && endDate) {
            query += ` AND OperationTime BETWEEN ? AND ?`;
            params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }
        
        if (username) {
            query += ` AND Username LIKE ?`;
            params.push(`%${username}%`);
        }
        
        if (module) {
            query += ` AND Module = ?`;
            params.push(module);
        }
        
        // 添加排序
        query += ` ORDER BY OperationTime DESC`;
        
        const [logs] = await pool.promise().query(query, params);
        
        if (format === 'csv') {
            // 设置CSV响应头
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=operation_logs_${new Date().toISOString().slice(0,10)}.csv`);
            
            // CSV表头
            let csv = 'ID,用户名,操作,操作时间,模块,详情,IP地址\n';
            
            // 添加数据行
            logs.forEach(log => {
                // 处理CSV中的特殊字符
                const details = log.Details ? log.Details.replace(/"/g, '""').replace(/\n/g, ' ') : '';
                csv += `${log.LogID},"${log.Username}","${log.Operation}","${log.OperationTime}","${log.Module}","${details}","${log.IPAddress}"\n`;
            });
            
            res.send(csv);
        } else {
            // 默认返回JSON
            res.json(logs);
        }
    } catch (error) {
        console.error('导出操作日志失败:', error);
        res.status(500).json({ error: '导出操作日志失败' });
    }
});