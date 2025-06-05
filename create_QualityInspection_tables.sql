-- 创建质检主表（QualityInspection）
-- 记录每次入库质检的基本信息，包括对应的入库单、质检人员、供应商、质检时间、备注等
CREATE TABLE QualityInspection (
    InspectionID INT PRIMARY KEY AUTO_INCREMENT, -- 质检记录主键
    PurchaseID INT NOT NULL,                    -- 关联入库单（Purchase表）
    Inspector VARCHAR(50) NOT NULL,             -- 质检人员姓名
    InspectionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 质检时间
    SupplierID INT,                             -- 供应商ID（参考Supplier表）
    Note TEXT,                                  -- 备注
    FOREIGN KEY (PurchaseID) REFERENCES Purchase(PurchaseID),
    FOREIGN KEY (SupplierID) REFERENCES Supplier(SupplierID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建质检明细表（QualityInspectionDetail）
-- 记录每次质检涉及的每种商品的结果（合格/不合格）、数量、备注等
CREATE TABLE QualityInspectionDetail (
    DetailID INT PRIMARY KEY AUTO_INCREMENT,     -- 明细主键
    InspectionID INT NOT NULL,                   -- 关联质检主表
    ProductID INT NOT NULL,                      -- 质检商品ID（参考Product表）
    Quantity INT NOT NULL,                       -- 质检数量
    Result ENUM('合格', '不合格') NOT NULL,      -- 质检结果
    Remark TEXT,                                 -- 备注
    FOREIGN KEY (InspectionID) REFERENCES QualityInspection(InspectionID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
