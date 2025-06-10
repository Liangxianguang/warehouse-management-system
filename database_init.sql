-- MySQL数据库初始化
-- 修改时间: 2025-06-10 10:27:31
-- 数据库: supermarket_db
-- 表数量: 28

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- 表结构: batchstock
-- ----------------------------
DROP TABLE IF EXISTS `batchstock`;
CREATE TABLE `batchstock` (
  `BatchID` int NOT NULL AUTO_INCREMENT,
  `ProductID` int NOT NULL,
  `BatchNo` varchar(50) NOT NULL,
  `InboundDate` datetime NOT NULL,
  `Quantity` int NOT NULL,
  `RemainingQuantity` int NOT NULL,
  `Location` varchar(50) NOT NULL,
  PRIMARY KEY (`BatchID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `batchstock_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表 batchstock 没有数据

-- ----------------------------
-- 表结构: customer
-- ----------------------------
DROP TABLE IF EXISTS `customer`;
CREATE TABLE `customer` (
  `CustomerID` int NOT NULL AUTO_INCREMENT,
  `CustomerName` varchar(50) NOT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `VIPStatus` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`CustomerID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: customer (5 行)
-- ----------------------------
INSERT INTO `customer` (`CustomerID`, `CustomerName`, `PhoneNumber`, `Email`, `VIPStatus`) VALUES (1, '陈客户', '13500135001', 'chen@example.com', 1);
INSERT INTO `customer` (`CustomerID`, `CustomerName`, `PhoneNumber`, `Email`, `VIPStatus`) VALUES (2, '林女士', '13500135002', 'lin@example.com', 0);
INSERT INTO `customer` (`CustomerID`, `CustomerName`, `PhoneNumber`, `Email`, `VIPStatus`) VALUES (3, '李先生', '18500135003', 'li@example.com', 1);
INSERT INTO `customer` (`CustomerID`, `CustomerName`, `PhoneNumber`, `Email`, `VIPStatus`) VALUES (4, '赵小姐', '13500135004', 'zhao@example.com', 0);
INSERT INTO `customer` (`CustomerID`, `CustomerName`, `PhoneNumber`, `Email`, `VIPStatus`) VALUES (5, '李先生', '18500135004', 'li@example.com', 1);

-- ----------------------------
-- 表结构: employee
-- ----------------------------
DROP TABLE IF EXISTS `employee`;
CREATE TABLE `employee` (
  `EmployeeID` int NOT NULL AUTO_INCREMENT,
  `EmployeeName` varchar(50) NOT NULL,
  `Position` varchar(50) DEFAULT NULL,
  `Salary` decimal(10,2) DEFAULT NULL,
  `HireDate` date DEFAULT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`EmployeeID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: employee (6 行)
-- ----------------------------
INSERT INTO `employee` (`EmployeeID`, `EmployeeName`, `Position`, `Salary`, `HireDate`, `PhoneNumber`) VALUES (1, '刘晓明', '店长', '8000.00', '2022-01-15', '13600136001');
INSERT INTO `employee` (`EmployeeID`, `EmployeeName`, `Position`, `Salary`, `HireDate`, `PhoneNumber`) VALUES (2, '王小花', '收银员', '4500.00', '2022-03-01', '13600136002');
INSERT INTO `employee` (`EmployeeID`, `EmployeeName`, `Position`, `Salary`, `HireDate`, `PhoneNumber`) VALUES (3, '张大力', '理货员', '4000.00', '2022-02-15', '13600136003');
INSERT INTO `employee` (`EmployeeID`, `EmployeeName`, `Position`, `Salary`, `HireDate`, `PhoneNumber`) VALUES (4, '李小凤', '销售', '5000.00', '2022-04-01', '13600136004');
INSERT INTO `employee` (`EmployeeID`, `EmployeeName`, `Position`, `Salary`, `HireDate`, `PhoneNumber`) VALUES (5, '梁贤广', '经理', '100000.00', '2024-12-17', '13767601663');
INSERT INTO `employee` (`EmployeeID`, `EmployeeName`, `Position`, `Salary`, `HireDate`, `PhoneNumber`) VALUES (6, '郭星治', '经理', '1000000.00', '2024-12-17', '120');

-- ----------------------------
-- 表结构: financialreport
-- ----------------------------
DROP TABLE IF EXISTS `financialreport`;
CREATE TABLE `financialreport` (
  `ReportID` int NOT NULL AUTO_INCREMENT,
  `ReportDate` date NOT NULL,
  `TotalRevenue` decimal(15,2) NOT NULL,
  `TotalExpenses` decimal(15,2) NOT NULL,
  `NetProfit` decimal(15,2) NOT NULL,
  `ReportType` enum('daily','monthly','yearly') NOT NULL,
  PRIMARY KEY (`ReportID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: financialreport (3 行)
-- ----------------------------
INSERT INTO `financialreport` (`ReportID`, `ReportDate`, `TotalRevenue`, `TotalExpenses`, `NetProfit`, `ReportType`) VALUES (1, '2024-01-15', '259.20', '180.50', '78.70', 'daily');
INSERT INTO `financialreport` (`ReportID`, `ReportDate`, `TotalRevenue`, `TotalExpenses`, `NetProfit`, `ReportType`) VALUES (2, '2024-01-01', '15800.00', '12500.00', '3300.00', 'monthly');
INSERT INTO `financialreport` (`ReportID`, `ReportDate`, `TotalRevenue`, `TotalExpenses`, `NetProfit`, `ReportType`) VALUES (3, '2023-12-31', '180000.00', '150000.00', '30000.00', 'yearly');

-- ----------------------------
-- 表结构: inventory
-- ----------------------------
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `InventoryID` int NOT NULL AUTO_INCREMENT,
  `ProductID` int DEFAULT NULL,
  `StockQuantity` int NOT NULL,
  `Location` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`InventoryID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: inventory (5 行)
-- ----------------------------
INSERT INTO `inventory` (`InventoryID`, `ProductID`, `StockQuantity`, `Location`) VALUES (1, 1, 1000, 'A-01');
INSERT INTO `inventory` (`InventoryID`, `ProductID`, `StockQuantity`, `Location`) VALUES (2, 2, 500, 'B-02');
INSERT INTO `inventory` (`InventoryID`, `ProductID`, `StockQuantity`, `Location`) VALUES (3, 3, 2000, 'C-03');
INSERT INTO `inventory` (`InventoryID`, `ProductID`, `StockQuantity`, `Location`) VALUES (4, 4, 800, 'A-02');
INSERT INTO `inventory` (`InventoryID`, `ProductID`, `StockQuantity`, `Location`) VALUES (5, 5, 300, 'B-03');

-- ----------------------------
-- 表结构: inventorychecks
-- ----------------------------
DROP TABLE IF EXISTS `inventorychecks`;
CREATE TABLE `inventorychecks` (
  `CheckID` int NOT NULL AUTO_INCREMENT,
  `ProductID` int NOT NULL,
  `SystemStock` int NOT NULL,
  `ActualStock` int NOT NULL,
  `CheckDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `OperatorID` int NOT NULL,
  PRIMARY KEY (`CheckID`),
  KEY `ProductID` (`ProductID`),
  KEY `OperatorID` (`OperatorID`),
  CONSTRAINT `inventorychecks_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`),
  CONSTRAINT `inventorychecks_ibfk_2` FOREIGN KEY (`OperatorID`) REFERENCES `employee` (`EmployeeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表 inventorychecks 没有数据

-- ----------------------------
-- 表结构: inventoryreturns
-- ----------------------------
DROP TABLE IF EXISTS `inventoryreturns`;
CREATE TABLE `inventoryreturns` (
  `ReturnID` int NOT NULL AUTO_INCREMENT,
  `ProductID` int NOT NULL,
  `SupplierID` int NOT NULL,
  `Quantity` int NOT NULL,
  `Reason` varchar(50) NOT NULL,
  `ReturnDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('pending','completed') DEFAULT 'pending',
  PRIMARY KEY (`ReturnID`),
  KEY `ProductID` (`ProductID`),
  KEY `SupplierID` (`SupplierID`),
  CONSTRAINT `inventoryreturns_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`),
  CONSTRAINT `inventoryreturns_ibfk_2` FOREIGN KEY (`SupplierID`) REFERENCES `supplier` (`SupplierID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表 inventoryreturns 没有数据

-- ----------------------------
-- 表结构: operationlogs
-- ----------------------------
DROP TABLE IF EXISTS `operationlogs`;
CREATE TABLE `operationlogs` (
  `LogID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `Username` varchar(50) NOT NULL,
  `Operation` varchar(100) NOT NULL,
  `OperationTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `Module` varchar(50) NOT NULL,
  `Details` text,
  `IPAddress` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`LogID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `operationlogs_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: operationlogs (19 行)
-- ----------------------------
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (1, 1, 'admin', '用户登录', '2025-06-02 21:05:03', '系统', '用户 admin 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (2, 1, 'admin', '更新用户', '2025-06-02 21:05:54', '基础信息管理', '更新用户ID: 7, 用户名: sale-wu', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (3, 1, 'admin', '用户登录', '2025-06-02 21:22:06', '系统', '用户 admin 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (4, 2, 'warehouse', '用户登录', '2025-06-03 09:51:43', '系统', '用户 warehouse 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (5, 1, 'admin', '用户登录', '2025-06-03 09:53:03', '系统', '用户 admin 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (6, 1, 'admin', '用户登录', '2025-06-03 10:54:55', '系统', '用户 admin 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (7, 1, 'admin', '更新用户', '2025-06-04 18:23:27', '基础信息管理', '更新用户ID: 7, 用户名: sale-wu', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (8, 1, 'admin', '更新用户', '2025-06-04 18:23:33', '基础信息管理', '更新用户ID: 7, 用户名: sale-wu', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (9, 1, 'admin', '用户登录', '2025-06-04 21:58:03', '系统', '用户 admin 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (10, 1, 'admin', '用户登录', '2025-06-05 09:24:07', '系统', '用户 admin 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (11, 1, 'admin', '用户登录', '2025-06-05 09:31:18', '系统', '用户 admin 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (12, 1, 'admin', '用户登录', '2025-06-05 09:38:24', '系统', '用户 admin 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (13, 2, 'warehouse', '用户登录', '2025-06-07 17:09:39', '系统', '用户 warehouse 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (14, 3, 'sales', '用户登录', '2025-06-07 17:10:16', '系统', '用户 sales 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (15, 1, 'admin', '用户登录', '2025-06-07 17:33:47', '系统', '用户 admin 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (16, 3, 'sales', '用户登录', '2025-06-07 17:40:13', '系统', '用户 sales 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (17, 1, 'admin', '用户登录', '2025-06-07 17:45:30', '系统', '用户 admin 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (18, 3, 'sales', '用户登录', '2025-06-07 17:49:03', '系统', '用户 sales 登录系统', '::1');
INSERT INTO `operationlogs` (`LogID`, `UserID`, `Username`, `Operation`, `OperationTime`, `Module`, `Details`, `IPAddress`) VALUES (19, 1, 'admin', '用户登录', '2025-06-07 19:09:34', '系统', '用户 admin 登录系统', '::1');

-- ----------------------------
-- 表结构: outbound
-- ----------------------------
DROP TABLE IF EXISTS `outbound`;
CREATE TABLE `outbound` (
  `OutboundID` int NOT NULL AUTO_INCREMENT,
  `OutboundNo` varchar(20) NOT NULL,
  `OutboundType` enum('SALE','TRANSFER','DAMAGE','OTHER') NOT NULL,
  `OutboundDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `OperatorID` int NOT NULL,
  `OutboundStrategy` enum('FIFO','LIFO','BATCH','LOCATION') NOT NULL,
  `Note` text,
  PRIMARY KEY (`OutboundID`),
  KEY `OperatorID` (`OperatorID`),
  CONSTRAINT `outbound_ibfk_1` FOREIGN KEY (`OperatorID`) REFERENCES `employee` (`EmployeeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表 outbound 没有数据

-- ----------------------------
-- 表结构: outbounddetail
-- ----------------------------
DROP TABLE IF EXISTS `outbounddetail`;
CREATE TABLE `outbounddetail` (
  `DetailID` int NOT NULL AUTO_INCREMENT,
  `OutboundID` int NOT NULL,
  `ProductID` int NOT NULL,
  `BatchNo` varchar(50) NOT NULL,
  `ProductName` varchar(100) NOT NULL,
  `Quantity` int NOT NULL,
  `Location` varchar(50) NOT NULL,
  PRIMARY KEY (`DetailID`),
  KEY `OutboundID` (`OutboundID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `outbounddetail_ibfk_1` FOREIGN KEY (`OutboundID`) REFERENCES `outbound` (`OutboundID`),
  CONSTRAINT `outbounddetail_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表 outbounddetail 没有数据

-- ----------------------------
-- 表结构: permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `PermissionID` int NOT NULL AUTO_INCREMENT,
  `PermissionName` varchar(50) NOT NULL,
  `PermissionCode` varchar(50) NOT NULL,
  `ModuleName` varchar(50) NOT NULL,
  `Description` text,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PermissionID`),
  UNIQUE KEY `PermissionName` (`PermissionName`),
  UNIQUE KEY `PermissionCode` (`PermissionCode`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: permissions (17 行)
-- ----------------------------
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (1, '商品管理', 'products_manage', '基础信息管理', '商品的增删改查', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (2, '员工管理', 'employees_manage', '基础信息管理', '员工的增删改查', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (3, '客户管理', 'customers_manage', '基础信息管理', '客户的增删改查', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (4, '供应商管理', 'suppliers_manage', '基础信息管理', '供应商的增删改查', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (5, '用户管理', 'users_manage', '基础信息管理', '用户和角色权限管理', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (6, '入库登记', 'purchase_entry', '进货管理', '商品入库登记', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (7, '入库查询', 'purchase_query', '进货管理', '入库记录查询', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (8, '库存查询', 'inventory_query', '库房管理', '库存信息查询', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (9, '库存盘点', 'stock_check', '库房管理', '库存盘点操作', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (10, '销售登记', 'sales_entry', '销售管理', '销售开单', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (11, '销售退货', 'sales_return', '销售管理', '销售退货处理', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (12, '销售查询', 'sales_query', '销售管理', '销售记录查询', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (13, '当日统计', 'daily_stats', '财务统计', '当日销售统计', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (14, '月度统计', 'monthly_stats', '财务统计', '月度销售统计', '2025-06-02 16:13:23');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (15, '入库质检', 'quality_inspection', '质检管理', '商品入库质检', '2025-06-07 17:12:44');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (16, '质检查询', 'quality_query', '质检管理', '质检记录查询', '2025-06-07 17:12:44');
INSERT INTO `permissions` (`PermissionID`, `PermissionName`, `PermissionCode`, `ModuleName`, `Description`, `CreatedAt`) VALUES (17, '出库管理', 'outbound_manage', '库房管理', '商品出库管理', '2025-06-07 17:12:44');

-- ----------------------------
-- 表结构: product
-- ----------------------------
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `ProductID` int NOT NULL AUTO_INCREMENT,
  `ProductName` varchar(100) NOT NULL,
  `Category` varchar(50) DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL,
  `PurchasePrice` decimal(10,2) NOT NULL,
  `StockQuantity` int DEFAULT '0',
  `SupplierID` int DEFAULT NULL,
  PRIMARY KEY (`ProductID`),
  KEY `SupplierID` (`SupplierID`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`SupplierID`) REFERENCES `supplier` (`SupplierID`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: product (6 行)
-- ----------------------------
INSERT INTO `product` (`ProductID`, `ProductName`, `Category`, `Price`, `PurchasePrice`, `StockQuantity`, `SupplierID`) VALUES (1, '特级大米', '粮食', '59.90', '45.00', 30, 2);
INSERT INTO `product` (`ProductID`, `ProductName`, `Category`, `Price`, `PurchasePrice`, `StockQuantity`, `SupplierID`) VALUES (2, '橙子', '水果', '8.90', '6.50', 1975, 3);
INSERT INTO `product` (`ProductID`, `ProductName`, `Category`, `Price`, `PurchasePrice`, `StockQuantity`, `SupplierID`) VALUES (3, '康师傅方便面', '速食', '4.50', '3.20', 2155, 1);
INSERT INTO `product` (`ProductID`, `ProductName`, `Category`, `Price`, `PurchasePrice`, `StockQuantity`, `SupplierID`) VALUES (4, '金龙鱼食用油', '油类', '49.90', '39.90', 752, 2);
INSERT INTO `product` (`ProductID`, `ProductName`, `Category`, `Price`, `PurchasePrice`, `StockQuantity`, `SupplierID`) VALUES (5, '新鲜胡萝卜', '蔬菜', '3.98', '2.50', 201, 3);
INSERT INTO `product` (`ProductID`, `ProductName`, `Category`, `Price`, `PurchasePrice`, `StockQuantity`, `SupplierID`) VALUES (10, '苹果', '水果', '20.00', '10.00', 27, 4);

-- ----------------------------
-- 表结构: purchase
-- ----------------------------
DROP TABLE IF EXISTS `purchase`;
CREATE TABLE `purchase` (
  `PurchaseID` int NOT NULL AUTO_INCREMENT,
  `ProductID` int DEFAULT NULL,
  `SupplierID` int DEFAULT NULL,
  `Quantity` int NOT NULL,
  `PurchasePrice` decimal(10,2) NOT NULL,
  `TotalAmount` decimal(10,2) NOT NULL,
  `PurchaseDate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PurchaseID`),
  KEY `ProductID` (`ProductID`),
  KEY `SupplierID` (`SupplierID`),
  CONSTRAINT `purchase_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`),
  CONSTRAINT `purchase_ibfk_2` FOREIGN KEY (`SupplierID`) REFERENCES `supplier` (`SupplierID`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: purchase (23 行)
-- ----------------------------
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (1, 1, 2, 500, '45.00', '22500.00', '2024-01-10 10:00:00');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (2, 2, 3, 300, '6.50', '1950.00', '2024-01-11 11:00:00');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (3, 3, 1, 1000, '3.20', '3200.00', '2024-01-12 14:00:00');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (4, 4, 2, 400, '39.90', '15960.00', '2024-01-13 15:00:00');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (5, 2, 5, 100, '6.50', '650.00', '2024-12-18 20:23:27');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (6, 3, 4, 20, '3.20', '64.00', '2024-12-18 20:28:49');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (7, 1, 7, 1, '45.00', '45.00', '2024-12-19 15:26:32');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (8, 10, 7, 10, '10.00', '100.00', '2024-12-19 18:36:56');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (9, 10, 8, 1, '10.00', '10.00', '2024-12-20 11:43:58');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (10, 1, 8, 5, '45.00', '225.00', '2024-12-20 12:18:21');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (11, 3, 4, 100, '3.20', '320.00', '2024-12-20 23:32:58');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (12, 2, 4, 1123, '6.50', '7299.50', '2024-12-20 23:47:58');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (13, 3, 4, 60, '3.20', '192.00', '2024-12-20 23:47:58');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (14, 1, 2, 5, '45.00', '225.00', '2024-12-21 00:03:32');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (15, 3, 1, 10, '3.20', '32.00', '2024-12-21 00:19:58');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (16, 2, 3, 100, '6.50', '650.00', '2024-12-21 23:23:38');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (17, 10, 3, 20, '10.00', '200.00', '2024-12-21 23:23:38');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (18, 1, 2, 3, '45.00', '135.00', '2024-12-28 13:12:55');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (19, 1, 1, 12, '45.00', '540.00', '2024-12-28 15:05:34');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (20, 2, 1, 12, '6.50', '78.00', '2024-12-28 15:05:34');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (21, 2, 5, 200, '6.50', '1300.00', '2025-01-17 12:31:20');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (22, 3, 4, 100, '3.20', '320.00', '2025-06-03 09:58:07');
INSERT INTO `purchase` (`PurchaseID`, `ProductID`, `SupplierID`, `Quantity`, `PurchasePrice`, `TotalAmount`, `PurchaseDate`) VALUES (23, 4, 4, 10, '39.90', '399.00', '2025-06-03 09:58:07');

-- ----------------------------
-- 表结构: qualityinspection
-- ----------------------------
DROP TABLE IF EXISTS `qualityinspection`;
CREATE TABLE `qualityinspection` (
  `InspectionID` int NOT NULL AUTO_INCREMENT,
  `PurchaseID` int NOT NULL,
  `Inspector` varchar(50) NOT NULL,
  `InspectionDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SupplierID` int DEFAULT NULL,
  `Note` text,
  PRIMARY KEY (`InspectionID`),
  KEY `PurchaseID` (`PurchaseID`),
  KEY `SupplierID` (`SupplierID`),
  CONSTRAINT `qualityinspection_ibfk_1` FOREIGN KEY (`PurchaseID`) REFERENCES `purchase` (`PurchaseID`),
  CONSTRAINT `qualityinspection_ibfk_2` FOREIGN KEY (`SupplierID`) REFERENCES `supplier` (`SupplierID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: qualityinspection (1 行)
-- ----------------------------
INSERT INTO `qualityinspection` (`InspectionID`, `PurchaseID`, `Inspector`, `InspectionDate`, `SupplierID`, `Note`) VALUES (1, 22, '万先生', '2025-06-05 09:42:29', 4, '2025-6-5查');

-- ----------------------------
-- 表结构: qualityinspectiondetail
-- ----------------------------
DROP TABLE IF EXISTS `qualityinspectiondetail`;
CREATE TABLE `qualityinspectiondetail` (
  `DetailID` int NOT NULL AUTO_INCREMENT,
  `InspectionID` int NOT NULL,
  `ProductID` int NOT NULL,
  `Quantity` int NOT NULL,
  `Result` enum('合格','不合格') NOT NULL,
  `Remark` text,
  PRIMARY KEY (`DetailID`),
  KEY `InspectionID` (`InspectionID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `qualityinspectiondetail_ibfk_1` FOREIGN KEY (`InspectionID`) REFERENCES `qualityinspection` (`InspectionID`),
  CONSTRAINT `qualityinspectiondetail_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: qualityinspectiondetail (1 行)
-- ----------------------------
INSERT INTO `qualityinspectiondetail` (`DetailID`, `InspectionID`, `ProductID`, `Quantity`, `Result`, `Remark`) VALUES (1, 1, 3, 100, '合格', '没问题');

-- ----------------------------
-- 表结构: rolepermissions
-- ----------------------------
DROP TABLE IF EXISTS `rolepermissions`;
CREATE TABLE `rolepermissions` (
  `RolePermissionID` int NOT NULL AUTO_INCREMENT,
  `RoleID` int NOT NULL,
  `PermissionID` int NOT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RolePermissionID`),
  UNIQUE KEY `unique_role_permission` (`RoleID`,`PermissionID`),
  KEY `PermissionID` (`PermissionID`),
  CONSTRAINT `rolepermissions_ibfk_1` FOREIGN KEY (`RoleID`) REFERENCES `roles` (`RoleID`) ON DELETE CASCADE,
  CONSTRAINT `rolepermissions_ibfk_2` FOREIGN KEY (`PermissionID`) REFERENCES `permissions` (`PermissionID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: rolepermissions (54 行)
-- ----------------------------
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (16, 2, 8, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (17, 3, 8, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (18, 2, 1, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (19, 3, 1, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (20, 2, 6, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (21, 3, 6, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (22, 2, 7, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (23, 3, 7, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (24, 2, 9, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (25, 3, 9, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (26, 2, 4, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (27, 3, 4, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (31, 4, 3, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (32, 5, 3, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (33, 4, 13, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (34, 5, 13, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (35, 4, 14, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (36, 5, 14, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (37, 4, 1, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (38, 5, 1, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (39, 4, 10, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (40, 5, 10, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (41, 4, 12, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (42, 5, 12, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (43, 4, 11, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (44, 5, 11, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (46, 6, 3, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (47, 6, 10, '2025-06-02 16:13:23');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (49, 1, 1, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (50, 1, 2, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (51, 1, 3, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (52, 1, 4, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (53, 1, 5, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (54, 1, 8, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (55, 1, 9, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (56, 1, 13, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (57, 1, 14, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (58, 1, 6, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (59, 1, 7, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (60, 1, 10, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (61, 1, 11, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (62, 1, 12, '2025-06-02 19:37:59');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (64, 7, 5, '2025-06-02 20:13:26');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (65, 7, 9, '2025-06-02 20:13:26');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (66, 7, 14, '2025-06-02 20:13:26');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (67, 1, 17, '2025-06-07 17:12:44');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (68, 1, 15, '2025-06-07 17:12:44');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (69, 1, 16, '2025-06-07 17:12:44');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (70, 2, 17, '2025-06-07 17:12:44');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (71, 3, 17, '2025-06-07 17:12:44');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (72, 2, 15, '2025-06-07 17:12:44');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (73, 3, 15, '2025-06-07 17:12:44');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (74, 2, 16, '2025-06-07 17:12:44');
INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `CreatedAt`) VALUES (75, 3, 16, '2025-06-07 17:12:44');

-- ----------------------------
-- 表结构: roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `RoleID` int NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(50) NOT NULL,
  `RoleDescription` text,
  `Status` tinyint DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RoleID`),
  UNIQUE KEY `RoleName` (`RoleName`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: roles (7 行)
-- ----------------------------
INSERT INTO `roles` (`RoleID`, `RoleName`, `RoleDescription`, `Status`, `CreatedAt`) VALUES (1, 'admin', '系统管理员 - 拥有所有权限', 1, '2025-06-02 16:13:23');
INSERT INTO `roles` (`RoleID`, `RoleName`, `RoleDescription`, `Status`, `CreatedAt`) VALUES (2, 'warehouse_manager', '仓库管理员 - 负责库存和进货管理', 1, '2025-06-02 16:13:23');
INSERT INTO `roles` (`RoleID`, `RoleName`, `RoleDescription`, `Status`, `CreatedAt`) VALUES (3, 'warehouse', '仓库管理员 - 负责库存和进货管理', 1, '2025-06-02 16:13:23');
INSERT INTO `roles` (`RoleID`, `RoleName`, `RoleDescription`, `Status`, `CreatedAt`) VALUES (4, 'sales_manager', '销售经理 - 负责销售和客户管理', 1, '2025-06-02 16:13:23');
INSERT INTO `roles` (`RoleID`, `RoleName`, `RoleDescription`, `Status`, `CreatedAt`) VALUES (5, 'sales', '销售经理 - 负责销售和客户管理', 1, '2025-06-02 16:13:23');
INSERT INTO `roles` (`RoleID`, `RoleName`, `RoleDescription`, `Status`, `CreatedAt`) VALUES (6, 'cashier', '收银员 - 只能进行销售操作', 1, '2025-06-02 16:13:23');
INSERT INTO `roles` (`RoleID`, `RoleName`, `RoleDescription`, `Status`, `CreatedAt`) VALUES (7, '111', '2222', 1, '2025-06-02 20:04:50');

-- ----------------------------
-- 表结构: sale
-- ----------------------------
DROP TABLE IF EXISTS `sale`;
CREATE TABLE `sale` (
  `SaleID` int NOT NULL AUTO_INCREMENT,
  `CustomerID` int DEFAULT NULL,
  `EmployeeID` int DEFAULT NULL,
  `SaleDate` datetime DEFAULT NULL,
  `TotalAmount` decimal(10,2) DEFAULT NULL,
  `DiscountAmount` decimal(10,2) DEFAULT '0.00',
  `FinalAmount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`SaleID`),
  KEY `CustomerID` (`CustomerID`),
  KEY `EmployeeID` (`EmployeeID`),
  CONSTRAINT `sale_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `customer` (`CustomerID`),
  CONSTRAINT `sale_ibfk_2` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: sale (27 行)
-- ----------------------------
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (1, 1, 1, '2024-12-19 21:21:11', '90.00', '3.00', '87.00');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (2, 2, 1, '2024-12-19 21:35:52', '99.80', '3.00', '96.80');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (3, 2, 2, '2024-12-19 21:36:31', '99.80', '3.00', '96.80');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (4, 3, 3, '2024-12-19 21:38:16', '4.50', '0.00', '4.50');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (5, 2, 2, '2024-12-19 21:39:18', '17.80', '0.00', '17.80');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (6, 4, 3, '2024-12-19 22:03:25', '4.50', '0.00', '4.50');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (7, 3, 6, '2024-12-19 22:15:44', '8.90', '0.00', '8.90');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (8, 4, 2, '2024-12-19 22:33:43', '4.50', '0.00', '4.50');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (9, 3, 1, '2024-12-20 14:05:47', '93.80', '3.00', '90.80');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (10, 1, 2, '2024-12-20 17:11:00', '54.00', '2.00', '52.00');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (11, 3, 1, '2024-12-20 17:47:10', '99.80', '0.00', '99.80');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (12, 1, 1, '2024-12-20 18:40:19', '13.50', '0.00', '13.50');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (13, 5, 5, '2024-12-20 19:31:03', '1047.90', '10.00', '1037.90');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (14, 1, 2, '2024-12-20 19:41:55', '173.80', '10.00', '163.80');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (15, 2, 2, '2024-12-20 20:19:52', '13.50', '0.00', '13.50');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (16, 1, 3, '2024-12-20 23:35:43', '21.46', '2.00', '19.46');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (17, 5, 4, '2024-12-20 23:51:34', '578.60', '50.00', '528.60');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (18, 3, 1, '2024-12-21 00:10:28', '45.00', '3.00', '42.00');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (19, 3, 3, '2024-12-21 00:10:47', '499.00', '5.00', '494.00');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (20, 1, 4, '2024-12-21 00:29:37', '117.60', '3.00', '114.60');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (21, 1, 4, '2024-12-21 23:28:50', '391.60', '50.00', '341.60');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (22, 3, 1, '2024-12-28 13:14:28', '589.00', '10.00', '579.00');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (23, 2, 1, '2024-12-28 13:14:48', '168.60', '0.00', '168.60');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (24, 5, 1, '2024-12-28 13:15:14', '145.00', '5.00', '140.00');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (25, 1, 2, '2025-01-17 12:32:50', '84.80', '3.00', '81.80');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (26, 2, 1, '2025-01-22 15:16:33', '39.80', '0.00', '39.80');
INSERT INTO `sale` (`SaleID`, `CustomerID`, `EmployeeID`, `SaleDate`, `TotalAmount`, `DiscountAmount`, `FinalAmount`) VALUES (27, 3, 2, '2025-03-22 18:10:39', '4.50', '0.00', '4.50');

-- ----------------------------
-- 表结构: saledetail
-- ----------------------------
DROP TABLE IF EXISTS `saledetail`;
CREATE TABLE `saledetail` (
  `DetailID` int NOT NULL AUTO_INCREMENT,
  `SaleID` int DEFAULT NULL,
  `ProductID` int DEFAULT NULL,
  `Quantity` int NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  `Subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`DetailID`),
  KEY `SaleID` (`SaleID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `saledetail_ibfk_1` FOREIGN KEY (`SaleID`) REFERENCES `sale` (`SaleID`),
  CONSTRAINT `saledetail_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: saledetail (39 行)
-- ----------------------------
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (1, 1, 3, 20, '4.50', '90.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (2, 2, 4, 2, '49.90', '99.80');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (3, 3, 4, 2, '49.90', '99.80');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (4, 4, 3, 1, '4.50', '4.50');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (5, 5, 2, 2, '8.90', '17.80');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (6, 6, 3, 1, '4.50', '4.50');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (7, 7, 2, 1, '8.90', '8.90');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (8, 8, 3, 1, '4.50', '4.50');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (9, 9, 5, 10, '3.98', '39.80');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (10, 9, 3, 12, '4.50', '54.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (11, 10, 3, 12, '4.50', '54.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (12, 11, 4, 2, '49.90', '99.80');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (13, 12, 3, 3, '4.50', '13.50');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (14, 13, 4, 21, '49.90', '1047.90');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (15, 14, 3, 10, '4.50', '45.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (16, 14, 2, 10, '8.90', '89.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (17, 14, 5, 10, '3.98', '39.80');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (18, 15, 3, 3, '4.50', '13.50');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (19, 16, 3, 3, '4.50', '13.50');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (20, 16, 5, 2, '3.98', '7.96');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (21, 17, 4, 10, '49.90', '499.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (22, 17, 5, 20, '3.98', '79.60');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (23, 18, 3, 10, '4.50', '45.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (24, 19, 4, 10, '49.90', '499.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (25, 20, 2, 2, '8.90', '17.80');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (26, 20, 4, 2, '49.90', '99.80');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (27, 21, 3, 10, '4.50', '45.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (28, 21, 5, 20, '3.98', '79.60');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (29, 21, 2, 30, '8.90', '267.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (30, 22, 3, 20, '4.50', '90.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (31, 22, 4, 10, '49.90', '499.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (32, 23, 5, 20, '3.98', '79.60');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (33, 23, 2, 10, '8.90', '89.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (34, 24, 10, 5, '20.00', '100.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (35, 24, 3, 10, '4.50', '45.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (36, 25, 3, 10, '4.50', '45.00');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (37, 25, 5, 10, '3.98', '39.80');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (38, 26, 5, 10, '3.98', '39.80');
INSERT INTO `saledetail` (`DetailID`, `SaleID`, `ProductID`, `Quantity`, `Price`, `Subtotal`) VALUES (39, 27, 3, 1, '4.50', '4.50');

-- ----------------------------
-- 表结构: salereturn
-- ----------------------------
DROP TABLE IF EXISTS `salereturn`;
CREATE TABLE `salereturn` (
  `ReturnID` int NOT NULL AUTO_INCREMENT,
  `SaleID` int NOT NULL,
  `ReturnDate` datetime NOT NULL,
  `Reason` varchar(255) NOT NULL,
  `Quantity` int NOT NULL,
  PRIMARY KEY (`ReturnID`),
  KEY `SaleID` (`SaleID`),
  CONSTRAINT `salereturn_ibfk_1` FOREIGN KEY (`SaleID`) REFERENCES `sale` (`SaleID`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: salereturn (8 行)
-- ----------------------------
INSERT INTO `salereturn` (`ReturnID`, `SaleID`, `ReturnDate`, `Reason`, `Quantity`) VALUES (11, 9, '2024-12-20 17:09:41', '1', 1);
INSERT INTO `salereturn` (`ReturnID`, `SaleID`, `ReturnDate`, `Reason`, `Quantity`) VALUES (12, 8, '2024-12-20 17:10:05', '1', 1);
INSERT INTO `salereturn` (`ReturnID`, `SaleID`, `ReturnDate`, `Reason`, `Quantity`) VALUES (13, 10, '2024-12-20 17:28:38', '多买了', 1);
INSERT INTO `salereturn` (`ReturnID`, `SaleID`, `ReturnDate`, `Reason`, `Quantity`) VALUES (14, 11, '2024-12-20 18:37:54', '坏的', 1);
INSERT INTO `salereturn` (`ReturnID`, `SaleID`, `ReturnDate`, `Reason`, `Quantity`) VALUES (15, 16, '2024-12-20 23:36:27', '空的', 1);
INSERT INTO `salereturn` (`ReturnID`, `SaleID`, `ReturnDate`, `Reason`, `Quantity`) VALUES (16, 17, '2024-12-20 23:52:17', '过期', 3);
INSERT INTO `salereturn` (`ReturnID`, `SaleID`, `ReturnDate`, `Reason`, `Quantity`) VALUES (17, 15, '2024-12-21 23:29:58', '过期', 1);
INSERT INTO `salereturn` (`ReturnID`, `SaleID`, `ReturnDate`, `Reason`, `Quantity`) VALUES (18, 25, '2025-01-17 12:33:31', '烂了', 1);

-- ----------------------------
-- 表结构: salereturndetail
-- ----------------------------
DROP TABLE IF EXISTS `salereturndetail`;
CREATE TABLE `salereturndetail` (
  `ReturnDetailID` int NOT NULL AUTO_INCREMENT,
  `ReturnID` int NOT NULL,
  `ProductID` int NOT NULL,
  `Quantity` int NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  `Subtotal` decimal(10,2) GENERATED ALWAYS AS ((`Price` * `Quantity`)) STORED,
  PRIMARY KEY (`ReturnDetailID`),
  KEY `ReturnID` (`ReturnID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `salereturndetail_ibfk_1` FOREIGN KEY (`ReturnID`) REFERENCES `salereturn` (`ReturnID`),
  CONSTRAINT `salereturndetail_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: salereturndetail (9 行)
-- ----------------------------
INSERT INTO `salereturndetail` (`ReturnDetailID`, `ReturnID`, `ProductID`, `Quantity`, `Price`) VALUES (1, 11, 5, 1, '3.98');
INSERT INTO `salereturndetail` (`ReturnDetailID`, `ReturnID`, `ProductID`, `Quantity`, `Price`) VALUES (2, 12, 3, 1, '4.50');
INSERT INTO `salereturndetail` (`ReturnDetailID`, `ReturnID`, `ProductID`, `Quantity`, `Price`) VALUES (3, 13, 3, 1, '4.50');
INSERT INTO `salereturndetail` (`ReturnDetailID`, `ReturnID`, `ProductID`, `Quantity`, `Price`) VALUES (4, 14, 4, 1, '49.90');
INSERT INTO `salereturndetail` (`ReturnDetailID`, `ReturnID`, `ProductID`, `Quantity`, `Price`) VALUES (5, 15, 3, 1, '4.50');
INSERT INTO `salereturndetail` (`ReturnDetailID`, `ReturnID`, `ProductID`, `Quantity`, `Price`) VALUES (6, 16, 4, 2, '49.90');
INSERT INTO `salereturndetail` (`ReturnDetailID`, `ReturnID`, `ProductID`, `Quantity`, `Price`) VALUES (7, 16, 5, 1, '3.98');
INSERT INTO `salereturndetail` (`ReturnDetailID`, `ReturnID`, `ProductID`, `Quantity`, `Price`) VALUES (8, 17, 3, 1, '4.50');
INSERT INTO `salereturndetail` (`ReturnDetailID`, `ReturnID`, `ProductID`, `Quantity`, `Price`) VALUES (9, 18, 5, 1, '3.98');

-- ----------------------------
-- 表结构: stockcheck
-- ----------------------------
DROP TABLE IF EXISTS `stockcheck`;
CREATE TABLE `stockcheck` (
  `CheckID` int NOT NULL AUTO_INCREMENT,
  `CheckNo` varchar(20) NOT NULL,
  `CheckDate` date NOT NULL,
  `EmployeeID` int NOT NULL,
  `Status` enum('draft','submitted','approved') NOT NULL,
  `Note` text,
  PRIMARY KEY (`CheckID`),
  KEY `EmployeeID` (`EmployeeID`),
  CONSTRAINT `stockcheck_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: stockcheck (16 行)
-- ----------------------------
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (1, 'PD20241219481', '2024-12-19', 2, 'submitted', '方便面被老鼠吃了');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (2, 'PD20241219202', '2024-12-19', 5, 'draft', '11');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (3, 'PD20241219202', '2024-12-19', 5, 'submitted', '11');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (4, 'PD20241219115', '2024-12-19', 2, 'submitted', '111');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (5, 'PD20241219360', '2024-12-19', 4, 'submitted', '无');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (6, 'PD20241220070', '2024-12-20', 6, 'submitted', '111');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (7, 'PD20241220618', '2024-12-20', 4, 'submitted', '111');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (8, 'PD20241220037', '2024-12-20', 4, 'submitted', '8451974');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (9, 'PD20241220013', '2024-12-20', 5, 'submitted', '1');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (10, 'PD20241221540', '2024-12-21', 6, 'draft', '12月21号查');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (11, 'PD20241221902', '2024-12-21', 6, 'submitted', '12月21号查');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (12, 'PD20241221216', '2024-12-21', 5, 'submitted', '盘点好了12.31');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (13, 'PD20250117607', '2025-01-17', 4, 'submitted', '1月17号查');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (14, 'PD20250118598', '2025-01-18', 3, 'submitted', '1月18号查');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (15, 'PD20250118693', '2025-01-18', 3, 'draft', '');
INSERT INTO `stockcheck` (`CheckID`, `CheckNo`, `CheckDate`, `EmployeeID`, `Status`, `Note`) VALUES (16, 'PD20250322562', '2025-03-22', 1, 'submitted', '3月22号查');

-- ----------------------------
-- 表结构: stockcheckdetail
-- ----------------------------
DROP TABLE IF EXISTS `stockcheckdetail`;
CREATE TABLE `stockcheckdetail` (
  `DetailID` int NOT NULL AUTO_INCREMENT,
  `CheckID` int NOT NULL,
  `ProductID` int NOT NULL,
  `SystemStock` int NOT NULL,
  `ActualStock` int NOT NULL,
  `DifferenceQty` int NOT NULL,
  `DifferenceReason` text,
  PRIMARY KEY (`DetailID`),
  KEY `CheckID` (`CheckID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `stockcheckdetail_ibfk_1` FOREIGN KEY (`CheckID`) REFERENCES `stockcheck` (`CheckID`),
  CONSTRAINT `stockcheckdetail_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: stockcheckdetail (96 行)
-- ----------------------------
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (1, 1, 1, 1, 1, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (2, 1, 2, 600, 600, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (3, 1, 3, 2020, 2010, -10, '方便面被老鼠吃了');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (4, 1, 4, 800, 800, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (5, 1, 5, 300, 300, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (6, 1, 10, 10, 10, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (7, 2, 1, 1, 1, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (8, 2, 2, 600, 600, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (9, 2, 3, 2010, 2010, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (10, 2, 4, 800, 798, -2, '顺手的事');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (11, 2, 5, 300, 300, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (12, 2, 10, 10, 10, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (13, 3, 1, 1, 1, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (14, 3, 2, 600, 600, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (15, 3, 3, 2010, 2010, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (16, 3, 4, 800, 798, -2, '顺手的事');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (17, 3, 5, 300, 300, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (18, 3, 10, 10, 10, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (19, 4, 1, 1, 1, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (20, 4, 2, 600, 600, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (21, 4, 3, 2010, 2008, -2, '被老鼠吃了');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (22, 4, 4, 798, 798, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (23, 4, 5, 300, 300, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (24, 4, 10, 10, 10, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (25, 5, 1, 1, 1, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (26, 5, 2, 597, 597, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (27, 5, 3, 1986, 1986, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (28, 5, 4, 794, 794, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (29, 5, 5, 300, 300, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (30, 5, 10, 10, 10, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (31, 6, 1, 1, 1, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (32, 6, 2, 597, 595, -2, '顺手的事');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (33, 6, 3, 1985, 1985, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (34, 6, 4, 794, 794, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (35, 6, 5, 300, 300, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (36, 6, 10, 10, 10, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (37, 7, 1, 6, 6, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (38, 7, 2, 585, 584, -1, '被老鼠吃了');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (39, 7, 3, 2047, 2047, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (40, 7, 4, 772, 772, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (41, 7, 5, 281, 281, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (42, 7, 10, 12, 12, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (43, 8, 1, 6, 3, -3, '过期');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (44, 8, 2, 1707, 1707, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (45, 8, 3, 2105, 2105, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (46, 8, 4, 772, 772, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (47, 8, 5, 279, 279, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (48, 8, 10, 12, 12, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (49, 9, 1, 3, 1, -2, '666');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (50, 9, 2, 1707, 1707, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (51, 9, 3, 2105, 2105, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (52, 9, 4, 772, 772, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (53, 9, 5, 279, 279, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (54, 9, 10, 12, 12, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (55, 10, 1, 6, 6, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (56, 10, 2, 1707, 1705, -2, '被老鼠吃了');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (57, 10, 3, 2105, 2105, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (58, 10, 4, 754, 754, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (59, 10, 5, 260, 260, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (60, 10, 10, 12, 12, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (61, 11, 1, 6, 6, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (62, 11, 2, 1707, 1705, -2, '被老鼠吃了');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (63, 11, 3, 2105, 2105, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (64, 11, 4, 754, 754, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (65, 11, 5, 260, 260, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (66, 11, 10, 12, 12, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (67, 12, 1, 6, 3, -3, '丢失');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (68, 12, 2, 1803, 1803, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (69, 12, 3, 2105, 2105, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (70, 12, 4, 752, 752, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (71, 12, 5, 260, 260, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (72, 12, 10, 32, 32, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (73, 13, 1, 32, 31, -1, '老鼠吃了');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (74, 13, 2, 1975, 1975, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (75, 13, 3, 2066, 2066, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (76, 13, 4, 742, 742, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (77, 13, 5, 220, 220, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (78, 13, 10, 27, 27, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (79, 14, 1, 31, 31, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (80, 14, 2, 1975, 1975, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (81, 14, 3, 2056, 2056, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (82, 14, 4, 742, 742, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (83, 14, 5, 211, 211, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (84, 14, 10, 27, 27, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (85, 15, 1, 31, 31, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (86, 15, 2, 1975, 1975, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (87, 15, 3, 2056, 2056, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (88, 15, 4, 742, 742, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (89, 15, 5, 211, 211, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (90, 15, 10, 27, 27, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (91, 16, 1, 31, 30, -1, '大米变质');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (92, 16, 2, 1975, 1975, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (93, 16, 3, 2056, 2056, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (94, 16, 4, 742, 742, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (95, 16, 5, 201, 201, 0, '');
INSERT INTO `stockcheckdetail` (`DetailID`, `CheckID`, `ProductID`, `SystemStock`, `ActualStock`, `DifferenceQty`, `DifferenceReason`) VALUES (96, 16, 10, 27, 27, 0, '');

-- ----------------------------
-- 表结构: supplier
-- ----------------------------
DROP TABLE IF EXISTS `supplier`;
CREATE TABLE `supplier` (
  `SupplierID` int NOT NULL AUTO_INCREMENT,
  `SupplierName` varchar(100) NOT NULL,
  `ContactPerson` varchar(50) DEFAULT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `Address` text,
  PRIMARY KEY (`SupplierID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: supplier (8 行)
-- ----------------------------
INSERT INTO `supplier` (`SupplierID`, `SupplierName`, `ContactPerson`, `PhoneNumber`, `Address`) VALUES (1, '华南食品供应商', '张三', '13800138001', '广州市天河区车坡路123号');
INSERT INTO `supplier` (`SupplierID`, `SupplierName`, `ContactPerson`, `PhoneNumber`, `Address`) VALUES (2, '东北粮油公司', '李四', '13900139002', '哈尔滨市道里区中央大街456号');
INSERT INTO `supplier` (`SupplierID`, `SupplierName`, `ContactPerson`, `PhoneNumber`, `Address`) VALUES (3, '西部果蔬批发', '王五', '13700137003', '成都市武侯区科华路789号');
INSERT INTO `supplier` (`SupplierID`, `SupplierName`, `ContactPerson`, `PhoneNumber`, `Address`) VALUES (4, '东大第一有限公司', '梁贤广', '13767601663', '江西省抚州市东乡区');
INSERT INTO `supplier` (`SupplierID`, `SupplierName`, `ContactPerson`, `PhoneNumber`, `Address`) VALUES (5, '东大第二有限公司', '桂柏林', '110', '陕西省西安市长安区东大街道东祥路1号西北工业大学长安校区');
INSERT INTO `supplier` (`SupplierID`, `SupplierName`, `ContactPerson`, `PhoneNumber`, `Address`) VALUES (7, '东大第三有限公司', '郭星治', '555555', '陕西省西安市长安区东大街道东祥路1号西北工业大学长安校区401');
INSERT INTO `supplier` (`SupplierID`, `SupplierName`, `ContactPerson`, `PhoneNumber`, `Address`) VALUES (8, '东大第四有限公司', '王雨辰', '120', '陕西省西安市长安区东大街道东祥路1号西北工业大学长安校区401');
INSERT INTO `supplier` (`SupplierID`, `SupplierName`, `ContactPerson`, `PhoneNumber`, `Address`) VALUES (12, '东大第八有限公司', '梁贤广1234', '114514', '东乡区第一中学');

-- ----------------------------
-- 视图结构: userpermissionsview
-- ----------------------------
DROP VIEW IF EXISTS `userpermissionsview`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `userpermissionsview` AS select `u`.`UserID` AS `UserID`,`u`.`Username` AS `Username`,`u`.`FullName` AS `FullName`,`u`.`Email` AS `Email`,`u`.`Status` AS `Status`,`r`.`RoleID` AS `RoleID`,`r`.`RoleName` AS `RoleName`,`p`.`PermissionID` AS `PermissionID`,`p`.`PermissionCode` AS `PermissionCode`,`p`.`PermissionName` AS `PermissionName`,`p`.`ModuleName` AS `ModuleName` from ((((`users` `u` join `userroles` `ur` on((`u`.`UserID` = `ur`.`UserID`))) join `roles` `r` on((`ur`.`RoleID` = `r`.`RoleID`))) join `rolepermissions` `rp` on((`r`.`RoleID` = `rp`.`RoleID`))) join `permissions` `p` on((`rp`.`PermissionID` = `p`.`PermissionID`))) where ((`u`.`Status` = 1) and (`r`.`Status` = 1));

-- ----------------------------
-- 视图数据: userpermissionsview (52 行)
-- ----------------------------
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 1, 'products_manage', '商品管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 2, 'employees_manage', '员工管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 3, 'customers_manage', '客户管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 4, 'suppliers_manage', '供应商管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 5, 'users_manage', '用户管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 6, 'purchase_entry', '入库登记', '进货管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 7, 'purchase_query', '入库查询', '进货管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 8, 'inventory_query', '库存查询', '库房管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 9, 'stock_check', '库存盘点', '库房管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 10, 'sales_entry', '销售登记', '销售管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 11, 'sales_return', '销售退货', '销售管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 12, 'sales_query', '销售查询', '销售管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 13, 'daily_stats', '当日统计', '财务统计');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 14, 'monthly_stats', '月度统计', '财务统计');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 15, 'quality_inspection', '入库质检', '质检管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 16, 'quality_query', '质检查询', '质检管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (1, 'admin', '系统管理员', 'admin@supermarket.com', 1, 1, 'admin', 17, 'outbound_manage', '出库管理', '库房管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (2, 'warehouse', '仓库管理员', 'warehouse@supermarket.com', 1, 2, 'warehouse_manager', 1, 'products_manage', '商品管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (2, 'warehouse', '仓库管理员', 'warehouse@supermarket.com', 1, 2, 'warehouse_manager', 4, 'suppliers_manage', '供应商管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (2, 'warehouse', '仓库管理员', 'warehouse@supermarket.com', 1, 2, 'warehouse_manager', 6, 'purchase_entry', '入库登记', '进货管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (2, 'warehouse', '仓库管理员', 'warehouse@supermarket.com', 1, 2, 'warehouse_manager', 7, 'purchase_query', '入库查询', '进货管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (2, 'warehouse', '仓库管理员', 'warehouse@supermarket.com', 1, 2, 'warehouse_manager', 8, 'inventory_query', '库存查询', '库房管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (2, 'warehouse', '仓库管理员', 'warehouse@supermarket.com', 1, 2, 'warehouse_manager', 9, 'stock_check', '库存盘点', '库房管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (2, 'warehouse', '仓库管理员', 'warehouse@supermarket.com', 1, 2, 'warehouse_manager', 15, 'quality_inspection', '入库质检', '质检管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (2, 'warehouse', '仓库管理员', 'warehouse@supermarket.com', 1, 2, 'warehouse_manager', 16, 'quality_query', '质检查询', '质检管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (2, 'warehouse', '仓库管理员', 'warehouse@supermarket.com', 1, 2, 'warehouse_manager', 17, 'outbound_manage', '出库管理', '库房管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (3, 'sales', '销售经理', 'sales@supermarket.com', 1, 4, 'sales_manager', 1, 'products_manage', '商品管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (3, 'sales', '销售经理', 'sales@supermarket.com', 1, 4, 'sales_manager', 3, 'customers_manage', '客户管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (3, 'sales', '销售经理', 'sales@supermarket.com', 1, 4, 'sales_manager', 10, 'sales_entry', '销售登记', '销售管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (3, 'sales', '销售经理', 'sales@supermarket.com', 1, 4, 'sales_manager', 11, 'sales_return', '销售退货', '销售管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (3, 'sales', '销售经理', 'sales@supermarket.com', 1, 4, 'sales_manager', 12, 'sales_query', '销售查询', '销售管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (3, 'sales', '销售经理', 'sales@supermarket.com', 1, 4, 'sales_manager', 13, 'daily_stats', '当日统计', '财务统计');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (3, 'sales', '销售经理', 'sales@supermarket.com', 1, 4, 'sales_manager', 14, 'monthly_stats', '月度统计', '财务统计');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (5, 'cashier1', '收银员', 'cashier1@supermarket.com', 1, 6, 'cashier', 3, 'customers_manage', '客户管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (5, 'cashier1', '收银员', 'cashier1@supermarket.com', 1, 6, 'cashier', 10, 'sales_entry', '销售登记', '销售管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 1, 'products_manage', '商品管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 2, 'employees_manage', '员工管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 3, 'customers_manage', '客户管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 4, 'suppliers_manage', '供应商管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 5, 'users_manage', '用户管理', '基础信息管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 6, 'purchase_entry', '入库登记', '进货管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 7, 'purchase_query', '入库查询', '进货管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 8, 'inventory_query', '库存查询', '库房管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 9, 'stock_check', '库存盘点', '库房管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 10, 'sales_entry', '销售登记', '销售管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 11, 'sales_return', '销售退货', '销售管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 12, 'sales_query', '销售查询', '销售管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 13, 'daily_stats', '当日统计', '财务统计');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 14, 'monthly_stats', '月度统计', '财务统计');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 15, 'quality_inspection', '入库质检', '质检管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 16, 'quality_query', '质检查询', '质检管理');
-- INSERT INTO `userpermissionsview` (`UserID`, `Username`, `FullName`, `Email`, `Status`, `RoleID`, `RoleName`, `PermissionID`, `PermissionCode`, `PermissionName`, `ModuleName`) VALUES (6, 'admin-li', '系统管理员', 'li@example.com', 1, 1, 'admin', 17, 'outbound_manage', '出库管理', '库房管理');

-- ----------------------------
-- 表结构: userroles
-- ----------------------------
DROP TABLE IF EXISTS `userroles`;
CREATE TABLE `userroles` (
  `UserRoleID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `RoleID` int NOT NULL,
  `AssignedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `AssignedBy` int DEFAULT NULL,
  PRIMARY KEY (`UserRoleID`),
  UNIQUE KEY `unique_user_role` (`UserID`,`RoleID`),
  KEY `RoleID` (`RoleID`),
  KEY `AssignedBy` (`AssignedBy`),
  CONSTRAINT `userroles_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `userroles_ibfk_2` FOREIGN KEY (`RoleID`) REFERENCES `roles` (`RoleID`) ON DELETE CASCADE,
  CONSTRAINT `userroles_ibfk_3` FOREIGN KEY (`AssignedBy`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: userroles (5 行)
-- ----------------------------
INSERT INTO `userroles` (`UserRoleID`, `UserID`, `RoleID`, `AssignedAt`, `AssignedBy`) VALUES (6, 1, 1, '2025-06-02 19:31:20', NULL);
INSERT INTO `userroles` (`UserRoleID`, `UserID`, `RoleID`, `AssignedAt`, `AssignedBy`) VALUES (7, 6, 1, '2025-06-02 19:39:17', NULL);
INSERT INTO `userroles` (`UserRoleID`, `UserID`, `RoleID`, `AssignedAt`, `AssignedBy`) VALUES (10, 5, 6, '2025-06-02 19:47:50', NULL);
INSERT INTO `userroles` (`UserRoleID`, `UserID`, `RoleID`, `AssignedAt`, `AssignedBy`) VALUES (12, 2, 2, '2025-06-02 19:55:47', NULL);
INSERT INTO `userroles` (`UserRoleID`, `UserID`, `RoleID`, `AssignedAt`, `AssignedBy`) VALUES (13, 3, 4, '2025-06-02 19:56:01', NULL);

-- ----------------------------
-- 表结构: users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` enum('admin','warehouse','sales','cashier') NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LastLogin` timestamp NULL DEFAULT NULL,
  `Status` tinyint DEFAULT '1',
  `Email` varchar(100) DEFAULT NULL,
  `FullName` varchar(100) DEFAULT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: users (6 行)
-- ----------------------------
INSERT INTO `users` (`UserID`, `Username`, `Password`, `Role`, `CreatedAt`, `LastLogin`, `Status`, `Email`, `FullName`, `PhoneNumber`) VALUES (1, 'admin', 'admin123', 'admin', '2024-12-20 22:03:05', '2025-06-07 19:09:34', 1, 'admin@supermarket.com', '系统管理员', '555555');
INSERT INTO `users` (`UserID`, `Username`, `Password`, `Role`, `CreatedAt`, `LastLogin`, `Status`, `Email`, `FullName`, `PhoneNumber`) VALUES (2, 'warehouse', 'wh123', 'warehouse', '2024-12-20 22:03:05', '2025-06-07 17:09:39', 1, 'warehouse@supermarket.com', '仓库管理员', '3333');
INSERT INTO `users` (`UserID`, `Username`, `Password`, `Role`, `CreatedAt`, `LastLogin`, `Status`, `Email`, `FullName`, `PhoneNumber`) VALUES (3, 'sales', 'sales123', 'sales', '2024-12-20 22:03:05', '2025-06-07 17:49:03', 1, 'sales@supermarket.com', '销售经理', '44444');
INSERT INTO `users` (`UserID`, `Username`, `Password`, `Role`, `CreatedAt`, `LastLogin`, `Status`, `Email`, `FullName`, `PhoneNumber`) VALUES (5, 'cashier1', 'cashier123', 'cashier', '2025-06-02 16:15:03', '2025-06-02 19:55:09', 1, 'cashier1@supermarket.com', '收银员', '222222');
INSERT INTO `users` (`UserID`, `Username`, `Password`, `Role`, `CreatedAt`, `LastLogin`, `Status`, `Email`, `FullName`, `PhoneNumber`) VALUES (6, 'admin-li', '123456', 'admin', '2025-06-02 19:39:17', '2025-06-02 19:53:50', 1, 'li@example.com', '系统管理员', '18500135003');
INSERT INTO `users` (`UserID`, `Username`, `Password`, `Role`, `CreatedAt`, `LastLogin`, `Status`, `Email`, `FullName`, `PhoneNumber`) VALUES (7, 'sale-wu', '123456', 'admin', '2025-06-02 19:41:19', '2025-06-02 19:45:52', 1, 'wu@example.com', '销售经理', '11111123');

-- ----------------------------
-- 表结构: users_backup
-- ----------------------------
DROP TABLE IF EXISTS `users_backup`;
CREATE TABLE `users_backup` (
  `UserID` int NOT NULL DEFAULT '0',
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` enum('admin','warehouse','sales') NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LastLogin` timestamp NULL DEFAULT NULL,
  `Status` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- 表数据: users_backup (3 行)
-- ----------------------------
INSERT INTO `users_backup` (`UserID`, `Username`, `Password`, `Role`, `CreatedAt`, `LastLogin`, `Status`) VALUES (1, 'admin', 'admin123', 'admin', '2024-12-20 22:03:05', NULL, 1);
INSERT INTO `users_backup` (`UserID`, `Username`, `Password`, `Role`, `CreatedAt`, `LastLogin`, `Status`) VALUES (2, 'warehouse', 'wh123', 'warehouse', '2024-12-20 22:03:05', NULL, 1);
INSERT INTO `users_backup` (`UserID`, `Username`, `Password`, `Role`, `CreatedAt`, `LastLogin`, `Status`) VALUES (3, 'sales', 'sales123', 'sales', '2024-12-20 22:03:05', NULL, 1);

SET FOREIGN_KEY_CHECKS=1;
