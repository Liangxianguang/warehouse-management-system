let currentUser = null; // 存储当前用户信息

document.addEventListener('DOMContentLoaded', function() {
    // 侧边栏切换
    document.getElementById('sidebarCollapse').addEventListener('click', function() {
        if (currentUser) {
            document.getElementById('sidebar').classList.toggle('active');
        } else {
            alert('请先登录');
        }
    });
    // 从localStorage获取保存的用户信息
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            if (currentUser && currentUser.username && currentUser.role) {
                loadDashboardPage();
                return;
            }
        } catch (e) {
            console.error('Error parsing saved user:', e);
        }
    }
    // 如果没有有效的用户信息,加载登录页面
    currentUser = null;
    loadLoginPage();
});

// 添加登录函数
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (data.success) {
            // 完整保存用户信息 
            currentUser = {
                userId: data.userId,
                username: data.username,
                role: data.role,
                status: data.status
            };
            
            // 保存到localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            loadDashboardPage();
        } else {
            alert(data.message || '登录失败');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('登录请求失败');
    }
}
// 加载登录页面
function loadLoginPage() {
    const content = `
        <div class="container">
            <div class="row justify-content-center mt-5">
                <div class="col-md-6">
                    <div class="card shadow">
                        <div class="card-body">
                            <h3 class="card-title text-center mb-4">超市管理系统登录</h3>
                            <form id="loginForm" onsubmit="event.preventDefault(); login();">
                                <div class="mb-3">
                                    <label for="username" class="form-label">用户名</label>
                                    <input type="text" class="form-control" id="username" required>
                                </div>
                                <div class="mb-3">
                                    <label for="password" class="form-label">密码</label>
                                    <input type="password" class="form-control" id="password" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">登录</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
}
// 实现退出功能
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    loadLoginPage();
}

// 添加权限控制函数
function checkPermission(page) {
    if (!currentUser) {
        alert('请先登录');
        return false;
    }

    switch (currentUser.role) {
        case 'admin':
            return true; // 管理员可以访问所有页面
        case 'warehouse':
            // 仓库管理员只能访问进货和库房管理页面
            return ['purchase-entry', 'purchase-query', 'inventory-query', 
                    'stock-check', 'warehouse'].includes(page);
        case 'sales':
            // 销售人员只能访问销售相关页面
            return ['sales-entry', 'sales-query', 'sales-return', 
                    'daily-stats','monthly-stats'].includes(page);
        default:
            return false;
    }
}

// 修改加载仪表板页面函数
function loadDashboardPage() {
    // 根据用户角色加载不同的功能卡片
    let functionalCards = '';
    
    if (currentUser.role === 'admin' || currentUser.role === 'sales') {
        functionalCards += `
            <!-- 销售管理卡片 -->
            <div class="col-md-4 mb-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <h5 class="card-title mb-3">
                            <i class="bi bi-cart3 text-primary me-2"></i>
                            销售管理
                        </h5>
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-primary" onclick="loadContent('sales-entry')">
                                <i class="bi bi-cart-plus me-2"></i>销售开单
                            </button>
                            <button class="btn btn-outline-primary" onclick="loadContent('sales-query')">
                                <i class="bi bi-search me-2"></i>销售查询
                            </button>
                            <button class="btn btn-outline-primary" onclick="loadContent('sales-return')">
                                <i class="bi bi-arrow-return-left me-2"></i>销售退货
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    if (currentUser.role === 'admin' || currentUser.role === 'warehouse') {
        functionalCards += `
            <!-- 库存管理卡片 -->
            <div class="col-md-4 mb-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <h5 class="card-title mb-3">
                            <i class="bi bi-box-seam text-success me-2"></i>
                            库存管理
                        </h5>
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-success" onclick="loadContent('purchase-entry')">
                                <i class="bi bi-box-arrow-in-down me-2"></i>商品入库
                            </button>
                            <button class="btn btn-outline-success" onclick="loadContent('inventory-query')">
                                <i class="bi bi-search me-2"></i>库存查询
                            </button>
                            <button class="btn btn-outline-success" onclick="loadContent('stock-check')">
                                <i class="bi bi-clipboard-check me-2"></i>库存盘点
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 统计分析卡片（仅管理员可见）
    if (currentUser.role === 'admin') {
        functionalCards += `
            <!-- 统计分析卡片 -->
            <div class="col-md-4 mb-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <h5 class="card-title mb-3">
                            <i class="bi bi-graph-up text-info me-2"></i>
                            统计分析
                        </h5>
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-info" onclick="loadContent('daily-stats')">
                                <i class="bi bi-calendar-day me-2"></i>当日统计
                            </button>
                            <button class="btn btn-outline-info" onclick="loadContent('monthly-stats')">
                                <i class="bi bi-calendar-month me-2"></i>月度统计
                            </button>
                            <button class="btn btn-outline-info" onclick="loadContent('products')">
                                <i class="bi bi-box me-2"></i>商品管理
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 更新页面内容
    const content = `
        <div class="container-fluid">
            <!-- 页面标题 -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    <i class="bi bi-speedometer2 me-2"></i>
                    超市管理系统
                </h2>
                <div>
                    <span class="me-3">欢迎, ${currentUser.username}</span>
                    <button class="btn btn-outline-danger" onclick="logout()">
                        <i class="bi bi-box-arrow-right"></i> 退出
                    </button>
                </div>
            </div>

            <!-- 统计卡片行 -->
            <div class="row">
                <!-- 今日销售额卡片 -->
                <div class="col-md-3 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body d-flex align-items-center">
                            <div class="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                <i class="bi bi-currency-yen text-primary fs-4"></i>
                            </div>
                            <div>
                                <h6 class="card-subtitle mb-1 text-muted">今日销售额</h6>
                                <h3 class="card-title mb-0" id="todaySales">￥0.00</h3>
                                <small class="text-success">
                                    <i class="bi bi-graph-up"></i> 实时更新
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 本月销售额卡片 -->
                <div class="col-md-3 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body d-flex align-items-center">
                            <div class="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                <i class="bi bi-bar-chart text-success fs-4"></i>
                            </div>
                            <div>
                                <h6 class="card-subtitle mb-1 text-muted">本月销售额</h6>
                                <h3 class="card-title mb-0" id="monthSales">￥0.00</h3>
                                <small class="text-muted">月度统计</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 库存预警卡片 -->
                <div class="col-md-3 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body d-flex align-items-center">
                            <div class="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                                <i class="bi bi-exclamation-triangle text-warning fs-4"></i>
                            </div>
                            <div>
                                <h6 class="card-subtitle mb-1 text-muted">库存预警</h6>
                                <h3 class="card-title mb-0" id="lowStock">0</h3>
                                <small class="text-danger">需要补货的商品</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 会员总数卡片 -->
                <div class="col-md-3 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body d-flex align-items-center">
                            <div class="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                <i class="bi bi-people text-info fs-4"></i>
                            </div>
                            <div>
                                <h6 class="card-subtitle mb-1 text-muted">会员总数</h6>
                                <h3 class="card-title mb-0" id="totalCustomers">0</h3>
                                <small class="text-muted">注册会员数</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 功能区域 -->
            <div class="row mb-4">
                ${functionalCards}
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
}

// 修改仪表板数据加载函数
async function loadDashboardData() {
    try {
        const response = await fetch('http://localhost:3000/api/dashboard');
        const data = await response.json();
        
        // 更新显示数据
        document.getElementById('todaySales').textContent = `￥${data.todaySales.toFixed(2)}`;
        document.getElementById('monthSales').textContent = `￥${data.monthSales.toFixed(2)}`;
        document.getElementById('lowStock').textContent = data.lowStockCount;
        document.getElementById('totalCustomers').textContent = data.customerCount;

        // 设置定时刷新
        setTimeout(loadDashboardData, 30000); // 每30秒刷新一次
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// 加载内容函数
function loadContent(page) {
    console.log('Loading page:', page);  // 添加调试日志

    // 权限检查
    if (!checkPermission(page)) {
        alert('您没有权限访问此页面');
        return;
    }

    const mainContent = document.getElementById('main-content');
    
    switch(page) {
        case 'products':
            loadProductsPage();
            break;
        case 'sales-entry':
            loadSalesEntryPage();
            break;
        case 'employees':
            loadEmployeesPage();
            break;
        case 'customers':
            loadCustomersPage();
            break;
        case 'suppliers':
            loadSuppliersPage();
            break;
        case 'purchase-entry':
            loadPurchaseEntryPage();
            break;
        case 'purchase-query':
            loadPurchaseQueryPage();
            break;
        case 'warehouse':
            loadWarehousePage();
            break;
        case 'inventory-query':
            loadInventoryQueryPage();
            break;
        case 'stock-check':
            loadStockCheckPage();
            break;
        case 'sales-return':
            loadSalesReturnPage();
            break;
        case 'sales-query':
            loadSalesQueryPage();
            break;
        case 'daily-stats':
            loadDailyStatsPage();
            break;
        case 'monthly-stats':
            loadMonthlyStatsPage();
            break;
        case 'advanced-stats':
            loadAdvancedStatsPage();
            break;
        default:
            loadDashboardPage();
    }
}

// 添加一个通用的页面标题组件函数
function createPageHeader(title) {
    return `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>
                <i class="bi bi-${getPageIcon(title)} me-2"></i>
                ${title}
            </h2>
            <button class="btn btn-outline-primary" onclick="loadDashboardPage()">
                <i class="bi bi-house-door me-1"></i> 返回主页
            </button>
        </div>
    `;
}

// 获取页面对应的图标
function getPageIcon(title) {
    const iconMap = {
        '商品信息管理': 'box-seam',
        '销售开单': 'cart-plus',
        '员工管理': 'people',
        '客户管理': 'person-vcard',
        '供应商管理': 'building',
        '商品入库': 'box-arrow-in-down',
        '入库查询': 'search',
        '库存查询': 'search',
        '库存盘点': 'clipboard-check',
        '销售退货': 'arrow-return-left',
        '销售查询': 'search',
        '当日统计': 'calendar-day',
        '月度统计': 'calendar-month',
        '默认图标': 'grid'
    };
    return iconMap[title] || iconMap['默认图标'];
}

// 修改各个页面加载函数，添加页面标题组件
// 例如修改商品信息页面：
function loadProductsPage() {
    const content = `
        ${createPageHeader('商品信息管理')}
        <div class="container-fluid">
            <div class="row mb-3">
                <div class="col">
                    <button class="btn btn-primary" onclick="showAddProductModal()">
                        <i class="bi bi-plus-circle me-1"></i>新增商品
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>商品编号</th>
                            <th>商品名称</th>
                            <th>类别</th>
                            <th>销售价格</th>
                            <th>进货价格</th>
                            <th>库存数量</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="productsTable">
                        <!-- 商品数据将通过AJAX动态加载 -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
    loadProductsData();
}

// 修改库存查询页面
function loadInventoryQueryPage() {
    const content = `
        ${createPageHeader('库存查询')}
        <div class="container-fluid">
            <!-- 查询条件卡片 -->
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <form id="inventoryQueryForm" class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">商品名称</label>
                            <input type="text" class="form-control" id="productNameQuery" 
                                   placeholder="输入商品名称">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">商品类别</label>
                            <select class="form-select" id="categoryQuery">
                                <option value="">全部类别</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">库存状态</label>
                            <select class="form-select" id="stockStatusQuery">
                                <option value="">全部状态</option>
                                <option value="low">库存不足 (＜10)</option>
                                <option value="warning">库存预警 (10-50)</option>
                                <option value="normal">库存正常 (51-500)</option>
                                <option value="high">库存充足 (＞500)</option>
                            </select>
                        </div>
                        <div class="col-12">
                            <button type="button" class="btn btn-primary me-2" onclick="queryInventory()">
                                <i class="bi bi-search"></i> 查询
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="resetInventoryQuery()">
                                <i class="bi bi-arrow-counterclockwise"></i> 重置
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- 查询结果表格 -->
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>商品编号</th>
                                    <th>商品名称</th>
                                    <th>类别</th>
                                    <th class="text-end">销售价格</th>
                                    <th class="text-end">进货价格</th>
                                    <th class="text-end">库存数量</th>
                                    <th class="text-end">库存金额</th>
                                    <th class="text-center">状态</th>
                                </tr>
                            </thead>
                            <tbody id="inventoryList">
                                <!-- 查询结果将动态加载 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
    initInventoryQueryPage();
}

// 修改销售统计页面
function loadDailyStatsPage() {
    const content = `
        ${createPageHeader('当日统计')}
        <div class="container-fluid">
            <!-- 统计内容保持不变 -->
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
    loadDailyStats();
}

// 加载销售登记页面
function loadSalesEntryPage() {
    const content = `
        ${createPageHeader('销售登记')}
        <div class="container-fluid">
            <div class="row">
                <!-- 左侧商品选择和购物车 -->
                <div class="col-md-8">
                    <div class="card mb-4">
                        <div class="card-body">
                            <!-- 商品选择表单 -->
                            <form id="salesForm" class="mb-4">
                                <div class="row g-3 align-items-end">
                                    <div class="col-md-5">
                                        <label class="form-label">商品</label>
                                        <select class="form-select" id="productSelect">
                                            <option value="">请选择商品</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label class="form-label">单价</label>
                                        <input type="number" class="form-control" id="unitPrice" readonly>
                                    </div>
                                    <div class="col-md-2">
                                        <label class="form-label">数量</label>
                                        <input type="number" class="form-control" id="quantity" value="1" min="1">
                                    </div>
                                    <div class="col-md-3">
                                        <button type="button" class="btn btn-primary w-100" onclick="addToCart()">
                                            <i class="bi bi-cart-plus"></i> 添加到购物车
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <!-- 购物车表格 -->
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>商品名称</th>
                                            <th class="text-end">单价</th>
                                            <th class="text-center">数量</th>
                                            <th class="text-end">小计</th>
                                            <th class="text-center">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody id="cartItems">
                                        <!-- 购物车项目将动态添加 -->
                                    </tbody>
                                    <tfoot class="table-light">
                                        <tr>
                                            <td colspan="3" class="text-end fw-bold">总计：</td>
                                            <td class="text-end fw-bold" id="cartTotal">￥0.00</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧订单信息 -->
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title mb-4">订单信息</h5>
                            
                            <!-- 客户选择 -->
                            <div class="mb-3">
                                <label class="form-label">选择客户</label>
                                <select class="form-select" id="customerSelect">
                                    <option value="">请选择客户</option>
                                </select>
                            </div>

                            <!-- 销售员选择 -->
                            <div class="mb-3">
                                <label class="form-label">销售员</label>
                                <select class="form-select" id="employeeSelect" required>
                                    <option value="">请选择销售员</option>
                                </select>
                            </div>

                            <!-- 订单金额信息 -->
                            <div class="mb-3">
                                <label class="form-label">商品总额</label>
                                <input type="text" class="form-control" id="totalAmount" readonly>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">优惠金额</label>
                                <input type="number" class="form-control" id="discountAmount" value="0" 
                                       min="0" step="0.01" onchange="calculateFinalAmount()">
                            </div>

                            <div class="mb-3">
                                <label class="form-label">实付金额</label>
                                <input type="text" class="form-control" id="finalAmount" readonly>
                            </div>

                            <!-- 提交按钮 -->
                            <button type="button" class="btn btn-success w-100" onclick="submitSale()">
                                <i class="bi bi-check-circle"></i> 提交订单
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    initSalesPage();

    // 在页面加载完成后绑定事件
    document.getElementById('productSelect').addEventListener('change', updatePrice);
    document.getElementById('quantity').addEventListener('change', calculateItemTotal);
}

// 初始化销售页面
async function initSalesPage() {
    try {
        // 加载商品列表
        const productsResponse = await fetch('http://localhost:3000/api/products');
        const products = await productsResponse.json();
        console.log('Loaded products:', products); // 调试日志
        
        const productSelect = document.getElementById('productSelect');
        productSelect.innerHTML = `
            <option value="">请选择商品</option>
            ${products.map(product => `
                <option value="${product.ProductID}" 
                        data-price="${product.Price}"
                        data-stock="${product.StockQuantity}">
                    ${product.ProductName} (库存: ${product.StockQuantity})
                </option>
            `).join('')}
        `;

        // 绑定商品选择事件
        productSelect.addEventListener('change', updatePrice);

        // 加载客户列表
        const customersResponse = await fetch('http://localhost:3000/api/customers');
        const customers = await customersResponse.json();
        
        const customerSelect = document.getElementById('customerSelect');
        customerSelect.innerHTML = `
            <option value="">请选择客户</option>
            ${customers.map(customer => `
                <option value="${customer.CustomerID}">
                    ${customer.CustomerName} ${customer.VIPStatus ? '(VIP)' : ''}
                </option>
            `).join('')}
        `;

        // 加载员工列表
        const employeesResponse = await fetch('http://localhost:3000/api/employees');
        const employees = await employeesResponse.json();
        
        const employeeSelect = document.getElementById('employeeSelect');
        employeeSelect.innerHTML = `
            <option value="">请选择销售员</option>
            ${employees.map(employee => `
                <option value="${employee.EmployeeID}">${employee.EmployeeName}</option>
            `).join('')}
        `;

        // 初始化金额显示
        document.getElementById('totalAmount').value = '￥0.00';
        document.getElementById('finalAmount').value = '￥0.00';
        
        // 初始禁用数量输入框
        document.getElementById('quantity').disabled = true;
        
    } catch (error) {
        console.error('Error initializing sales page:', error);
        alert('初始化销售页面失败');
    }
}

async function loadProductsData() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const products = await response.json();
        
        const tbody = document.getElementById('productsTable');
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.ProductID}</td>
                <td>${product.ProductName}</td>
                <td>${product.Category}</td>
                <td>${product.Price}</td>
                <td>${product.PurchasePrice}</td>
                <td>${product.StockQuantity}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editProduct(${product.ProductID})">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.ProductID})">删除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        alert('加载商品数据失败');
    }
}

// 显示添加商品模态框
function showAddProductModal() {
    const modalHtml = `
        <div class="modal fade" id="productModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">新增商品</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm">
                            <div class="mb-3">
                                <label class="form-label">商品名称</label>
                                <input type="text" class="form-control" id="productName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">类别</label>
                                <select class="form-select" id="category" required>
                                    <option value="">请选择类别</option>
                                    <option value="粮食">粮食</option>
                                    <option value="水果">水果</option>
                                    <option value="速食">速食</option>
                                    <option value="油类">油类</option>
                                    <option value="蔬菜">蔬菜</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">销售价格</label>
                                <input type="number" step="0.01" class="form-control" id="price" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">进货价格</label>
                                <input type="number" step="0.01" class="form-control" id="purchasePrice" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">库存数量</label>
                                <input type="number" class="form-control" id="stockQuantity" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="saveProduct()">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

// 显示编辑商品模态框
function editProduct(productId) {
    showAddProductModal(); // 品的模态框
    
    // 加载商品数据
    fetch(`http://localhost:3000/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('productName').value = product.ProductName;
            document.getElementById('category').value = product.Category;
            document.getElementById('price').value = product.Price;
            document.getElementById('purchasePrice').value = product.PurchasePrice;
            document.getElementById('stockQuantity').value = product.StockQuantity;
            
            // 修改模态框标题和保存按钮的事件
            document.querySelector('#productModal .modal-title').textContent = '编辑商品';
            const saveButton = document.querySelector('#productModal .btn-primary');
            saveButton.onclick = () => updateProduct(productId);
        })
        .catch(error => {
            console.error('Error loading product:', error);
            alert('加载商品数据失败');
        });
}

// 加载供应商选项
async function loadSupplierOptions() {
    try {
        const response = await fetch('http://localhost:3000/api/suppliers');
        const suppliers = await response.json();
        const supplierSelect = document.getElementById('supplierSelect');
        
        // 按供应商名称排序
        suppliers.sort((a, b) => a.SupplierName.localeCompare(b.SupplierName));
        supplierSelect.innerHTML = `
            <option value="">请选择供应商</option>
            ${suppliers.map(supplier => 
                `<option value="${supplier.SupplierID}">${supplier.SupplierName}</option>`
            ).join('')}
            <option value="other">其他供应商</option>
        `;
        
        // 监听供应商选择变化
        supplierSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                const newSupplierName = prompt('请输入新供应商名称：');
                if (newSupplierName) {
                    addNewSupplier(newSupplierName, this);
                } else {
                    this.value = '';
                }
            }
        });
    } catch (error) {
        console.error('Error loading suppliers:', error);
        alert('加载供应商列表失败');
    }
}

// 添加新供应商
async function addNewSupplier(supplierName, selectElement) {
    try {
        const response = await fetch('http://localhost:3000/api/suppliers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                SupplierName: supplierName,
                ContactPerson: '',
                PhoneNumber: '',
                Address: ''
            })
        });

        const result = await response.json();
        if (result.success) {
            // 重新加载供应商列表
            loadSupplierOptions().then(() => {
                // 选中新添加的供应商
                selectElement.value = result.id;
            });
        } else {
            alert('添加供应商失败');
            selectElement.value = '';
        }
    } catch (error) {
        console.error('Error adding supplier:', error);
        alert('添加供应商失败');
        selectElement.value = '';
    }
}

// 保存商品
async function saveProduct() {
    const productData = {
        ProductName: document.getElementById('productName').value,
        Category: document.getElementById('category').value,
        Price: parseFloat(document.getElementById('price').value),
        PurchasePrice: parseFloat(document.getElementById('purchasePrice').value),
        StockQuantity: parseInt(document.getElementById('stockQuantity').value)
    };

    try {
        const response = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();
        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
            modal.hide();
            loadProductsData();
            document.getElementById('productModal').remove();
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('保存商品失败');
    }
}

// 更新商品
async function updateProduct(productId) {
    const productData = {
        ProductName: document.getElementById('productName').value,
        Category: document.getElementById('category').value,
        Price: parseFloat(document.getElementById('price').value),
        PurchasePrice: parseFloat(document.getElementById('purchasePrice').value),
        StockQuantity: parseInt(document.getElementById('stockQuantity').value)
    };

    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();
        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
            modal.hide();
            loadProductsData();
            document.getElementById('productModal').remove();
        } else {
            alert('更新商品失败');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        alert('更新商品失败');
    }
}

// 删除商品
async function deleteProduct(productId) {
    if (!confirm('确定要删除这个商品吗？')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            // 重新加载商品列表
            loadProductsData();
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('删除商品失败');
    }
}

// 员工管理页面
function loadEmployeesPage() {
    const content = `
        ${createPageHeader('员工信息管理')}
        <div class="container-fluid">
            <div class="row mb-3">
                <div class="col">
                    <button class="btn btn-primary" onclick="showAddEmployeeModal()">新增员工</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>员工编号</th>
                            <th>员工名</th>
                            <th>职位</th>
                            <th>薪资</th>
                            <th>入职日期</th>
                            <th>联系电话</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="employeesTable">
                        <!-- 员工数据将通过AJAX动态加载 -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
    loadEmployeesData();
}

// 客户管理页
function loadCustomersPage() {
    const content = `
        ${createPageHeader('客户信息管理')}
        <div class="container-fluid">
            <div class="row mb-3">
                <div class="col">
                    <button class="btn btn-primary" onclick="showAddCustomerModal()">新增客户</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>客户编号</th>
                            <th>客户姓名</th>
                            <th>联系电话</th>
                            <th>电子邮件</th>
                            <th>会员状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="customersTable">
                        <!-- 客户数据将通过AJAX动态加载 -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
    loadCustomersData();
}

// 供应商管理页面
function loadSuppliersPage() {
    const content = `
        ${createPageHeader('供应商信息管理')}
        <div class="container-fluid">
            <div class="row mb-3">
                <div class="col">
                    <button class="btn btn-primary" onclick="showAddSupplierModal()">新增供应商</button>
                </div>
            </div>
            <div class="table-container">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>供应商编号</th>
                            <th>供应商名称</th>
                            <th>联系人</th>
                            <th>联系电话</th>
                            <th>地址</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="suppliersTable">
                        <!-- 供应商数据将通过AJAX动态加载 -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
    loadSuppliersData();
}

// 加载员数据
async function loadEmployeesData() {
    try {
        const response = await fetch('http://localhost:3000/api/employees');
        const employees = await response.json();
        
        const tbody = document.getElementById('employeesTable');
        tbody.innerHTML = employees.map(employee => `
            <tr>
                <td>${employee.EmployeeID}</td>
                <td>${employee.EmployeeName}</td>
                <td>${employee.Position}</td>
                <td>${employee.Salary}</td>
                <td>${new Date(employee.HireDate).toLocaleDateString()}</td>
                <td>${employee.PhoneNumber}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editEmployee(${employee.EmployeeID})">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${employee.EmployeeID})">删除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading employees:', error);
        alert('加载员工数据失败');
    }
}

// 加载客户数据
async function loadCustomersData() {
    try {
        const response = await fetch('http://localhost:3000/api/customers');
        const customers = await response.json();
        
        const tbody = document.getElementById('customersTable');
        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.CustomerID}</td>
                <td>${customer.CustomerName}</td>
                <td>${customer.PhoneNumber}</td>
                <td>${customer.Email || '-'}</td>
                <td>${customer.VIPStatus ? '是' : '否'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editCustomer(${customer.CustomerID})">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.CustomerID})">删除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading customers:', error);
        alert('加载客户数据失败');
    }
}

// 加载供应商数据
async function loadSuppliersData() {
    try {
        const response = await fetch('http://localhost:3000/api/suppliers');
        const suppliers = await response.json();
        
        const tbody = document.getElementById('suppliersTable');
        tbody.innerHTML = suppliers.map(supplier => `
            <tr>
                <td>${supplier.SupplierID}</td>
                <td>${supplier.SupplierName}</td>
                <td>${supplier.ContactPerson || ''}</td>
                <td>${supplier.PhoneNumber || ''}</td>
                <td>${supplier.Address || ''}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editSupplier(${supplier.SupplierID})">
                        <i class="bi bi-pencil"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSupplier(${supplier.SupplierID})">
                        <i class="bi bi-trash"></i> 删除
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading suppliers:', error);
        alert('加载供应商数据失败');
    }
}

// 示添加员工模态框
function showAddEmployeeModal() {
    const modalHtml = `
        <div class="modal fade" id="employeeModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">新增员工</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="employeeForm">
                            <div class="mb-3">
                                <label class="form-label">员工姓</label>
                                <input type="text" class="form-control" id="employeeName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">职位</label>
                                <input type="text" class="form-control" id="position" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">薪资</label>
                                <input type="number" step="0.01" class="form-control" id="salary" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">入职日期</label>
                                <input type="date" class="form-control" id="hireDate" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">联系电话</label>
                                <input type="text" class="form-control" id="phoneNumber" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="saveEmployee()">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
}

// 显示添加客户模态框
function showAddCustomerModal() {
    const modalHtml = `
        <div class="modal fade" id="customerModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">新增客户</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="customerForm">
                            <div class="mb-3">
                                <label class="form-label">客户姓名</label>
                                <input type="text" class="form-control" id="customerName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">联系电话</label>
                                <input type="text" class="form-control" id="customerPhone" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">电子邮件</label>
                                <input type="email" class="form-control" id="customerEmail">
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="vipStatus">
                                    <label class="form-check-label">VIP会员</label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="saveCustomer()">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('customerModal'));
    modal.show();
}

// 显示添加供应商模态框
function showAddSupplierModal() {
    const modalHtml = `
        <div class="modal fade" id="supplierModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">新增供应商</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="supplierForm">
                            <div class="mb-3">
                                <label class="form-label">供应商名称</label>
                                <input type="text" class="form-control" id="supplierName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">联系人</label>
                                <input type="text" class="form-control" id="contactPerson" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">联系电话</label>
                                <input type="text" class="form-control" id="phoneNumber" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">地址</label>
                                <textarea class="form-control" id="address" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="saveSupplier()">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
    modal.show();
}

// 保存员工信息
async function saveEmployee() {
    const employeeData = {
        EmployeeName: document.getElementById('employeeName').value,
        Position: document.getElementById('position').value,
        Salary: parseFloat(document.getElementById('salary').value),
        HireDate: document.getElementById('hireDate').value,
        PhoneNumber: document.getElementById('phoneNumber').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });

        const result = await response.json();
        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
            modal.hide();
            loadEmployeesData();
            document.getElementById('employeeModal').remove();
        }
    } catch (error) {
        console.error('Error saving employee:', error);
        alert('保存员工信息失败');
    }
}

// 保存客户信息
async function saveCustomer() {
    const customerData = {
        CustomerName: document.getElementById('customerName').value,
        PhoneNumber: document.getElementById('customerPhone').value,
        Email: document.getElementById('customerEmail').value || null, // 处理空值
        VIPStatus: document.getElementById('vipStatus').checked ? 1 : 0 // 转换为数字
    };

    try {
        const response = await fetch('http://localhost:3000/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '保存失败');
        }

        const result = await response.json();
        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('customerModal'));
            modal.hide();
            loadCustomersData();
            document.getElementById('customerModal').remove();
        }
    } catch (error) {
        console.error('Error saving customer:', error);
        alert('保存客户信息失败: ' + error.message);
    }
}

// 保存供应商信息
async function saveSupplier() {
    const supplierData = {
        SupplierName: document.getElementById('supplierName').value,
        ContactPerson: document.getElementById('contactPerson').value,
        PhoneNumber: document.getElementById('phoneNumber').value,
        Address: document.getElementById('address').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/suppliers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplierData)
        });

        const result = await response.json();
        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
            modal.hide();
            loadSuppliersData();
            document.getElementById('supplierModal').remove();
        }
    } catch (error) {
        console.error('Error saving supplier:', error);
        alert('保存供应商信息失败');
    }
}

// 编辑员工信息
async function editEmployee(employeeId) {
    try {
        const response = await fetch(`http://localhost:3000/api/employees/${employeeId}`);
        const employee = await response.json();
        
        // 显示编辑模态框
        showAddEmployeeModal(); // 复用添加员工的模态框
        
        // 填充数据
        document.getElementById('employeeName').value = employee.EmployeeName;
        document.getElementById('position').value = employee.Position;
        document.getElementById('salary').value = employee.Salary;
        document.getElementById('hireDate').value = employee.HireDate.split('T')[0];
        document.getElementById('phoneNumber').value = employee.PhoneNumber;
        
        // 修改保存按的onclick事件
        const saveButton = document.querySelector('#employeeModal .btn-primary');
        saveButton.onclick = () => updateEmployee(employeeId);
    } catch (error) {
        console.error('Error loading employee:', error);
        alert('加载员工数据失败');
    }
}

// 更新员工信息
async function updateEmployee(employeeId) {
    const employeeData = {
        EmployeeName: document.getElementById('employeeName').value,
        Position: document.getElementById('position').value,
        Salary: parseFloat(document.getElementById('salary').value),
        HireDate: document.getElementById('hireDate').value,
        PhoneNumber: document.getElementById('phoneNumber').value
    };

    try {
        const response = await fetch(`http://localhost:3000/api/employees/${employeeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });

        const result = await response.json();
        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
            modal.hide();
            loadEmployeesData();
            document.getElementById('employeeModal').remove();
        }
    } catch (error) {
        console.error('Error updating employee:', error);
        alert('更新员工信息失败');
    }
}

// 删除员工
async function deleteEmployee(employeeId) {
    if (!confirm('确定要删除这个员工吗？')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/employees/${employeeId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            loadEmployeesData();
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        alert('删除员工失败');
    }
}

// 编辑客户信息
async function editCustomer(customerId) {
    try {
        const response = await fetch(`http://localhost:3000/api/customers/${customerId}`);
        const customer = await response.json();
        
        // 显示编辑模态框
        showAddCustomerModal(); // 复用添加客户的模态框
        
        // 填充数据
        document.getElementById('customerName').value = customer.CustomerName;
        document.getElementById('customerPhone').value = customer.PhoneNumber;
        document.getElementById('customerEmail').value = customer.Email;
        document.getElementById('vipStatus').checked = customer.VIPStatus;
        
        // 修改保存按钮的onclick事件
        const saveButton = document.querySelector('#customerModal .btn-primary');
        saveButton.onclick = () => updateCustomer(customerId);
    } catch (error) {
        console.error('Error loading customer:', error);
        alert('加载客户数据失败');
    }
}

// 更新客户信息
async function updateCustomer(customerId) {
    const customerData = {
        CustomerName: document.getElementById('customerName').value,
        PhoneNumber: document.getElementById('customerPhone').value,
        Email: document.getElementById('customerEmail').value,
        VIPStatus: document.getElementById('vipStatus').checked
    };

    try {
        const response = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });

        const result = await response.json();
        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('customerModal'));
            modal.hide();
            loadCustomersData();
            document.getElementById('customerModal').remove();
        }
    } catch (error) {
        console.error('Error updating customer:', error);
        alert('更新客户信息失败');
    }
}

