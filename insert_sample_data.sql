-- 插入供应商数据
INSERT INTO Supplier (SupplierName, ContactPerson, PhoneNumber, Address) VALUES
('华南食品供应商', '张三', '13800138001', '广州市天河区车陂路123号'),
('东北粮油公司', '李四', '13900139002', '哈尔滨市道里区中央大街456号'),
('西部果蔬批发', '王五', '13700137003', '成都市武侯区科华路789号');

-- 插入商品数据
INSERT INTO Product (ProductName, Category, Price, PurchasePrice, StockQuantity, SupplierID) VALUES
('特级大米', '粮食', 59.90, 45.00, 1000, 2),
('橙子', '水果', 8.90, 6.50, 500, 3),
('康师傅方便面', '速食', 4.50, 3.20, 2000, 1),
('金龙鱼食用油', '油类', 49.90, 39.90, 800, 2),
('新鲜胡萝卜', '蔬菜', 3.98, 2.50, 300, 3);

-- 插入员工数据
INSERT INTO Employee (EmployeeName, Position, Salary, HireDate, PhoneNumber) VALUES
('刘晓明', '店长', 8000.00, '2022-01-15', '13600136001'),
('王小花', '收银员', 4500.00, '2022-03-01', '13600136002'),
('张大力', '理货员', 4000.00, '2022-02-15', '13600136003'),
('李小凤', '销售', 5000.00, '2022-04-01', '13600136004');

-- 插入客户数据
INSERT INTO Customer (CustomerName, PhoneNumber, Email, VIPStatus) VALUES
('陈客户', '13500135001', 'chen@example.com', TRUE),
('林女士', '13500135002', 'lin@example.com', FALSE),
('黄先生', '13500135003', 'huang@example.com', TRUE),
('赵小姐', '13500135004', 'zhao@example.com', FALSE);

-- 插入库存数据
INSERT INTO Inventory (ProductID, StockQuantity, Location) VALUES
(1, 1000, 'A-01'),
(2, 500, 'B-02'),
(3, 2000, 'C-03'),
(4, 800, 'A-02'),
(5, 300, 'B-03');

-- 插入进货数据
INSERT INTO Purchase (ProductID, SupplierID, Quantity, PurchasePrice, TotalAmount, PurchaseDate) VALUES
(1, 2, 500, 45.00, 22500.00, '2024-01-10 10:00:00'),
(2, 3, 300, 6.50, 1950.00, '2024-01-11 11:00:00'),
(3, 1, 1000, 3.20, 3200.00, '2024-01-12 14:00:00'),
(4, 2, 400, 39.90, 15960.00, '2024-01-13 15:00:00');

-- 插入销售数据（Sale）
INSERT INTO Sale (CustomerID, EmployeeID, SaleDate, TotalAmount, DiscountAmount, FinalAmount) VALUES
(1, 2, '2024-01-15 09:30:00', 119.80, 0, 119.80),
(3, 2, '2024-01-15 10:15:00', 44.50, 0, 44.50),
(2, 4, '2024-01-15 14:20:00', 45.00, 0, 45.00),
(4, 4, '2024-01-15 16:45:00', 49.90, 0, 49.90);

-- 插入销售明细数据（SaleDetail）
INSERT INTO SaleDetail (SaleID, ProductID, Quantity, Price, Subtotal) VALUES
(1, 1, 2, 59.90, 119.80),
(2, 2, 5, 8.90, 44.50),
(3, 3, 10, 4.50, 45.00),
(4, 4, 1, 49.90, 49.90);

-- 插入销售退货数据（SaleReturn）
INSERT INTO SaleReturn (SaleID, ReturnDate, Reason, Quantity) VALUES
(3, '2024-01-16 10:00:00', '包装破损', 2),
(1, '2024-01-16 11:30:00', '质量问题', 1);

-- 插入财务报表数据
INSERT INTO FinancialReport (ReportDate, TotalRevenue, TotalExpenses, NetProfit, ReportType) VALUES
('2024-01-15', 259.20, 180.50, 78.70, 'daily'),
('2024-01-01', 15800.00, 12500.00, 3300.00, 'monthly'),
('2023-12-31', 180000.00, 150000.00, 30000.00, 'yearly'); 

-- 插入用户数据
INSERT INTO Users (UserID, Username, Password, Role, CreatedAt, LastLogin, Status) VALUES
(1, 'admin', 'admin123', 'admin', '2024-12-20 22:03:05', NULL, 1),
(2, 'warehouse', 'wh123', 'warehouse', '2024-12-20 22:03:05', NULL, 1),
(3, 'sales', 'sales123', 'sales', '2024-12-20 22:03:05', NULL, 1);

