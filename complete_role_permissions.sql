-- ========================================
-- 超市管理系统 - 完整角色权限管理系统（修正版）
-- 包含：表创建、数据迁移、权限配置、用户数据更新、错误修复
-- ========================================

-- 第一步：备份现有用户数据
CREATE TABLE IF NOT EXISTS Users_Backup AS SELECT * FROM Users;

-- 第二步：创建角色权限表（如果不存在）
-- 删除可能存在的旧表（注意顺序，先删除有外键依赖的表）
DROP TABLE IF EXISTS UserRoles;
DROP TABLE IF EXISTS RolePermissions;
DROP TABLE IF EXISTS Permissions;
DROP TABLE IF EXISTS Roles;

-- 1. 角色表
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY AUTO_INCREMENT,
    RoleName VARCHAR(50) NOT NULL UNIQUE,
    RoleDescription TEXT,
    Status TINYINT DEFAULT 1,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 权限表
CREATE TABLE Permissions (
    PermissionID INT PRIMARY KEY AUTO_INCREMENT,
    PermissionName VARCHAR(50) NOT NULL UNIQUE,
    PermissionCode VARCHAR(50) NOT NULL UNIQUE,
    ModuleName VARCHAR(50) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 角色权限映射表
CREATE TABLE RolePermissions (
    RolePermissionID INT PRIMARY KEY AUTO_INCREMENT,
    RoleID INT NOT NULL,
    PermissionID INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE,
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (RoleID, PermissionID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 用户角色映射表
CREATE TABLE UserRoles (
    UserRoleID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    RoleID INT NOT NULL,
    AssignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    AssignedBy INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE,
    FOREIGN KEY (AssignedBy) REFERENCES Users(UserID),
    UNIQUE KEY unique_user_role (UserID, RoleID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 第三步：插入默认角色（包括兼容旧系统的角色名）
INSERT INTO Roles (RoleName, RoleDescription) VALUES
('admin', '系统管理员 - 拥有所有权限'),
('warehouse_manager', '仓库管理员 - 负责库存和进货管理'),
('warehouse', '仓库管理员 - 负责库存和进货管理'), -- 兼容旧数据
('sales_manager', '销售经理 - 负责销售和客户管理'),
('sales', '销售经理 - 负责销售和客户管理'), -- 兼容旧数据
('cashier', '收银员 - 只能进行销售操作');

-- 第四步：插入系统权限
INSERT INTO Permissions (PermissionName, PermissionCode, ModuleName, Description) VALUES
-- 基础信息管理权限
('商品管理', 'products_manage', '基础信息管理', '商品的增删改查'),
('员工管理', 'employees_manage', '基础信息管理', '员工的增删改查'),
('客户管理', 'customers_manage', '基础信息管理', '客户的增删改查'),
('供应商管理', 'suppliers_manage', '基础信息管理', '供应商的增删改查'),
('用户管理', 'users_manage', '基础信息管理', '用户和角色权限管理'),

-- 进货管理权限
('入库登记', 'purchase_entry', '进货管理', '商品入库登记'),
('入库查询', 'purchase_query', '进货管理', '入库记录查询'),

-- 库房管理权限
('库存查询', 'inventory_query', '库房管理', '库存信息查询'),
('库存盘点', 'stock_check', '库房管理', '库存盘点操作'),

-- 销售管理权限
('销售登记', 'sales_entry', '销售管理', '销售开单'),
('销售退货', 'sales_return', '销售管理', '销售退货处理'),
('销售查询', 'sales_query', '销售管理', '销售记录查询'),

-- 财务统计权限
('当日统计', 'daily_stats', '财务统计', '当日销售统计'),
('月度统计', 'monthly_stats', '财务统计', '月度销售统计');

-- 第五步：配置角色权限
-- 为管理员角色分配所有权限
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID 
FROM Roles r, Permissions p 
WHERE r.RoleName = 'admin';

-- 为仓库管理员分配相关权限（包括旧角色名）
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID 
FROM Roles r, Permissions p 
WHERE r.RoleName IN ('warehouse_manager', 'warehouse')
AND p.PermissionCode IN ('products_manage', 'suppliers_manage', 'purchase_entry', 'purchase_query', 'inventory_query', 'stock_check');

-- 为销售经理分配相关权限（包括旧角色名）
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID 
FROM Roles r, Permissions p 
WHERE r.RoleName IN ('sales_manager', 'sales')
AND p.PermissionCode IN ('products_manage', 'customers_manage', 'sales_entry', 'sales_return', 'sales_query', 'daily_stats', 'monthly_stats');

-- 为收银员分配基本权限
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID 
FROM Roles r, Permissions p 
WHERE r.RoleName = 'cashier' 
AND p.PermissionCode IN ('sales_entry', 'customers_manage');

-- 第六步：更新Users表结构（修正版 - 兼容不同MySQL版本）
-- 添加新字段到Users表
ALTER TABLE Users 
ADD COLUMN Email VARCHAR(100),
ADD COLUMN FullName VARCHAR(100),
ADD COLUMN PhoneNumber VARCHAR(20);

-- 第七步：迁移现有用户数据
-- 为现有用户分配角色（基于原有的Role字段）
INSERT IGNORE INTO UserRoles (UserID, RoleID, AssignedAt, AssignedBy)
SELECT 
    u.UserID, 
    r.RoleID,
    COALESCE(u.CreatedAt, NOW()),
    1  -- 假设是admin用户分配的
FROM Users u
JOIN Roles r ON r.RoleName = u.Role
WHERE u.Role IS NOT NULL;

-- 更新现有用户的完整信息
UPDATE Users SET 
    FullName = CASE 
        WHEN Username = 'admin' THEN '系统管理员'
        WHEN Username = 'warehouse' THEN '仓库管理员'
        WHEN Username = 'sales' THEN '销售经理'
        ELSE Username
    END,
    Email = CONCAT(Username, '@supermarket.com')
WHERE FullName IS NULL OR Email IS NULL;

-- 第八步：插入测试用户数据（如果需要）
INSERT IGNORE INTO Users (Username, Password, Role, FullName, Email, Status) VALUES
('cashier1', 'cashier123', 'cashier', '收银员', 'cashier1@supermarket.com', 1);

-- 第九步：为所有用户分配角色（包括新用户和修复缺失的角色）
INSERT IGNORE INTO UserRoles (UserID, RoleID, AssignedAt, AssignedBy)
SELECT 
    u.UserID, 
    r.RoleID,
    NOW(),
    1
FROM Users u
JOIN Roles r ON r.RoleName = CASE 
    WHEN u.Role IS NULL OR u.Role = '' THEN 'cashier'  -- 默认角色
    ELSE u.Role
END
WHERE NOT EXISTS (
    SELECT 1 FROM UserRoles ur 
    WHERE ur.UserID = u.UserID AND ur.RoleID = r.RoleID
);

-- 第十步：创建用于API的视图
CREATE OR REPLACE VIEW UserPermissionsView AS
SELECT 
    u.UserID,
    u.Username,
    u.FullName,
    u.Email,
    u.Status,
    r.RoleID,
    r.RoleName,
    p.PermissionID,
    p.PermissionCode,
    p.PermissionName,
    p.ModuleName
FROM Users u
JOIN UserRoles ur ON u.UserID = ur.UserID
JOIN Roles r ON ur.RoleID = r.RoleID
JOIN RolePermissions rp ON r.RoleID = rp.RoleID
JOIN Permissions p ON rp.PermissionID = p.PermissionID
WHERE u.Status = 1 AND r.Status = 1;

-- 第十一步：验证迁移结果
SELECT '========== 用户角色分配情况 ==========' as info;
SELECT 
    u.UserID,
    u.Username,
    u.FullName,
    u.Email,
    u.Role as OldRole,
    GROUP_CONCAT(r.RoleName ORDER BY r.RoleName SEPARATOR ', ') as NewRoles,
    u.Status,
    u.CreatedAt
FROM Users u
LEFT JOIN UserRoles ur ON u.UserID = ur.UserID
LEFT JOIN Roles r ON ur.RoleID = r.RoleID
GROUP BY u.UserID
ORDER BY u.UserID;

SELECT '========== 角色权限配置情况 ==========' as info;
SELECT 
    r.RoleName,
    r.RoleDescription,
    COUNT(rp.PermissionID) as PermissionCount,
    GROUP_CONCAT(
        CONCAT(p.ModuleName, ':', p.PermissionName) 
        ORDER BY p.ModuleName, p.PermissionName 
        SEPARATOR ' | '
    ) as Permissions
FROM Roles r
LEFT JOIN RolePermissions rp ON r.RoleID = rp.RoleID
LEFT JOIN Permissions p ON rp.PermissionID = p.PermissionID
GROUP BY r.RoleID
ORDER BY r.RoleName;

SELECT '========== 权限模块统计 ==========' as info;
SELECT 
    p.ModuleName,
    COUNT(*) as PermissionCount,
    GROUP_CONCAT(p.PermissionName ORDER BY p.PermissionName SEPARATOR ', ') as PermissionList
FROM Permissions p
GROUP BY p.ModuleName
ORDER BY p.ModuleName;

SELECT '========== 用户权限视图测试 ==========' as info;
SELECT 
    Username,
    FullName,
    RoleName,
    COUNT(PermissionCode) as TotalPermissions,
    GROUP_CONCAT(DISTINCT ModuleName ORDER BY ModuleName SEPARATOR ', ') as AccessModules
FROM UserPermissionsView 
GROUP BY UserID, Username, FullName, RoleName
ORDER BY Username;

-- 完成提示
SELECT '========== 角色权限系统部署完成（修正版）==========' as info;
SELECT '1. 已创建角色权限相关表' as step1;
SELECT '2. 已配置默认角色和权限' as step2;
SELECT '3. 已迁移现有用户数据' as step3;
SELECT '4. 已修复用户角色分配问题' as step4;
SELECT '5. 已创建用户权限视图' as step5;
SELECT '6. 系统已完全可用' as step6;