// 删除客户
async function deleteCustomer(customerId) {
    if (!confirm('确定要删除这个客户吗？')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            loadCustomersData();
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        alert('删除客户失败');
    }
}

// 更新供应商信息
async function updateSupplier(supplierId) {
    const supplierData = {
        SupplierName: document.getElementById('supplierName').value,
        ContactPerson: document.getElementById('contactPerson').value,
        PhoneNumber: document.getElementById('phoneNumber').value,
        Address: document.getElementById('address').value
    };

    try {
        const response = await fetch(`http://localhost:3000/api/suppliers/${supplierId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplierData)
        });

        const result = await response.json();
        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
            modal.hide();
            loadSuppliersData(); // 重新加载供应商列表
            document.getElementById('supplierModal').remove();
        }
    } catch (error) {
        console.error('Error updating supplier:', error);
        alert('更新供应商信息失败');
    }
}

// 删除供应商
async function deleteSupplier(supplierId) {
    if (!confirm('确定要删除这个供应商吗？此操作不可恢复。')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/suppliers/${supplierId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            loadSuppliersData(); // 重应商列表
        }
    } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('删除供应商失败');
    }
}


// 加载入库登记页面
function loadPurchaseEntryPage() {
    const content = `
        ${createPageHeader('入库登记')}
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-8">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <form id="purchaseForm" class="mb-4">
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <label class="form-label">选择商品</label>
                                        <select class="form-select" id="productSelect" required onchange="updatePurchasePrice()">
                                            <option value="">请选择商品</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <label class="form-label">数量</label>
                                        <input type="number" class="form-control" id="quantity" min="1" value="1" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">进货单价</label>
                                        <input type="number" step="0.01" class="form-control" id="purchasePrice" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">&nbsp;</label>
                                        <button type="button" class="btn btn-primary w-100" onclick="addToPurchaseList()">
                                            <i class="bi bi-plus-circle"></i> 添加到清单
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <div class="table-responsive">
                                <table class="table table-bordered table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>商品名称</th>
                                            <th>数量</th>
                                            <th>进货单价</th>
                                            <th>总金额</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody id="purchaseItems">
                                        <!-- 进货项将动态添加 -->
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="3" class="text-end fw-bold">合计：</td>
                                            <td colspan="2" class="fw-bold" id="totalSum">￥0.00</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title mb-4">入库信息</h5>
                            <div class="mb-3">
                                <label class="form-label">选择供应商</label>
                                <select class="form-select" id="supplierSelect" required>
                                    <option value="">请选择供应商</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">总金额</label>
                                <input type="text" class="form-control" id="totalAmount" readonly value="￥0.00">
                            </div>
                            <button type="button" class="btn btn-success w-100" onclick="submitPurchase()">
                                <i class="bi bi-check-circle"></i> 提交入库
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    loadPurchaseData();
}

// 加载入库数据
async function loadPurchaseData() {
    try {
        // 加载商品列表
        const productsResponse = await fetch('http://localhost:3000/api/products');
        if (!productsResponse.ok) throw new Error('获取商品列表失败');
        const products = await productsResponse.json();
        
        const productSelect = document.getElementById('productSelect');
        productSelect.innerHTML = `
            <option value="">请选择商品</option>
            ${products.map(product => `
                <option value="${product.ProductID}" data-price="${product.PurchasePrice}">
                    ${product.ProductName}
                </option>
            `).join('')}
        `;

        // 加载供应商列表
        const suppliersResponse = await fetch('http://localhost:3000/api/suppliers');
        if (!suppliersResponse.ok) throw new Error('获取供应商列表失败');
        const suppliers = await suppliersResponse.json();
        
        const supplierSelect = document.getElementById('supplierSelect');
        supplierSelect.innerHTML = `
            <option value="">请选择供应商</option>
            ${suppliers.map(supplier => `
                <option value="${supplier.SupplierID}">${supplier.SupplierName}</option>
            `).join('')}
        `;
    } catch (error) {
        console.error('Error loading purchase data:', error);
        alert('加数据失: ' + error.message);
    }
}

// 加载入库查询页面
function loadPurchaseQueryPage() {
    const content = `
        ${createPageHeader('入库记录查询')}
        <div class="container-fluid">
            <div class="card mb-4">
                <div class="card-body">
                    <form id="queryForm" class="row g-3 align-items-end">
                        <div class="col-md-3">
                            <label class="form-label">开始日期</label>
                            <input type="date" class="form-control" id="startDate">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">结束日期</label>
                            <input type="date" class="form-control" id="endDate">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">供应商</label>
                            <select class="form-select" id="querySupplierSelect">
                                <option value="">全部供应商</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <button type="button" class="btn btn-primary w-100" onclick="queryPurchases()">
                                <i class="bi bi-search"></i> 查询
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>入库编号</th>
                                    <th>商品名称</th>
                                    <th>供应商</th>
                                    <th class="text-center">数量</th>
                                    <th class="text-end">进货单价</th>
                                    <th class="text-end">总金额</th>
                                    <th class="text-center">入库日期</th>
                                </tr>
                            </thead>
                            <tbody id="purchaseRecords">
                                <tr>
                                    <td colspan="7" class="text-center">加载中...</td>
                                </tr>
                            </tbody>
                            <tfoot class="table-light">
                                <tr>
                                    <td colspan="3" class="fw-bold">合计</td>
                                    <td class="text-center fw-bold" id="totalQuantity">0</td>
                                    <td></td>
                                    <td class="text-end fw-bold" id="totalAmount">￥0.00</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
    loadPurchaseQueryData();
}

// 加载入库查询数据
async function loadPurchaseQueryData() {
    try {
        const response = await fetch('http://localhost:3000/api/suppliers');
        const suppliers = await response.json();
        
        const supplierSelect = document.getElementById('querySupplierSelect');
        if (suppliers && suppliers.length > 0) {
            supplierSelect.innerHTML = `
                <option value="">全部供应商</option>
                ${suppliers.map(supplier => `
                    <option value="${supplier.SupplierID}">
                        ${supplier.SupplierName} (联系人: ${supplier.ContactPerson})
                    </option>
                `).join('')}
            `;
        }

        // 设置默认日期范围（最近一个月）
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
        document.getElementById('startDate').value = lastMonth.toISOString().split('T')[0];

        // 执行查询
        queryPurchases();
    } catch (error) {
        console.error('Error loading suppliers:', error);
        alert('加载供应商数据失败');
    }
}

// 查询入库记录
async function queryPurchases() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const supplierID = document.getElementById('querySupplierSelect').value;

    try {
        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        if (supplierID) queryParams.append('supplierID', supplierID);

        // 发送查询请求
        const response = await fetch(`http://localhost:3000/api/purchases/query?${queryParams}`);
        if (!response.ok) {
            throw new Error('查询失败');
        }

        const records = await response.json();
        const tbody = document.getElementById('purchaseRecords');
        
        if (records && records.length > 0) {
            let totalQty = 0;
            let totalAmt = 0;

            tbody.innerHTML = records.map(record => {
                // 累计数量和总金额
                totalQty += Number(record.Quantity);
                totalAmt += Number(record.TotalAmount);
                
                // 格式化日期
                const purchaseDate = new Date(record.PurchaseDate).toLocaleDateString('zh-CN');
                
                return `
                    <tr>
                        <td>${record.PurchaseID}</td>
                        <td>${record.ProductName}</td>
                        <td>${record.SupplierName}</td>
                        <td class="text-center">${record.Quantity}</td>
                        <td class="text-end">¥${Number(record.PurchasePrice).toFixed(2)}</td>
                        <td class="text-end">¥${Number(record.TotalAmount).toFixed(2)}</td>
                        <td class="text-center">${purchaseDate}</td>
                    </tr>
                `;
            }).join('');

            // 更新合计数据
            document.getElementById('totalQuantity').textContent = totalQty;
            document.getElementById('totalAmount').textContent = `¥${totalAmt.toFixed(2)}`;
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">暂无入库记录</td></tr>';
            document.getElementById('totalQuantity').textContent = '0';
            document.getElementById('totalAmount').textContent = '¥0.00';
        }
    } catch (error) {
        console.error('Error querying purchases:', error);
        alert('查询入库记录失败');
        document.getElementById('purchaseRecords').innerHTML = 
            '<tr><td colspan="7" class="text-center text-danger">查询失败，请稍后重试</td></tr>';
    }
}

// 更新进货价格
function updatePurchasePrice() {
    const productSelect = document.getElementById('productSelect');
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const purchasePriceInput = document.getElementById('purchasePrice');
    
    if (selectedOption && selectedOption.value) {
        purchasePriceInput.value = selectedOption.dataset.price || '';
        purchasePriceInput.disabled = false;
        document.getElementById('quantity').disabled = false;
    } else {
        purchasePriceInput.value = '';
        purchasePriceInput.disabled = true;
        document.getElementById('quantity').disabled = true;
    }
}

// 添加到入库单
function addToPurchaseList() {
    const productSelect = document.getElementById('productSelect');
    const quantity = document.getElementById('quantity').value;
    const purchasePrice = document.getElementById('purchasePrice').value;
    
    if (!productSelect.value) {
        alert('请选择商品');
        return;
    }
    
    if (!quantity || quantity < 1) {
        alert('请输入有效的数量');
        return;
    }

    const selectedProduct = productSelect.options[productSelect.selectedIndex];
    const totalAmount = (quantity * purchasePrice).toFixed(2);
    
    // 检查是否已经添加过该商品
    const existingRows = document.getElementById('purchaseItems').getElementsByTagName('tr');
    for (let row of existingRows) {
        if (row.cells[0].dataset.productId === selectedProduct.value) {
            alert('该商品已在清单中，请直接修改数量或删除后重新添加');
            return;
        }
    }
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td data-product-id="${selectedProduct.value}">${selectedProduct.text}</td>
        <td>${quantity}</td>
        <td>¥${purchasePrice}</td>
        <td>¥${totalAmount}</td>
        <td>
            <button class="btn btn-sm btn-danger" onclick="this.closest('tr').remove(); updateTotalAmount();">
                <i class="bi bi-trash"></i> 删除
            </button>
        </td>
    `;
    
    document.getElementById('purchaseItems').appendChild(tr);
    updateTotalAmount();
    
    // 重置输入
    document.getElementById('quantity').value = '1';
}


// 更新总金额
function updateTotalAmount() {
    const rows = document.getElementById('purchaseItems').getElementsByTagName('tr');
    let total = 0;
    
    for (let row of rows) {
        const amount = parseFloat(row.cells[3].textContent.replace('¥', ''));
        total += amount;
    }
    
    document.getElementById('totalAmount').value = total.toFixed(2);
    document.getElementById('totalSum').textContent = `¥${total.toFixed(2)}`;
}

// 提交入库
async function submitPurchase() {
    const rows = document.getElementById('purchaseItems').getElementsByTagName('tr');
    if (rows.length === 0) {
        alert('请添加进货商品');
        return;
    }

    const supplierID = document.getElementById('supplierSelect').value;
    if (!supplierID) {
        alert('请选择供应商');
        return;
    }

    const purchases = [];
    for (let row of rows) {
        purchases.push({
            ProductID: row.cells[0].dataset.productId,
            SupplierID: supplierID,
            Quantity: parseInt(row.cells[1].textContent),
            PurchasePrice: parseFloat(row.cells[2].textContent.replace('¥', '')),
            TotalAmount: parseFloat(row.cells[3].textContent.replace('¥', ''))
        });
    }

    try {
        const response = await fetch('http://localhost:3000/api/purchases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(purchases)
        });

        const result = await response.json();
        if (result.success) {
            alert('入库成功');
            document.getElementById('purchaseItems').innerHTML = '';
            document.getElementById('totalAmount').value = '0.00';
            document.getElementById('totalSum').textContent = '¥0.00';
            // 重新加载商品数据以更新库存
            loadPurchaseData();
        }
    } catch (error) {
        console.error('Error submitting purchase:', error);
        alert('提交入库失败');
    }
}

// 加载库存查询页面
function loadInventoryQueryPage() {
    const content = `
        ${createPageHeader('库存查询')}
        <div class="container-fluid">
            <!-- 查询条件卡片 -->
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <form id="inventoryQueryForm" class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">商品名称</label>
                            <input type="text" class="form-control" id="productNameQuery" 
                                   placeholder="输入商品名称">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">商品类别</label>
                            <select class="form-select" id="categoryQuery">
                                <option value="">全部类别</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">库存状态</label>
                            <select class="form-select" id="stockStatusQuery">
                                <option value="">全部状态</option>
                                <option value="low">库存不足 (＜10)</option>
                                <option value="warning">库存预警 (10-50)</option>
                                <option value="normal">库存正常 (51-500)</option>
                                <option value="high">库存充足 (＞500)</option>
                            </select>
                        </div>
                        <div class="col-12">
                            <button type="button" class="btn btn-primary me-2" onclick="queryInventory()">
                                <i class="bi bi-search"></i> 查询
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="resetInventoryQuery()">
                                <i class="bi bi-arrow-counterclockwise"></i> 重置
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- 查询结果表格 -->
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>商品编号</th>
                                    <th>商品名称</th>
                                    <th>类别</th>
                                    <th class="text-end">销售价格</th>
                                    <th class="text-end">进货价格</th>
                                    <th class="text-end">库存数量</th>
                                    <th class="text-end">库存金额</th>
                                    <th class="text-center">状态</th>
                                </tr>
                            </thead>
                            <tbody id="inventoryList">
                                <!-- 查询结果将动态加载 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    initInventoryQueryPage();
}

// 修改初始化库存查询页面函数
async function initInventoryQueryPage() {
    try {
        // 加载商品类别
        const categoryResponse = await fetch('http://localhost:3000/api/products/categories');
        if (categoryResponse.ok) {
            const categories = await categoryResponse.json();
            const categorySelect = document.getElementById('categoryQuery');
            categorySelect.innerHTML = `
                <option value="">全部类别</option>
                ${categories.map(category => `
                    <option value="${category.Category}">${category.Category}</option>
                `).join('')}
            `;
        } else {
            console.error('Failed to load categories');
            // 即使类别加载失败，也保持默认的"全部类别"选项
            document.getElementById('categoryQuery').innerHTML = `
                <option value="">全部类别</option>
            `;
        }
        
        // 无论类别加载是否成功，都执行查询
        queryInventory();
        
    } catch (error) {
        console.error('Error initializing inventory query page:', error);
        // 即使初始化失败，也尝试执行查询
        document.getElementById('categoryQuery').innerHTML = `
            <option value="">全部类别</option>
        `;
        queryInventory();
    }
}

// 修改查询库存函数，添加错误处理
async function queryInventory() {
    try {
        const searchData = {
            productName: document.getElementById('productNameQuery').value.trim(),
            category: document.getElementById('categoryQuery').value,
            stockStatus: document.getElementById('stockStatusQuery').value
        };
        
        console.log('Searching with params:', searchData);
        
        const response = await fetch('http://localhost:3000/api/warehouse/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchData)
        });

        if (!response.ok) {
            throw new Error('查询失败');
        }

        const results = await response.json();
        const tbody = document.getElementById('inventoryList');
        
        if (!results || results.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">未找到符合条件的商品</td></tr>';
            return;
        }

        tbody.innerHTML = results.map(item => {
            const stockAmount = (item.StockQuantity * item.PurchasePrice).toFixed(2);
            let statusClass, statusText;
            
            // 修改库存状态的判断标准
            if (item.StockQuantity < 10) {
                statusClass = 'text-danger';
                statusText = '库存不足';
            } else if (item.StockQuantity >= 10 && item.StockQuantity <= 50) {
                statusClass = 'text-warning';
                statusText = '库存预警';
            } else if (item.StockQuantity > 50 && item.StockQuantity <= 500) {
                statusClass = 'text-success';
                statusText = '库存正常';
            } else if (item.StockQuantity > 500) {  // 明确添加 > 500 的条件
                statusClass = 'text-primary';
                statusText = '库存充足';
            }

            return `
                <tr>
                    <td>${item.ProductID}</td>
                    <td>${item.ProductName}</td>
                    <td>${item.Category}</td>
                    <td class="text-end">￥${parseFloat(item.Price).toFixed(2)}</td>
                    <td class="text-end">￥${parseFloat(item.PurchasePrice).toFixed(2)}</td>
                    <td class="text-end">${item.StockQuantity}</td>
                    <td class="text-end">￥${stockAmount}</td>
                    <td class="text-center ${statusClass}">${statusText}</td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error querying inventory:', error);
        document.getElementById('inventoryList').innerHTML = 
            `<tr><td colspan="8" class="text-center text-danger">
                查询失败：${error.message}
            </td></tr>`;
    }
}

// 重置查询表单
function resetInventoryQuery() {
    document.getElementById('inventoryQueryForm').reset();
    queryInventory();
}

// 加库房管理页面
function loadWarehousePage() {
    const content = `
        ${createPageHeader('库房管理')}
        <div class="container-fluid">
            <!-- 功能卡片 -->
            <div class="row">
                <!-- 库存盘点卡片 -->
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="bi bi-clipboard-check"></i> 库存盘点
                            </h5>
                            <p class="card-text">进行库存盘点，核对实际库存与系统库存的差异</p>
                            <button class="btn btn-primary" onclick="loadContent('stock-check')">
                                开始盘点
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 库存预警卡片 -->
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="bi bi-exclamation-triangle"></i> 库预警
                            </h5>
                            <p class="card-text">查看库存不足或库存过多的商品</p>
                            <button class="btn btn-warning" onclick="showStockWarning()">
                                查看预警
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 库存查询卡片 -->
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="bi bi-search"></i> 库存查询
                            </h5>
                            <p class="card-text">查询商品库存情况</p>
                            <button class="btn btn-info" onclick="loadContent('inventory-query')">
                                查询库存
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 最近盘点记录表格 -->
            <div class="card mt-4 shadow-sm">
                <div class="card-header bg-light">
                    <h5 class="mb-0">最近盘点记录</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>盘点单号</th>
                                    <th>盘点日期</th>
                                    <th>盘点人员</th>
                                    <th>状态</th>
                                    <th class="text-end">差异数量</th>
                                    <th class="text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody id="checkRecords">
                                <!-- 盘点记录将动态加载 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    loadWarehouseData();
}

// 加载库存预警页面
function showStockWarning() {
    const content = `
        ${createPageHeader('库存预警')}
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <button class="btn btn-secondary" onclick="loadWarehousePage()">
                    <i class="bi bi-arrow-left"></i> 返回
                </button>
            </div>
            
            <!-- 预警设置 -->
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">最低库存预警值</label>
                            <input type="number" class="form-control" id="minStockLevel" value="10">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">最高库存预警值</label>
                            <input type="number" class="form-control" id="maxStockLevel" value="100">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">&nbsp;</label>
                            <button type="button" class="btn btn-primary w-100" onclick="checkStockWarning()">
                                <i class="bi bi-search"></i> 查看预警
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 预警列表 -->
            <div class="card shadow-sm">
                <div class="card-body">
                    <ul class="nav nav-tabs mb-3">
                        <li class="nav-item">
                            <a class="nav-link active" href="#lowStock" data-bs-toggle="tab">
                                <i class="bi bi-arrow-down-circle"></i> 库存不足
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#highStock" data-bs-toggle="tab">
                                <i class="bi bi-arrow-up-circle"></i> 库存过多
                            </a>
                        </li>
                    </ul>
                    
                    <div class="tab-content">
                        <!-- 库存不足 -->
                        <div class="tab-pane fade show active" id="lowStock">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>商品编号</th>
                                            <th>商品名称</th>
                                            <th>类别</th>
                                            <th class="text-end">当前库存</th>
                                            <th class="text-end">最低预警值</th>
                                            <th class="text-center">状态</th>
                                        </tr>
                                    </thead>
                                    <tbody id="lowStockList">
                                        <!-- 低库存商品将动态加载 -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- 库存过多 -->
                        <div class="tab-pane fade" id="highStock">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>商品编号</th>
                                            <th>商品名称</th>
                                            <th>类别</th>
                                            <th class="text-end">当前库存</th>
                                            <th class="text-end">最高预警值</th>
                                            <th class="text-center">状态</th>
                                        </tr>
                                    </thead>
                                    <tbody id="highStockList">
                                        <!-- 高库存商品将动态加载 -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    checkStockWarning();
}

// 检查库存预警
async function checkStockWarning() {
    const minStock = document.getElementById('minStockLevel').value;
    const maxStock = document.getElementById('maxStockLevel').value;
    
    try {
        const response = await fetch(`http://localhost:3000/api/stock/warning?minStock=${minStock}&maxStock=${maxStock}`);
        const data = await response.json();
        
        // 更新低库存列表
        const lowStockList = document.getElementById('lowStockList');
        lowStockList.innerHTML = data.lowStock.map(item => `
            <tr>
                <td>${item.ProductID}</td>
                <td>${item.ProductName}</td>
                <td>${item.Category}</td>
                <td class="text-end">${item.StockQuantity}</td>
                <td class="text-end">${minStock}</td>
                <td class="text-center">
                    <span class="badge bg-danger">库存不足</span>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" class="text-center">暂无库存不足商品</td></tr>';
        
        // 更新高库存列表
        const highStockList = document.getElementById('highStockList');
        highStockList.innerHTML = data.highStock.map(item => `
            <tr>
                <td>${item.ProductID}</td>
                <td>${item.ProductName}</td>
                <td>${item.Category}</td>
                <td class="text-end">${item.StockQuantity}</td>
                <td class="text-end">${maxStock}</td>
                <td class="text-center">
                    <span class="badge bg-warning text-dark">库存过多</span>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" class="text-center">暂无库存过多商品</td></tr>';
    } catch (error) {
        console.error('Error checking stock warning:', error);
        alert('获取库存预警信息失败');
    }
}

// 添加加载盘点记录的函数
async function loadWarehouseData() {
    try {
        const response = await fetch('http://localhost:3000/api/stockcheck/recent');
        const records = await response.json();
        
        const tbody = document.getElementById('checkRecords');
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无盘点记录</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(record => `
                    <tr>
                        <td>${record.CheckNo}</td>
                        <td>${new Date(record.CheckDate).toLocaleDateString()}</td>
                        <td>${record.EmployeeName}</td>
                <td>
                    <span class="badge ${record.Status === 'submitted' ? 'bg-success' : 'bg-warning'}">
                        ${record.Status === 'submitted' ? '已提交' : '草稿'}
                    </span>
                </td>
                <td class="text-end ${record.DifferenceQty !== 0 ? 'text-danger' : ''}">${record.DifferenceQty || 0}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-info" onclick="viewCheckDetail('${record.CheckNo}')">
                        <i class="bi bi-eye"></i> 查看详情
                            </button>
                        </td>
                    </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading warehouse data:', error);
        alert('加载盘点记录失败');
    }
}

// 修改 viewCheckDetail 函数
async function viewCheckDetail(checkNo) {
    try {
        console.log('Viewing check detail for:', checkNo); // 添加调试日志
        const response = await fetch(`http://localhost:3000/api/stockcheck/detail/${checkNo}`);
        if (!response.ok) {
            throw new Error('获取盘点详情失败');
        }
        const detail = await response.json();

        // 先移除可能存在的旧模态框
        const oldModal = document.getElementById('checkDetailModal');
        if (oldModal) {
            oldModal.remove();
        }

        // 创建模态框显示详情
        const modalContent = `
            <div class="modal fade" id="checkDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">盘点详情 - ${detail.checkNo}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- 基本信息 -->
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <strong>盘点日期：</strong> ${new Date(detail.checkDate).toLocaleDateString()}
                                </div>
                                <div class="col-md-4">
                                    <strong>盘点人员：</strong> ${detail.employeeName}
                                </div>
                                <div class="col-md-4">
                                    <strong>状态：</strong> 
                                    <span class="badge ${detail.status === 'submitted' ? 'bg-success' : 'bg-warning'}">
                                        ${detail.status === 'submitted' ? '已提交' : '草稿'}
                                    </span>
                                </div>
                            </div>
                            
                            <!-- 备注 -->
                            <div class="mb-3">
                                <strong>备注：</strong>
                                <p class="mb-3">${detail.note || '无'}</p>
                            </div>

                            <!-- 详细列表 -->
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead class="table-light">
                                        <tr>
                                            <th>商品名称</th>
                                            <th class="text-end">系统库存</th>
                                            <th class="text-end">实际库存</th>
                                            <th class="text-end">差异数量</th>
                                            <th>差异原因</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${detail.items.map(item => `
                                            <tr>
                                                <td>${item.productName}</td>
                                                <td class="text-end">${item.systemStock}</td>
                                                <td class="text-end">${item.actualStock}</td>
                                                <td class="text-end ${item.differenceQty !== 0 ? 'text-danger' : ''}">${item.differenceQty}</td>
                                                <td>${item.differenceReason || '-'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加模态框到页面并显示
        document.body.insertAdjacentHTML('beforeend', modalContent);
        const modal = new bootstrap.Modal(document.getElementById('checkDetailModal'));
        modal.show();

        // 监听模态框关闭事件，清理DOM
        document.getElementById('checkDetailModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
    } catch (error) {
        console.error('Error loading check detail:', error);
        alert('加载盘点详情失败: ' + error.message);
    }
}

// 提交销售订单
async function submitSale() {
    // 验证必填项
    const customerId = document.getElementById('customerSelect').value;
    const employeeId = document.getElementById('employeeSelect').value;
    const cartItems = document.getElementById('cartItems').getElementsByTagName('tr');
    
    if (!customerId) {
        alert('请选择客户');
        return;
    }
    
    if (!employeeId) {
        alert('请选择销售员');
        return;
    }
    
    if (cartItems.length === 0) {
        alert('至少添加一件商品');
        return;
    }

    // 确认提交
    if (!confirm('确定要提交销售订单吗？')) {
        return;
    }

    try {
        // 收集订单数据
        const items = [];
        for (let row of cartItems) {
            const productId = row.querySelector('td').dataset.productId;
            const price = parseFloat(row.querySelector('td:nth-child(2)').textContent.replace('￥', ''));
            const quantity = parseInt(row.querySelector('td:nth-child(3)').textContent);
            const subtotal = parseFloat(row.querySelector('td:nth-child(4)').textContent.replace('￥', ''));
            
            items.push({
            productId,
                quantity,
                price,
                subtotal
            });
        }

        const saleData = {
            customerId,
            employeeId,
            totalAmount: parseFloat(document.getElementById('totalAmount').value.replace('￥', '')),
            discountAmount: parseFloat(document.getElementById('discountAmount').value) || 0,
            finalAmount: parseFloat(document.getElementById('finalAmount').value.replace('￥', '')),
            items
        };

        console.log('Submitting sale data:', saleData); // 添加调试日志

        const response = await fetch('http://localhost:3000/api/sales/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saleData)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '提交失败');
        }

        if (result.success) {
            alert('销售订单提交成功！');
            // 重置表单
            document.getElementById('customerSelect').value = '';
            document.getElementById('employeeSelect').value = '';
            document.getElementById('cartItems').innerHTML = '';
            document.getElementById('totalAmount').value = '￥0.00';
            document.getElementById('discountAmount').value = '0';
            document.getElementById('finalAmount').value = '￥0.00';
            // 移除这一行，因为我们已经删除了支付方式选择
            // document.getElementById('paymentMethod').value = 'cash';
            updateCartTotal();
        } else {
            throw new Error(result.error || '提交失败');
        }
    } catch (error) {
        console.error('Error submitting sale:', error);
        // 显示更详细的错误信息
        alert('提交销售订单失败: ' + (error.message || '未知错误'));
    }
}

// 修改加载销售退货页面函数
function loadSalesReturnPage() {
    const content = `
        ${createPageHeader('销售退货')}
        <div class="container-fluid">
            <!-- 查询条件 -->
            <div class="card mb-4">
                <div class="card-body">
                    <form id="salesQueryForm" class="row g-3">
                        <div class="col-md-2">
                            <label class="form-label">销售单号</label>
                            <input type="text" class="form-control" id="saleIdQuery">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">客户</label>
                            <select class="form-select" id="customerQuery">
                                <option value="">全部</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">开始日期</label>
                            <input type="date" class="form-control" id="startDate">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">结束日期</label>
                            <input type="date" class="form-control" id="endDate">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">&nbsp;</label>
                            <div>
                                <button type="button" class="btn btn-primary" onclick="queryReturnOrders()">
                                    <i class="bi bi-search"></i> 查询
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="resetReturnQueryForm()">
                                    <i class="bi bi-arrow-counterclockwise"></i> 重置
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- 标签页切换 -->
            <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                    <a class="nav-link active" data-bs-toggle="tab" href="#saleOrders">销售订单</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#returnRecords">退货记录</a>
                </li>
            </ul>
            
            <!-- 标签页内容 -->
            <div class="tab-content">
                <!-- 销售订单列表 -->
                <div class="tab-pane fade show active" id="saleOrders">
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>销售单号</th>
                                            <th>客户名称</th>
                                            <th>销售日期</th>
                                            <th class="text-end">销售金额</th>
                                            <th class="text-end">优惠金额</th>
                                            <th class="text-end">实付金额</th>
                                            <th class="text-center">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody id="salesList">
                                        <!-- 销售订单将动态加载 -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 退货记录列表 -->
                <div class="tab-pane fade" id="returnRecords">
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>退货单号</th>
                                            <th>销单号</th>
                                            <th>客户名称</th>
                                            <th>退货日期</th>
                                            <th class="text-end">退数量</th>
                                            <th class="text-end">退货金额</th>
                                            <th>退货原因</th>
                                        </tr>
                                    </thead>
                                    <tbody id="returnList">
                                        <!-- 退货记录将动态加载 -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 退货模态框 -->
        <div class="modal fade" id="returnModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">退货申请</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- 退货表单 -->
                        <form id="returnForm">
                            <input type="hidden" id="saleId">
                            <div class="mb-3">
                                <label class="form-label">客户名称</label>
                                <input type="text" class="form-control" id="customerName" readonly>
                            </div>
                            <div class="table-responsive mb-3">
                                <table class="table">
                                    <thead class="table-light">
                                        <tr>
                                            <th>商品名称</th>
                                            <th class="text-end">单价</th>
                                            <th class="text-end">数量</th>
                                            <th class="text-end">小计</th>
                                            <th class="text-center">退货数量</th>
                                        </tr>
                                    </thead>
                                    <tbody id="saleItemsList">
                                        <!-- 商品明细将动态加载 -->
                                    </tbody>
                                </table>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">退货原因</label>
                                <textarea class="form-control" id="returnReason" rows="3" required></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="submitReturn()">提交退货</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    loadCustomerOptions();
    queryReturnOrders();
    loadReturnRecords();  // 确保这行代码被调用
}

// 添加加载退货记录的函数
async function loadReturnRecords() {
    try {
        console.log('[Debug] 开始加载退货记录...');
        // 清除原有的错误显示
        const tbody = document.getElementById('returnList');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">正在加载...</td></tr>';
        }
        
        const response = await fetch('http://localhost:3000/api/sales/returns');
        console.log('[Debug] API响应状态:', response.status);
        
        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }
        
        const returns = await response.json();
        console.log('[Debug] 获取到的退货记录:', returns);
        
        if (!tbody) {
            throw new Error('找不到returnList元素');
        }
        
        // 检查返回的数据格式
        if (!Array.isArray(returns)) {
            throw new Error('返回的数据格式不正确');
        }
        
        tbody.innerHTML = returns.length ? returns.map(record => `
            <tr>
                <td>${record.ReturnID}</td>
                <td>${record.SaleID}</td>
                <td>${record.CustomerName}</td>
                <td>${new Date(record.ReturnDate).toLocaleString('zh-CN')}</td>
                <td class="text-end">${record.Quantity}</td>
                <td class="text-end">￥${parseFloat(record.TotalAmount).toFixed(2)}</td>
                <td>${record.Reason}</td>
            </tr>
        `).join('') : '<tr><td colspan="7" class="text-center">暂无退货记录</td></tr>';
        
    } catch (error) {
        console.error('[Debug] 加载退货记录失败:', error);
        const tbody = document.getElementById('returnList');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle"></i> 
                        加载失败: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

// 查询销售订单
async function querySales() {
    try {
        // 获取查询参数
        const saleId = document.getElementById('saleIdQuery')?.value || '';
        const customerId = document.getElementById('customerQuery')?.value || '';
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';
        const employeeId = document.getElementById('employeeQuery')?.value || '';
        
        // 构建查询参数
        const params = new URLSearchParams();
        if (saleId) params.append('saleId', saleId);
        if (customerId) params.append('customerId', customerId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (employeeId) params.append('employeeId', employeeId);
        
        console.log('Querying sales with params:', Object.fromEntries(params));
        
        // 发送请求
        const response = await fetch(`http://localhost:3000/api/sales/query?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const sales = await response.json();
        console.log('Received sales data:', sales);
        
        // 获取表格体元素
        const tbody = document.getElementById('salesList');
        if (!tbody) {
            console.error('Cannot find element with id "salesList"');
            return;
        }
        
        // 渲染数据
        if (!Array.isArray(sales)) {
            console.error('Sales data is not an array:', sales);
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">数据格式错误</td></tr>';
            return;
        }
        
        tbody.innerHTML = sales.length ? sales.map(sale => {
            // 添加数据验证
            const saleId = sale.SaleID || '未知';
            const customerName = sale.CustomerName || '未知客户';
            const employeeName = sale.EmployeeName || '未知员工';
            const saleDate = sale.SaleDate ? new Date(sale.SaleDate).toLocaleString() : '未知日期';
            const totalAmount = parseFloat(sale.TotalAmount || 0).toFixed(2);
            const discountAmount = parseFloat(sale.DiscountAmount || 0).toFixed(2);
            const finalAmount = parseFloat(sale.FinalAmount || 0).toFixed(2);
            
            return `
                <tr>
                    <td>${saleId}</td>
                    <td>${customerName}</td>
                    <td>${employeeName}</td>
                    <td>${saleDate}</td>
                    <td class="text-end">￥${totalAmount}</td>
                    <td class="text-end">￥${discountAmount}</td>
                    <td class="text-end">￥${finalAmount}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-danger" onclick="showReturnModal(${saleId})">
                            退货
                        </button>
                    </td>
                </tr>
            `;
        }).join('') : '<tr><td colspan="8" class="text-center">暂无符合条件的销售订单</td></tr>';
        
    } catch (error) {
        console.error('Error querying sales:', error);
        const tbody = document.getElementById('salesList');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">
                查询失败: ${error.message}
            </td></tr>`;
        }
        alert('查询销售记录失败: ' + error.message);
    }
}

// 重置查询表单
function resetQueryForm() {
    const form = document.getElementById('salesQueryForm');
    if (form) {
        form.reset();
        querySales(); // 重置后重新查询
    }
}

// 显示退货对话框
async function showReturnDialog(saleId) {
    try {
        const response = await fetch(`http://localhost:3000/api/sales/${saleId}`);
        const sale = await response.json();
        
        // 填充退货表单
        document.getElementById('saleId').value = sale.SaleID;
        document.getElementById('customerName').value = sale.CustomerName;
        
        // 填充商品下拉列表
        const productSelect = document.getElementById('returnProductSelect');
        productSelect.innerHTML = `
            <option value="">请选择商品</option>
            ${sale.items.map(item => `
                <option value="${item.ProductID}" 
                        data-quantity="${item.Quantity}"
                        data-price="${item.Price}">
                    ${item.ProductName} (量: ${item.Quantity}, 单价: ￥${item.Price})
                </option>
            `).join('')}
        `;
    } catch (error) {
        console.error('Error loading sale details:', error);
        alert('加载销售订单详情失败: ' + error.message);
    }
}

// 提交退货
async function submitReturn() {
    const saleId = document.getElementById('saleId').value;
    const reason = document.getElementById('returnReason').value;
    
    if (!reason.trim()) {
        alert('请填写退货原因');
        return;
    }
    
    // 收集退货商品信息
    const returnItems = [];
    document.querySelectorAll('.return-quantity').forEach(input => {
        const quantity = parseInt(input.value);
        if (quantity > 0) {
            const tr = input.closest('tr');
            // 从第二列（单价列）获取价格文本，并去掉￥符号
            const priceText = tr.cells[1].textContent;
            const unitPrice = parseFloat(priceText.replace('￥', ''));
            
            console.log('Price debug:', {
                priceText: priceText,
                unitPrice: unitPrice,
                row: tr.innerHTML
            });
            
            // 验证价格是否为有效数字
            if (isNaN(unitPrice) || unitPrice <= 0) {
                console.error('Invalid unit price:', unitPrice);
                throw new Error('商品单价无效');
            }
            
            returnItems.push({
                productId: input.dataset.productId,
                quantity: quantity,
                price: unitPrice  // 使用单价
            });
            
            // 添加日志，检查价格数据
            console.log('Adding return item:', {
                productId: input.dataset.productId,
                quantity: quantity,
                unitPrice: unitPrice,
                totalAmount: unitPrice * quantity
            });
        }
    });
    
    if (returnItems.length === 0) {
        alert('请至少选择一件要退货的商品');
        return;
    }
    
    if (!confirm('确定要提交退货申请吗？')) {
        return;
    }
    
    try {
        const requestData = {
            saleId: parseInt(saleId),
            items: returnItems,
            reason: reason
        };
        
        console.log('Submitting return request:', requestData);
        
        const response = await fetch('http://localhost:3000/api/sales/return', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '提交失败');
        }
        
        const result = await response.json();
        if (result.success) {
            alert('退货申请提交成功');
            const modal = bootstrap.Modal.getInstance(document.getElementById('returnModal'));
            modal.hide();
            queryReturnOrders(); // 刷新列表
        } else {
            throw new Error(result.error || '提交失败');
        }
    } catch (error) {
        console.error('Error submitting return:', error);
        alert('提交退货申请失败: ' + error.message);
    }
}

// 修改加载销售查询页面函数
function loadSalesQueryPage() {
    const content = `
        ${createPageHeader('销售查询')}
        <div class="container-fluid">
            <!-- 查询条件 -->
            <div class="card mb-4">
                <div class="card-body">
                    <form id="salesQueryForm" class="row g-3">
                        <div class="col-md-3">
                            <label class="form-label">销售单号</label>
                            <input type="text" class="form-control" id="saleIdQuery">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">客户</label>
                            <select class="form-select" id="customerQuery">
                                <option value="">全部</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">销售日期范围</label>
                            <div class="input-group">
                                <input type="date" class="form-control" id="startDate">
                                <span class="input-group-text">至</span>
                                <input type="date" class="form-control" id="endDate">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">销售员</label>
                            <select class="form-select" id="employeeQuery">
                                <option value="">全部</option>
                            </select>
                        </div>
                        <div class="col-12">
                            <button type="button" class="btn btn-primary" onclick="querySales()">
                                <i class="bi bi-search"></i> 查询
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="resetQueryForm()">
                                <i class="bi bi-arrow-counterclockwise"></i> 重置
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- 查询结果 -->
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>销售单号</th>
                                    <th>客户名称</th>
                                    <th>销售员</th>
                                    <th>销售日期</th>
                                    <th class="text-end">商品总额</th>
                                    <th class="text-end">优惠金额</th>
                                    <th class="text-end">实付金额</th>
                                    <th class="text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody id="salesQueryResult">
                                <!-- 查询结果将动态加载 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- 销售详情模态框 -->
        <div class="modal fade" id="saleDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">销售详情</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="saleDetailContent">
                        <!-- 销售详情将动态加载 -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    initSalesQueryPage();
}

// 修改初始化销售查询页面函数
async function initSalesQueryPage() {
    try {
        // 加载客户列表
        const customerResponse = await fetch('http://localhost:3000/api/customers');
        const customers = await customerResponse.json();
        
        const customerSelect = document.getElementById('customerQuery');
        customerSelect.innerHTML = `
            <option value="">全部</option>
            ${customers.map(customer => `
                <option value="${customer.CustomerID}">${customer.CustomerName}</option>
            `).join('')}
        `;

        // 加载员工列表
        const employeeResponse = await fetch('http://localhost:3000/api/employees');
        const employees = await employeeResponse.json();
        
        const employeeSelect = document.getElementById('employeeQuery');
        employeeSelect.innerHTML = `
            <option value="">全部</option>
            ${employees.map(emp => `
                <option value="${emp.EmployeeID}">${emp.EmployeeName}</option>
            `).join('')}
        `;
        
        // 设置日期范围的默认值（最近一个月）
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        
        document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
        
        // 执行初始查询
        querySales();
    } catch (error) {
        console.error('Error initializing sales query page:', error);
        alert('初始化页面失败');
    }
}

// 修改查询销售记录函数
async function querySales() {
    try {
        // 获取查询参数
        const saleId = document.getElementById('saleIdQuery')?.value || '';
        const customerId = document.getElementById('customerQuery')?.value || '';
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';
        const employeeId = document.getElementById('employeeQuery')?.value || '';
        
        // 构建查询参数
        const params = new URLSearchParams();
        if (saleId) params.append('saleId', saleId);
        if (customerId) params.append('customerId', customerId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (employeeId) params.append('employeeId', employeeId);
        
        console.log('Querying sales with params:', Object.fromEntries(params));
        
        // 发送请求
        const response = await fetch(`http://localhost:3000/api/sales/query?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const sales = await response.json();
        console.log('Received sales data:', sales);
        
        // 获取表格体元素
        const tbody = document.getElementById('salesQueryResult');
        if (!tbody) {
            console.error('Cannot find element with id "salesQueryResult"');
            return;
        }
        
        // 渲染数据
        tbody.innerHTML = sales.length ? sales.map(sale => `
            <tr>
                <td>${sale.SaleID}</td>
                <td>${sale.CustomerName || '未知客户'}</td>
                <td>${sale.EmployeeName || '未知员工'}</td>
                <td>${new Date(sale.SaleDate).toLocaleString()}</td>
                <td class="text-end">￥${parseFloat(sale.TotalAmount || 0).toFixed(2)}</td>
                <td class="text-end">￥${parseFloat(sale.DiscountAmount || 0).toFixed(2)}</td>
                <td class="text-end">￥${parseFloat(sale.FinalAmount || 0).toFixed(2)}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-info" 
                            onclick="viewSaleDetail(${sale.SaleID})">
                        <i class="bi bi-eye"></i> 查看详情
                    </button>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="8" class="text-center">暂无数据</td></tr>';
        
    } catch (error) {
        console.error('Error querying sales:', error);
        alert('查询销售记录失败: ' + error.message);
    }
}

// 重���查询表单
function resetQueryForm() {
    document.getElementById('salesQueryForm').reset();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    
    querySales();
}

// 修改查看销售详情函数
async function viewSaleDetail(saleId) {
    try {
        const response = await fetch(`http://localhost:3000/api/sales/${saleId}`);
        
        // 打印调试信息
        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // 尝试解析 JSON
        let sale;
        try {
            sale = JSON.parse(responseText);
        } catch (e) {
            throw new Error('解析响应数据失败: ' + responseText);
        }
        
        if (!sale || !sale.SaleID) {
            throw new Error('无效的销售订单数据');
        }
        
        const modalContent = document.getElementById('saleDetailContent');
        modalContent.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-4">
                    <strong>销售单号：</strong> ${sale.SaleID}
                </div>
                <div class="col-md-4">
                    <strong>客户名称：</strong> ${sale.CustomerName || '未知客户'}
                </div>
                <div class="col-md-4">
                    <strong>销售日期：</strong> ${new Date(sale.SaleDate).toLocaleString()}
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4">
                    <strong>销售员：</strong> ${sale.EmployeeName || '未知员'}
                </div>
                <div class="col-md-4">
                    <strong>商品总额：</strong> ￥${parseFloat(sale.TotalAmount || 0).toFixed(2)}
                </div>
                <div class="col-md-4">
                    <strong>优惠金额：</strong> ￥${parseFloat(sale.DiscountAmount || 0).toFixed(2)}
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-12">
                    <strong>实付金额：</strong> ￥${parseFloat(sale.FinalAmount || 0).toFixed(2)}
                </div>
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th>商品名称</th>
                            <th>类别</th>
                            <th class="text-end">单价</th>
                            <th class="text-center">数量</th>
                            <th class="text-end">小计</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(sale.items || []).map(item => `
                            <tr>
                                <td>${item.ProductName || '未知商品'}</td>
                                <td>${item.Category || '未知类别'}</td>
                                <td class="text-end">￥${parseFloat(item.Price || 0).toFixed(2)}</td>
                                <td class="text-center">${item.Quantity}</td>
                                <td class="text-end">￥${parseFloat(item.Subtotal || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('saleDetailModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading sale detail:', error);
        alert('加载销售详情失败: ' + error.message);
    }
}

// 添加加载盘点页面函数
function loadStockCheckPage() {
    const content = `
        <div class="container-fluid">
            <h2 class="mb-4">库存盘点</h2>
            <div class="card">
                <div class="card-body">
                    <form id="stockCheckForm">
                        <div class="row mb-4">
                            <div class="col-md-3">
                                <label class="form-label">盘点单号</label>
                                <input type="text" class="form-control" id="checkNo" readonly>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">盘点人员</label>
                                <select class="form-select" id="employeeSelect" required>
                                    <option value="">请选择盘点人员</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">备注</label>
                                <input type="text" class="form-control" id="checkNote" placeholder="可选">
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead class="table-light">
                                    <tr>
                                        <th>商品编号</th>
                                        <th>商品名称</th>
                                        <th>类别</th>
                                        <th>供应商</th>
                                        <th class="text-center">系统库存</th>
                                        <th class="text-center">实际库存</th>
                                        <th class="text-center">差异数量</th>
                                        <th>差异原因</th>
                                    </tr>
                                </thead>
                                <tbody id="stockCheckItems">
                                    <!-- 商品列表将动态加载 -->
                                </tbody>
                            </table>
                        </div>

                        <div class="text-end mt-4">
                            <button type="button" class="btn btn-secondary me-2" onclick="saveStockCheckDraft()">
                                <i class="bi bi-save"></i> 保存草稿
                            </button>
                            <button type="button" class="btn btn-primary" onclick="submitStockCheck()">
                                <i class="bi bi-check-circle"></i> 提交盘点
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    initStockCheckPage();
}

// 初始化盘点页面
async function initStockCheckPage() {
    try {
        // 获取新的盘点单号
        const noResponse = await fetch('http://localhost:3000/api/stockcheck/newno');
        const noData = await noResponse.json();
        document.getElementById('checkNo').value = noData.checkNo;

        // 加载员工列表
        const empResponse = await fetch('http://localhost:3000/api/employees');
        const employees = await empResponse.json();
        
        const employeeSelect = document.getElementById('employeeSelect');
        employeeSelect.innerHTML = `
            <option value="">请选择盘点人员</option>
            ${employees.map(emp => `
                <option value="${emp.EmployeeID}">${emp.EmployeeName}</option>
            `).join('')}
        `;

        // 加载商品列表
        const productsResponse = await fetch('http://localhost:3000/api/stockcheck/products');
        const products = await productsResponse.json();
        
        const tbody = document.getElementById('stockCheckItems');
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.ProductID}</td>
                <td>${product.ProductName}</td>
                <td>${product.Category}</td>
                <td>${product.SupplierName || '-'}</td>
                <td class="text-center">${product.StockQuantity}</td>
                <td>
                    <input type="number" class="form-control text-center actual-stock" 
                           data-product-id="${product.ProductID}"
                           data-system-stock="${product.StockQuantity}"
                           value="${product.StockQuantity}"
                           onchange="calculateDifference(this)">
                </td>
                <td class="text-center difference-qty">0</td>
                <td>
                    <input type="text" class="form-control difference-reason" 
                           placeholder="如有差异请填写原因">
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error initializing stock check page:', error);
        alert('初始化盘点页面失败');
    }
}

// 计算差异数量
function calculateDifference(input) {
    const systemStock = parseInt(input.dataset.systemStock);
    const actualStock = parseInt(input.value) || 0;
    const difference = actualStock - systemStock;
    
    const row = input.closest('tr');
    const differenceCell = row.querySelector('.difference-qty');
    differenceCell.textContent = difference;
    
    // 如果有差异，突出显示
    if (difference !== 0) {
        differenceCell.classList.add('text-danger', 'fw-bold');
    } else {
        differenceCell.classList.remove('text-danger', 'fw-bold');
    }
}

// 保存盘点草稿
async function saveStockCheckDraft() {
    if (!validateStockCheckForm()) return;
    
    try {
        const checkData = collectStockCheckData();
        checkData.status = 'draft';
        
        const response = await fetch('http://localhost:3000/api/stockcheck/draft', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(checkData)
        });
        
        const result = await response.json();
        if (result.success) {
            alert('盘点草稿保存成功');
            loadWarehousePage();
        } else {
            throw new Error(result.error || '保存失败');
        }
    } catch (error) {
        console.error('Error saving stock check draft:', error);
        alert('保存盘点草稿失败: ' + error.message);
    }
}

// 提交盘点
async function submitStockCheck() {
    if (!validateStockCheckForm()) return;
    
    if (!confirm('确定要提交盘点结果吗？提交后将无法修改。')) {
        return;
    }
    
    try {
        const checkData = collectStockCheckData();
        checkData.status = 'submitted';
        
        const response = await fetch('http://localhost:3000/api/stockcheck/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(checkData)
        });
        
        const result = await response.json();
        if (result.success) {
            alert('盘点提交成功');
            loadWarehousePage();
        } else {
            throw new Error(result.error || '提交失败');
        }
    } catch (error) {
        console.error('Error submitting stock check:', error);
        alert('提交盘点失败: ' + error.message);
    }
}

// 验证盘点表单
function validateStockCheckForm() {
    const employeeId = document.getElementById('employeeSelect').value;
    if (!employeeId) {
        alert('请选择盘点人员');
        return false;
    }
    
    const actualStockInputs = document.querySelectorAll('.actual-stock');
    for (const input of actualStockInputs) {
        if (input.value === '' || parseInt(input.value) < 0) {
            alert('请输入有效的实际库存数量');
            input.focus();
            return false;
        }
    }
    
    return true;
}

// 收集盘点数据
function collectStockCheckData() {
    const rows = document.getElementById('stockCheckItems').getElementsByTagName('tr');
    const details = [];
    
    for (const row of rows) {
        const actualStockInput = row.querySelector('.actual-stock');
        const productId = actualStockInput.dataset.productId;
        const systemStock = parseInt(actualStockInput.dataset.systemStock);
        const actualStock = parseInt(actualStockInput.value);
        const differenceQty = actualStock - systemStock;
        const differenceReason = row.querySelector('.difference-reason').value;
        
        details.push({
            productId,
            systemStock,
            actualStock,
            differenceQty,
            differenceReason: differenceQty !== 0 ? differenceReason : ''
        });
    }
    
    return {
        checkNo: document.getElementById('checkNo').value,
        employeeId: document.getElementById('employeeSelect').value,
        note: document.getElementById('checkNote').value,
        details
    };
}

// 加载当日统计页面
function loadDailyStatsPage() {
    const content = `
        ${createPageHeader('当日统计')}
        <div class="container-fluid">
            <!-- 统计卡片 -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h5 class="card-title">今日销售额</h5>
                            <h3 class="card-text" id="dailySales">￥0.00</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h5 class="card-title">今日利润</h5>
                            <h3 class="card-text" id="dailyProfit">￥0.00</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h5 class="card-title">今日订单数</h5>
                            <h3 class="card-text" id="dailyOrders">0</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <h5 class="card-title">今日退货金额</h5>
                            <h3 class="card-text" id="dailyReturns">￥0.00</h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 库存变化趋势图表 -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">今日库存变化趋势</h5>
                </div>
                <div class="card-body">
                    <div id="dailyStockTrendChart" style="height:350px;"></div>
                </div>
            </div>

            <!-- 修改销售明细表格 - 移除操作列 -->
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">今日销售明细</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>订单编号</th>
                                    <th>时间</th>
                                    <th>客户</th>
                                    <th>销售员</th>
                                    <th class="text-end">销售金额</th>
                                    <th class="text-end">优惠金额</th>
                                    <th class="text-end">实付金额</th>
                                    <th class="text-end">预计利润</th>
                                </tr>
                            </thead>
                            <tbody id="dailySalesList">
                                <!-- 销售数据将动态加载 -->
                            </tbody>
                            <tfoot class="table-light">
                                <tr>
                                    <td colspan="4" class="text-end fw-bold">合计：</td>
                                    <td class="text-end fw-bold" id="totalSales">￥0.00</td>
                                    <td class="text-end fw-bold" id="totalDiscount">￥0.00</td>
                                    <td class="text-end fw-bold" id="totalFinal">￥0.00</td>
                                    <td class="text-end fw-bold" id="totalProfit">￥0.00</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    loadDailyStats();
}

// 修改加载当日统计数据函数
async function loadDailyStats() {
    try {
        const response = await fetch('http://localhost:3000/api/stats/daily');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '服务器响应错误');
        }
        
        const data = await response.json();
        console.log('Daily stats data:', data);
        
        // 更新统计卡片
        document.getElementById('dailySales').textContent = 
            `￥${(data.summary.totalSales || 0).toFixed(2)}`;
        document.getElementById('dailyProfit').textContent = 
            `￥${(data.summary.totalProfit || 0).toFixed(2)}`;
        document.getElementById('dailyOrders').textContent = 
            data.summary.orderCount || 0;
        document.getElementById('dailyReturns').textContent = 
            `￥${(data.summary.returnAmount || 0).toFixed(2)}`;

        // 更新销售明细表格 - 移除操作列
        const tbody = document.getElementById('dailySalesList');
        if (data.details && data.details.length > 0) {
            tbody.innerHTML = data.details.map(sale => `
                <tr>
                    <td>${sale.SaleID}</td>
                    <td>${new Date(sale.SaleDate).toLocaleString()}</td>
                    <td>${sale.CustomerName || '未知客户'}</td>
                    <td>${sale.EmployeeName || '未知员工'}</td>
                    <td class="text-end">￥${(sale.TotalAmount || 0).toFixed(2)}</td>
                    <td class="text-end">￥${(sale.DiscountAmount || 0).toFixed(2)}</td>
                    <td class="text-end">￥${(sale.FinalAmount || 0).toFixed(2)}</td>
                    <td class="text-end">￥${(sale.Profit || 0).toFixed(2)}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">今日暂无销售记录</td></tr>';
        }

        // 新增：加载库存变化趋势数据并渲染图表
        try {
            const trendResp = await fetch('http://localhost:3000/api/statistics/stocktrend?date=' + new Date().toISOString().slice(0, 10));
            if (trendResp.ok) {
                const trendData = await trendResp.json();
                // trendData 应包含 { dates: [...], stock: [...] }
                if (window.renderAdvancedStatsChart) {
                    renderAdvancedStatsChart('dailyStockTrendChart', 'inout', {
                        dates: trendData.dates,
                        in: trendData.in,   // 入库量
                        out: trendData.out  // 出库量
                    });
                }
            } else {
                document.getElementById('dailyStockTrendChart').innerHTML = '<div class="text-danger">库存趋势数据加载失败</div>';
            }
        } catch (e) {
            document.getElementById('dailyStockTrendChart').innerHTML = '<div class="text-danger">库存趋势数据加载异常</div>';
        }
        
        // 更新表格底部合计
        document.getElementById('totalSales').textContent = 
            `￥${(data.summary.totalSales || 0).toFixed(2)}`;
        document.getElementById('totalDiscount').textContent = 
            `￥${(data.summary.totalDiscount || 0).toFixed(2)}`;
        document.getElementById('totalFinal').textContent = 
            `￥${(data.summary.totalFinal || 0).toFixed(2)}`;
        document.getElementById('totalProfit').textContent = 
            `￥${(data.summary.totalProfit || 0).toFixed(2)}`;
        
    } catch (error) {
        console.error('Error loading daily stats:', error);
        alert('加载当日统计数据失败: ' + error.message);
    }
}


// 加载月度统计页面
function loadMonthlyStatsPage() {
    console.log('Loading monthly stats page');  // 添加这行调试日志
    const content = `
        ${createPageHeader('月度财务统计')}
        <div class="container-fluid">
            <!-- 月份选择器 -->
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="input-group">
                        <input type="month" class="form-control" id="monthSelector" 
                               value="${new Date().toISOString().slice(0, 7)}">
                        <button class="btn btn-primary" onclick="loadMonthlyStats()">
                            <i class="bi bi-search"></i> 查询
                        </button>
                    </div>
                </div>
            </div>

            <!-- 统计卡片 -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h5 class="card-title">月度销售额</h5>
                            <h3 class="card-text" id="monthlySales">￥0.00</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h5 class="card-title">月度利润</h5>
                            <h3 class="card-text" id="monthlyProfit">￥0.00</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h5 class="card-title">月度订单数</h5>
                            <h3 class="card-text" id="monthlyOrders">0</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <h5 class="card-title">月度退货金额</h5>
                            <h3 class="card-text" id="monthlyReturns">￥0.00</h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 出入库趋势图表 -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">本月出入库趋势</h5>
                </div>
                <div class="card-body">
                    <div id="monthlyInOutTrendChart" style="height:350px;"></div>
                </div>
            </div>

            <!-- 日统计表格 -->
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">日统计明细</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>日期</th>
                                    <th class="text-end">销售金额</th>
                                    <th class="text-end">优惠金额</th>
                                    <th class="text-end">实付金额</th>
                                    <th class="text-end">退货金额</th>
                                    <th class="text-end">净销售额</th>
                                    <th class="text-end">预计利润</th>
                                    <th class="text-center">订单数</th>
                                </tr>
                            </thead>
                            <tbody id="monthlyDetailsList">
                                <!-- 日统计数据将动态加载 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    loadMonthlyStats();
}

// 加载月统计数据
async function loadMonthlyStats() {
    try {
        const month = document.getElementById('monthSelector').value;
        const response = await fetch(`http://localhost:3000/api/stats/monthly?month=${month}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '服务器响应错误');
        }
        
        const data = await response.json();
        console.log('Monthly stats data:', data);
        
        // 更新统计卡片
        document.getElementById('monthlySales').textContent = 
            `￥${(data.summary.totalSales || 0).toFixed(2)}`;
        document.getElementById('monthlyProfit').textContent = 
            `￥${(data.summary.totalProfit || 0).toFixed(2)}`;
        document.getElementById('monthlyOrders').textContent = 
            data.summary.orderCount || 0;
        document.getElementById('monthlyReturns').textContent = 
            `￥${(data.summary.returnAmount || 0).toFixed(2)}`;
        
        // 更新日统计明细表格
        const tbody = document.getElementById('monthlyDetailsList');
        if (data.details && data.details.length > 0) {
            tbody.innerHTML = data.details.map(day => {
                // 格式化日期，只保留 YYYY-MM-DD
                const date = new Date(day.Date);
                const formattedDate = date.toISOString().split('T')[0];
                
                return `
                    <tr>
                        <td>${formattedDate}</td>
                        <td class="text-end">￥${(day.TotalSales || 0).toFixed(2)}</td>
                        <td class="text-end">￥${(day.DiscountAmount || 0).toFixed(2)}</td>
                        <td class="text-end">￥${(day.FinalAmount || 0).toFixed(2)}</td>
                        <td class="text-end">￥${(day.ReturnAmount || 0).toFixed(2)}</td>
                        <td class="text-end">￥${(day.NetSales || 0).toFixed(2)}</td>
                        <td class="text-end">￥${(day.Profit || 0).toFixed(2)}</td>
                        <td class="text-center">${day.OrderCount || 0}</td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">本月暂无销售记录</td></tr>';
        }

        // 新增：加载出入库趋势数据并渲染图表
        try {
            const trendResp = await fetch(`http://localhost:3000/api/statistics/inouttrend?month=${month}`);
            if (trendResp.ok) {
                const trendData = await trendResp.json();
                // trendData 应包含 { dates: [...], in: [...], out: [...] }
                if (window.renderAdvancedStatsChart) {
                    renderAdvancedStatsChart('monthlyInOutTrendChart', 'inout', {
                        dates: trendData.dates,
                        in: trendData.in,
                        out: trendData.out
                    });
                }
            } else {
                document.getElementById('monthlyInOutTrendChart').innerHTML = '<div class="text-danger">出入库趋势数据加载失败</div>';
            }
        } catch (e) {
            document.getElementById('monthlyInOutTrendChart').innerHTML = '<div class="text-danger">出入库趋势数据加载异常</div>';
        }

    } catch (error) {
        console.error('Error loading monthly stats:', error);
        alert('加载月度统计数据失败: ' + error.message);
    }
}

// 更新商品价格函数
function updatePrice() {
    const productSelect = document.getElementById('productSelect');
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const unitPriceInput = document.getElementById('unitPrice');
    const quantityInput = document.getElementById('quantity');
    
    if (selectedOption && selectedOption.value) {
        // 从选项的 data-price 属性获取销售价格
        const price = parseFloat(selectedOption.dataset.price);
        console.log('Selected product price:', price); // 调试日志
        unitPriceInput.value = price; // 设置单价
        quantityInput.disabled = false; // 启用数量输入
        quantityInput.value = '1'; // 重置数量为1
        calculateItemTotal(); // 计算小计
    } else {
        unitPriceInput.value = '';
        quantityInput.disabled = true;
        quantityInput.value = '1';
    }
}

// 计算商品小计
function calculateItemTotal() {
    const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const total = unitPrice * quantity;
    console.log('Calculated total:', total); // 调试日志
}

// 添加到购物车
function addToCart() {
    const productSelect = document.getElementById('productSelect');
    const quantity = parseInt(document.getElementById('quantity').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    
    if (!productSelect.value || !quantity || !unitPrice) {
        alert('请选择商品并输入有效的数量');
        return;
    }

    // 获取选中的商品信息
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const productId = selectedOption.value;
    const productName = selectedOption.text.split(' (')[0]; // 移除库存信息
    const stockQuantity = parseInt(selectedOption.dataset.stock);
    
    // 检查库存
    if (quantity > stockQuantity) {
        alert(`库存不足！当前库存: ${stockQuantity}`);
        return;
    }
    
    // 计算小计
    const total = quantity * unitPrice;
    
    // 检查是否已经在购物车中
    const existingRows = document.getElementById('cartItems').getElementsByTagName('tr');
    for (let row of existingRows) {
        if (row.querySelector('td').dataset.productId === productId) {
            alert('该商品已在购物车中，请直接修改数量或删除后重新添加');
            return;
        }
    }
    
    // 添加到购物车
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td data-product-id="${productId}">${productName}</td>
        <td class="text-end">￥${unitPrice.toFixed(2)}</td>
        <td class="text-center">${quantity}</td>
        <td class="text-end">￥${total.toFixed(2)}</td>
        <td class="text-center">
            <button class="btn btn-sm btn-danger" onclick="removeFromCart(this)">
                <i class="bi bi-trash"></i> 删除
            </button>
        </td>
    `;
    
    document.getElementById('cartItems').appendChild(tr);
    updateCartTotal();
    
    // 重置输入
    productSelect.value = '';
    document.getElementById('quantity').value = '1';
    document.getElementById('unitPrice').value = '';
    document.getElementById('quantity').disabled = true;
}

// 更新购物车总金额
function updateCartTotal() {
    const rows = document.getElementById('cartItems').getElementsByTagName('tr');
    let total = 0;
    
    for (let row of rows) {
        const amount = parseFloat(row.cells[3].textContent.replace('￥', ''));
        total += amount;
    }
    
    document.getElementById('totalAmount').value = `￥${total.toFixed(2)}`;
    document.getElementById('finalAmount').value = `￥${total.toFixed(2)}`;
    
    // 如果有优惠金额，重新计算实付金额
    calculateFinalAmount();
}

// 从购物车中移除商品
function removeFromCart(button) {
    button.closest('tr').remove();
    updateCartTotal();
}

// 计最终金额
function calculateFinalAmount() {
    const totalAmount = parseFloat(document.getElementById('totalAmount').value.replace('￥', '')) || 0;
    const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const finalAmount = Math.max(0, totalAmount - discountAmount);
    
    document.getElementById('finalAmount').value = `￥${finalAmount.toFixed(2)}`;
}

// 编辑供应商信息
async function editSupplier(supplierId) {
    try {
        // 获取供应商数据
        const response = await fetch(`http://localhost:3000/api/suppliers/${supplierId}`);
        const supplier = await response.json();
        
        // 显编辑模态框
        showAddSupplierModal(); // 复用添加供应商的模态框
        
        // 填充数据
        document.getElementById('supplierName').value = supplier.SupplierName;
        document.getElementById('contactPerson').value = supplier.ContactPerson || '';
        document.getElementById('phoneNumber').value = supplier.PhoneNumber || '';
        document.getElementById('address').value = supplier.Address || '';
        
        // 修改模态框标题
        document.querySelector('#supplierModal .modal-title').textContent = '编辑供应商';
        
        // 修改保存按钮的onclick事件
        const saveButton = document.querySelector('#supplierModal .btn-primary');
        saveButton.onclick = () => updateSupplier(supplierId);
    } catch (error) {
        console.error('Error loading supplier:', error);
        alert('加载供应商数据失败');
    }
}

// 显示退货模态框
async function showReturnModal(saleId) {
    try {
        const response = await fetch(`http://localhost:3000/api/sales/${saleId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const sale = await response.json();
        console.log('Sale details:', sale);
        
        // 填充基本信息
        document.getElementById('saleId').value = sale.SaleID;
        document.getElementById('customerName').value = sale.CustomerName || '未客户';
        
        // 填充商品明细
        const tbody = document.getElementById('saleItemsList');
        if (!sale.items || !Array.isArray(sale.items)) {
            throw new Error('商品明细数据格式错误');
        }
        
        tbody.innerHTML = sale.items.map(item => {
            // 加日志检查价格数据
            console.log('Processing item:', {
                ProductID: item.ProductID,
                Price: item.Price,
                Quantity: item.Quantity
            });
            
            // 保价是数字
            const price = typeof item.Price === 'string' ? parseFloat(item.Price) : item.Price;
            const quantity = parseInt(item.Quantity);
            const subtotal = price * quantity;
            
            // 验证价格是否为有效数字
            if (isNaN(price) || price <= 0) {
                console.error('Invalid price for item:', item);
                throw new Error(`商品 ${item.ProductName} 的价格无效`);
            }
            
            return `
                <tr>
                    <td>${item.ProductName || '未商品'}</td>
                    <td class="text-end">￥${price.toFixed(2)}</td>
                    <td class="text-end">${quantity}</td>
                    <td class="text-end">￥${subtotal.toFixed(2)}</td>
                    <td class="text-center">
                        <input type="number" class="form-control form-control-sm return-quantity" 
                               min="0" max="${quantity}" value="0"
                               data-product-id="${item.ProductID}"
                               data-original-price="${price}">
                    </td>
                </tr>
            `;
        }).join('');
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('returnModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading sale details:', error);
        alert('加载销售订单详情失败: ' + error.message);
    }
}

// 提交退货
async function submitReturn() {
    const saleId = document.getElementById('saleId').value;
    const reason = document.getElementById('returnReason').value;
    
    if (!reason.trim()) {
        alert('请填写退货原因');
        return;
    }
    
    // 收集退货商品信息
    const returnItems = [];
    document.querySelectorAll('.return-quantity').forEach(input => {
        const quantity = parseInt(input.value);
        if (quantity > 0) {
            const tr = input.closest('tr');
            // 从第二列（单价列）获取价格文本，并去掉￥符号
            const priceText = tr.cells[1].textContent;
            const unitPrice = parseFloat(priceText.replace('￥', ''));
            
            console.log('Price debug:', {
                priceText: priceText,
                unitPrice: unitPrice,
                row: tr.innerHTML
            });
            
            // 验证价格是否为有效数字
            if (isNaN(unitPrice) || unitPrice <= 0) {
                console.error('Invalid unit price:', unitPrice);
                throw new Error('商品单价无效');
            }
            
            returnItems.push({
                productId: input.dataset.productId,
                quantity: quantity,
                price: unitPrice  // 使用单价
            });
            
            // 添加日志，检查价格数据
            console.log('Adding return item:', {
                productId: input.dataset.productId,
                quantity: quantity,
                unitPrice: unitPrice,
                totalAmount: unitPrice * quantity
            });
        }
    });
    
    if (returnItems.length === 0) {
        alert('请至少选择一件要退货的商品');
        return;
    }
    
    if (!confirm('确定要提交退货申请吗？')) {
        return;
    }
    
    try {
        const requestData = {
            saleId: parseInt(saleId),
            items: returnItems,
            reason: reason
        };
        
        console.log('Submitting return request:', requestData);
        
        const response = await fetch('http://localhost:3000/api/sales/return', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '提交失败');
        }
        
        const result = await response.json();
        if (result.success) {
            alert('退货申请提交成功');
            const modal = bootstrap.Modal.getInstance(document.getElementById('returnModal'));
            modal.hide();
            queryReturnOrders(); // 刷新列表
        } else {
            throw new Error(result.error || '提交失败');
        }
    } catch (error) {
        console.error('Error submitting return:', error);
        alert('提交退货申请失败: ' + error.message);
    }
}

// 查询销售退货订单
async function queryReturnOrders() {
    try {
        // 获取查询参数
        const saleId = document.getElementById('saleIdQuery')?.value || '';
        const customerId = document.getElementById('customerQuery')?.value || '';
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';
        
        // 构建查询参数
        const params = new URLSearchParams();
        if (saleId) params.append('saleId', saleId);
        if (customerId) params.append('customerId', customerId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        console.log('Querying with params:', Object.fromEntries(params));
        
        // 并行发送两个请求
        const [salesResponse, returnsResponse] = await Promise.all([
            // 查询销售订单
            fetch(`http://localhost:3000/api/sales/query?${params}`),
            // 查询退货记录
            fetch(`http://localhost:3000/api/sales/returns?${params}`)
        ]);

        // 处理销售订单数据
        const sales = await salesResponse.json();
        console.log('Received sales data:', sales);
        
        // 处理退货记录数据
        const returns = await returnsResponse.json();
        console.log('Received returns data:', returns);
        
        // 更新销售订单列表
        const salesTbody = document.getElementById('salesList');
        if (salesTbody) {
            salesTbody.innerHTML = sales.length ? sales.map(sale => `
                <tr>
                    <td>${sale.SaleID}</td>
                    <td>${sale.CustomerName || '未知客户'}</td>
                    <td>${new Date(sale.SaleDate).toLocaleString()}</td>
                    <td class="text-end">￥${parseFloat(sale.TotalAmount || 0).toFixed(2)}</td>
                    <td class="text-end">￥${parseFloat(sale.DiscountAmount || 0).toFixed(2)}</td>
                    <td class="text-end">￥${parseFloat(sale.FinalAmount || 0).toFixed(2)}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-danger" onclick="showReturnModal(${sale.SaleID})">
                            退货
                        </button>
                    </td>
                </tr>
            `).join('') : '<tr><td colspan="7" class="text-center">暂无符合条件的销售订单</td></tr>';
        }

        // 更新退货记录列表
        const returnsTbody = document.getElementById('returnList');
        if (returnsTbody) {
            returnsTbody.innerHTML = returns.length ? returns.map(record => `
                <tr>
                    <td>${record.ReturnID}</td>
                    <td>${record.SaleID}</td>
                    <td>${record.CustomerName}</td>
                    <td>${new Date(record.ReturnDate).toLocaleString('zh-CN')}</td>
                    <td class="text-end">${record.Quantity}</td>
                    <td class="text-end">￥${parseFloat(record.TotalAmount).toFixed(2)}</td>
                    <td>${record.Reason}</td>
                </tr>
            `).join('') : '<tr><td colspan="7" class="text-center">暂无退货记录</td></tr>';
        }
        
    } catch (error) {
        console.error('Error querying data:', error);
        // 显示错误信息
        const salesTbody = document.getElementById('salesList');
        const returnsTbody = document.getElementById('returnList');
        
        const errorMessage = `<tr><td colspan="7" class="text-center text-danger">
            查询失败: ${error.message}
        </td></tr>`;
        
        if (salesTbody) salesTbody.innerHTML = errorMessage;
        if (returnsTbody) returnsTbody.innerHTML = errorMessage;
    }
}

// 重置销售退货查询表单
function resetReturnQueryForm() {
    const form = document.getElementById('salesQueryForm');
    if (form) {
        form.reset();
        queryReturnOrders(); // 重置后重新查询
    }
}

// 加载客户选项
async function loadCustomerOptions() {
    try {
        const response = await fetch('http://localhost:3000/api/customers');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const customers = await response.json();
        const customerSelect = document.getElementById('customerQuery'); // 修改这里，使用正确的ID
        
        if (customerSelect) {
            customerSelect.innerHTML = `
                <option value="">全部</option>
                ${customers.map(customer => `
                    <option value="${customer.CustomerID}">
                        ${customer.CustomerName}${customer.VIPStatus ? ' (VIP)' : ''}
                    </option>
                `).join('')}
            `;
        } else {
            console.error('找不到客户选择下拉框元素');
        }
    } catch (error) {
        console.error('Error loading customer options:', error);
        alert('加载客户列表失败: ' + error.message);
    }
}



