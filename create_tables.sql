-- 创建供应商表（Supplier）
CREATE TABLE Supplier (
    SupplierID INT PRIMARY KEY AUTO_INCREMENT,
    SupplierName VARCHAR(100) NOT NULL,
    ContactPerson VARCHAR(50),
    PhoneNumber VARCHAR(20),
    Address TEXT
);

-- 创建商品表（Product）
CREATE TABLE Product (
    ProductID INT PRIMARY KEY AUTO_INCREMENT,
    ProductName VARCHAR(100) NOT NULL,
    Category VARCHAR(50),
    Price DECIMAL(10,2) NOT NULL,
    PurchasePrice DECIMAL(10,2) NOT NULL,
    StockQuantity INT DEFAULT 0,
    SupplierID INT,
    FOREIGN KEY (SupplierID) REFERENCES Supplier(SupplierID)
);

-- 创建员工表（Employee）
CREATE TABLE Employee (
    EmployeeID INT PRIMARY KEY AUTO_INCREMENT,
    EmployeeName VARCHAR(50) NOT NULL,
    Position VARCHAR(50),
    Salary DECIMAL(10,2),
    HireDate DATE,
    PhoneNumber VARCHAR(20)
);

-- 创建客户表（Customer）
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerName VARCHAR(50) NOT NULL,
    PhoneNumber VARCHAR(20),
    Email VARCHAR(100),
    VIPStatus BOOLEAN DEFAULT FALSE,
    IsActive BOOLEAN DEFAULT 1
);

-- 创建进货表（Purchase）
CREATE TABLE Purchase (
    PurchaseID INT PRIMARY KEY AUTO_INCREMENT,
    ProductID INT,
    SupplierID INT,
    Quantity INT NOT NULL,
    PurchasePrice DECIMAL(10,2) NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL,
    PurchaseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID),
    FOREIGN KEY (SupplierID) REFERENCES Supplier(SupplierID)
);

-- 创建库存表（Inventory）
CREATE TABLE Inventory (
    InventoryID INT PRIMARY KEY AUTO_INCREMENT,
    ProductID INT,
    StockQuantity INT NOT NULL,
    Location VARCHAR(50),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

-- 创建销售表（Sale）
CREATE TABLE Sale (
    SaleID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    EmployeeID INT,
    SaleDate DATETIME,
    TotalAmount DECIMAL(10,2),
    DiscountAmount DECIMAL(10,2) DEFAULT 0,
    FinalAmount DECIMAL(10,2),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
);

-- 创建销售明细表（SaleDetail）
CREATE TABLE SaleDetail (
    DetailID INT PRIMARY KEY AUTO_INCREMENT,
    SaleID INT,
    ProductID INT,
    Quantity INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (SaleID) REFERENCES Sale(SaleID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

-- 创建销售退货表（SaleReturn）
CREATE TABLE SaleReturn (
    ReturnID INT PRIMARY KEY AUTO_INCREMENT,
    SaleID INT,
    Quantity INT NOT NULL,
    ReturnDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Reason TEXT,
    FOREIGN KEY (SaleID) REFERENCES Sale(SaleID)
);

-- 创建财务报表表（FinancialReport）
CREATE TABLE FinancialReport (
    ReportID INT PRIMARY KEY AUTO_INCREMENT,
    ReportDate DATE NOT NULL,
    TotalRevenue DECIMAL(15,2) NOT NULL,
    TotalExpenses DECIMAL(15,2) NOT NULL,
    NetProfit DECIMAL(15,2) NOT NULL,
    ReportType ENUM('daily', 'monthly', 'yearly') NOT NULL
); 

CREATE TABLE StockCheck (
    CheckID INT PRIMARY KEY AUTO_INCREMENT,
    CheckNo VARCHAR(20) NOT NULL,
    CheckDate DATE NOT NULL,
    EmployeeID INT NOT NULL,
    Status ENUM('draft', 'submitted', 'approved') NOT NULL,
    Note TEXT,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
);

CREATE TABLE StockCheckDetail (
    DetailID INT PRIMARY KEY AUTO_INCREMENT,
    CheckID INT NOT NULL,
    ProductID INT NOT NULL,
    SystemStock INT NOT NULL,
    ActualStock INT NOT NULL,
    DifferenceQty INT NOT NULL,
    DifferenceReason TEXT,
    FOREIGN KEY (CheckID) REFERENCES StockCheck(CheckID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

-- 1. 先删除引用了 Sale 表的表
DROP TABLE IF EXISTS SaleDetail;
DROP TABLE IF EXISTS SaleReturn;

-- 2. 然后删除 Sale 表
DROP TABLE IF EXISTS Sale;

-- 3. 重新创建 Sale 表
CREATE TABLE Sale (
    SaleID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    EmployeeID INT,
    SaleDate DATETIME,
    TotalAmount DECIMAL(10,2),
    DiscountAmount DECIMAL(10,2) DEFAULT 0,
    FinalAmount DECIMAL(10,2),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
);

-- 4. 重新创建 SaleDetail 表
CREATE TABLE SaleDetail (
    DetailID INT PRIMARY KEY AUTO_INCREMENT,
    SaleID INT,
    ProductID INT,
    Quantity INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (SaleID) REFERENCES Sale(SaleID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

-- 创建退货明细表
CREATE TABLE SaleReturnDetail (
    ReturnDetailID INT PRIMARY KEY AUTO_INCREMENT,
    ReturnID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) GENERATED ALWAYS AS (Price * Quantity) STORED,
    FOREIGN KEY (ReturnID) REFERENCES SaleReturn(ReturnID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 创建退货主表
CREATE TABLE SaleReturn (
    ReturnID INT PRIMARY KEY AUTO_INCREMENT,
    SaleID INT NOT NULL,
    ReturnDate DATETIME NOT NULL,
    Reason VARCHAR(255) NOT NULL,
    Quantity INT NOT NULL,
    FOREIGN KEY (SaleID) REFERENCES Sale(SaleID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 删除原有的 Users 表
DROP TABLE IF EXISTS Users;

-- 创建新的 Users 表，包含所需的所有字段
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastLogin DATETIME NULL,
    Status TINYINT NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;