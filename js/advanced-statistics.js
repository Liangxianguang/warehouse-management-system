// 高级统计页面加载函数
function loadAdvancedStatsPage() {
    const content = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    <i class="bi bi-bar-chart-line me-2"></i>
                    高级统计分析
                </h2>
                <button class="btn btn-outline-primary" onclick="loadDashboardPage()">
                    <i class="bi bi-house-door me-1"></i> 返回主页
                </button>
            </div>
            <div class="card mb-4">
                <div class="card-body">
                    <form id="advancedStatsForm" class="row g-3 align-items-end">
                        <!-- Line 1: 时间区间 -->
                        <div class="col-md-3">
                            <label class="form-label">开始时间</label>
                            <input type="date" class="form-control" id="startDate">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">结束时间</label>
                            <input type="date" class="form-control" id="endDate">
                        </div>
                        <div class="col-md-6 d-flex align-items-end">
                            <div class="btn-group w-100" role="group" aria-label="快速选择">
                                <button type="button" class="btn btn-outline-secondary" onclick="quickDate('today')">今天</button>
                                <button type="button" class="btn btn-outline-secondary" onclick="quickDate('week')">本周</button>
                                <button type="button" class="btn btn-outline-secondary" onclick="quickDate('month')">本月</button>
                                <button type="button" class="btn btn-outline-secondary" onclick="quickDate('quarter')">本季</button>
                                <button type="button" class="btn btn-outline-secondary" onclick="quickDate('year')">本年</button>
                            </div>
                        </div>
                        <!-- Line 2: 统计类别与具体类型 -->
                        <div class="col-md-3">
                            <label class="form-label">统计类别</label>
                            <select class="form-select" id="mainStatType">
                                <option value="">请选择类别</option>
                                <option value="stock">库存</option>
                                <option value="inout">出入库</option>
                            </select>
                        </div>
                        <div class="col-md-3" id="subTypeCol" style="display:none;">
                            <label class="form-label">具体类型</label>
                            <select class="form-select" id="subStatType">
                                <option value="">全部</option>
                                <option value="in">入库</option>
                                <option value="out">出库</option>
                            </select>
                        </div>
                        <!-- 高级筛选按钮单独一行 -->
                        <div class="col-12">
                            <button type="button" class="btn btn-outline-secondary" id="toggleAdvancedBtn">
                                <i class="bi bi-sliders"></i> 高级筛选
                            </button>
                        </div>
                        <div class="col-12" id="advancedFilterPanel" style="display:none;">
                            <div class="row g-3 mt-2">
                                <div class="col-md-3" id="supplierFilterCol" style="display:none;">
                                    <label class="form-label">供应商</label>
                                    <select class="form-select" id="supplierSelect">
                                        <option value="">全部</option>
                                    </select>
                                </div>
                                <div class="col-md-3" id="customerFilterCol" style="display:none;">
                                    <label class="form-label">客户</label>
                                    <select class="form-select" id="customerSelect">
                                        <option value="">全部</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">商品类别</label>
                                    <select class="form-select" id="categorySelect">
                                        <option value="">全部</option>
                                        <option value="粮食">粮食</option>
                                        <option value="水果">水果</option>
                                        <option value="速食">速食</option>
                                        <option value="油类">油类</option>
                                        <option value="蔬菜">蔬菜</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <!-- 查询按钮放在最后 -->
                        <div class="col-md-6 d-flex align-items-end justify-content-end">
                            <button type="button" class="btn btn-outline-primary" id="refreshBtn" title="刷新" onclick="queryAdvancedStats()">
                                <i class="bi bi-arrow-clockwise"></i> 刷新
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <!-- 三个图表容器 -->
                    <div id="advancedLineChart" style="height:320px;margin-bottom:24px;"></div>
                    <div id="advancedBarChart" style="height:320px;margin-bottom:24px;"></div>
                    <div id="advancedPieChart" style="height:320px;"></div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
    initAdvancedStatsPage();
}

// 格式化日期为本地字符串（YYYY-MM-DD）
function formatDateLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// 初始化高级统计页面
async function initAdvancedStatsPage() {
    // 设置默认日期范围（本月）
    const end = new Date();
    const start = new Date();
    start.setDate(1); // 本月1号
    document.getElementById('startDate').value = formatDateLocal(start);
    document.getElementById('endDate').value = formatDateLocal(end);

    const advBtn = document.getElementById('toggleAdvancedBtn');
    if (advBtn) {
        advBtn.onclick = toggleAdvancedFilter;
    }
    // 在initAdvancedStatsPage最后调用
    bindAutoRefresh();

    // 事件绑定
    document.getElementById('mainStatType').addEventListener('change', onMainStatTypeChange);
    document.getElementById('subStatType').addEventListener('change', onSubStatTypeChange);
    // 初始化时隐藏具体类型和高级筛选
    onMainStatTypeChange();
    updateAdvancedFilterVisibility();
    await Promise.all([
        loadSupplierOptions(),
        loadCustomerOptions()
    ]);
}

// 统计类别变化时，控制具体类型选择框显示与否
function onMainStatTypeChange() {
    const mainType = document.getElementById('mainStatType').value;
    const subTypeCol = document.getElementById('subTypeCol');
    // 只有选择“出入库”时显示具体类型
    if (mainType === 'inout') {
        subTypeCol.style.display = '';
    } else {
        subTypeCol.style.display = 'none';
        document.getElementById('subStatType').value = '';
    }
    updateAdvancedFilterVisibility();
}

// 具体类型变化时，更新高级筛选区显示
function onSubStatTypeChange() {
    updateAdvancedFilterVisibility();
}

// 高级筛选按钮切换
function toggleAdvancedFilter() {
    const panel = document.getElementById('advancedFilterPanel');
    panel.style.display = panel.style.display === 'none' ? '' : 'none';
    updateAdvancedFilterVisibility();
}

// 根据统计类别和具体类型，动态显示高级筛选区的各选择框
function updateAdvancedFilterVisibility() {
    const mainType = document.getElementById('mainStatType').value;
    const subType = document.getElementById('subStatType').value;
    // 供应商：库存 或 出入库.入库
    const showSupplier = (mainType === 'stock') || (mainType === 'inout' && subType === 'in');
    // 客户：出入库.出库
    const showCustomer = (mainType === 'inout' && subType === 'out');
    // 商品类别：高级筛选展开时始终显示
    const panel = document.getElementById('advancedFilterPanel');
    document.getElementById('supplierFilterCol').style.display = showSupplier && panel.style.display !== 'none' ? '' : 'none';
    document.getElementById('customerFilterCol').style.display = showCustomer && panel.style.display !== 'none' ? '' : 'none';
    // 商品类别始终显示（只要高级筛选展开）
    // 不需要隐藏
}

// 获取并填充供应商下拉框
async function loadSupplierOptions() {
    try {
        const resp = await fetch('http://localhost:3000/api/suppliers');
        if (!resp.ok) throw new Error('获取供应商失败');
        const data = await resp.json();
        const select = document.getElementById('supplierSelect');
        select.innerHTML = '<option value="">全部</option>' +
            data.map(s => `<option value="${s.SupplierID}">${s.SupplierName}</option>`).join('');
    } catch (e) {
        document.getElementById('supplierSelect').innerHTML = '<option value="">全部</option>';
    }
}

// 获取并填充客户下拉框
async function loadCustomerOptions() {
    try {
        const resp = await fetch('http://localhost:3000/api/customers');
        if (!resp.ok) throw new Error('获取客户失败');
        const data = await resp.json();
        const select = document.getElementById('customerSelect');
        select.innerHTML = '<option value="">全部</option>' +
            data.map(c => `<option value="${c.CustomerID}">${c.CustomerName}</option>`).join('');
    } catch (e) {
        document.getElementById('customerSelect').innerHTML = '<option value="">全部</option>';
    }
}


// 快速时间选择
function quickDate(type) {
    const end = new Date();
    let start = new Date();
    switch (type) {
        case 'today':
            break;
        case 'week':
            start.setDate(end.getDate() - end.getDay() + 1); // 周一
            break;
        case 'month':
            start.setDate(1);
            break;
        case 'quarter':
            start.setDate(1); // 先设为1号，防止溢出
            start.setMonth(Math.floor(end.getMonth() / 3) * 3);
            break;
        case 'year':
            start.setDate(1); // 先设为1号，防止溢出
            start.setMonth(0);
            break;
    }
    document.getElementById('startDate').value = formatDateLocal(start);
    document.getElementById('endDate').value = formatDateLocal(end);
}



// 页面加载后自动初始化
// loadAdvancedStatsPage() 会自动调用 initAdvancedStatsPage()

function allRequiredFilled() {
    return document.getElementById('startDate').value &&
           document.getElementById('endDate').value &&
           document.getElementById('mainStatType').value;
}

function bindAutoRefresh() {
    ['startDate', 'endDate', 'mainStatType', 'subStatType', 'supplierSelect', 'customerSelect', 'categorySelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                if (allRequiredFilled()) queryAdvancedStats();
            });
        }
    });
}

// 查询并渲染高级统计图表
async function queryAdvancedStats() {
    // 获取表单参数
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const mainStatType = document.getElementById('mainStatType').value;
    const subStatType = document.getElementById('subStatType').value;
    const supplierId = document.getElementById('supplierSelect').value;
    const customerId = document.getElementById('customerSelect').value;
    const category = document.getElementById('categorySelect').value;

    // 发送请求获取数据（接口需后端支持）
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (mainStatType) params.append('mainStatType', mainStatType);
        if (subStatType) params.append('subStatType', subStatType);
        if (supplierId) params.append('supplierId', supplierId);
        if (customerId) params.append('customerId', customerId);
        if (category) params.append('category', category);

        const resp = await fetch(`http://localhost:3000/api/statistics/advanced?${params}`);
        if (!resp.ok) throw new Error('数据获取失败');
        const data = await resp.json();

        // 分别渲染三个图表
        if (window.renderLineChart && window.renderBarChart && window.renderPieChart) {
            renderLineChart('advancedLineChart', data.line, { mainStatType, subStatType });
            renderBarChart('advancedBarChart', data.bar, { mainStatType, subStatType });
            renderPieChart('advancedPieChart', data.pie, { mainStatType, subStatType });
        } else {
            document.getElementById('advancedLineChart').innerHTML = '<div class="text-danger">图表库未加载</div>';
            document.getElementById('advancedBarChart').innerHTML = '<div class="text-danger">图表库未加载</div>';
            document.getElementById('advancedPieChart').innerHTML = '<div class="text-danger">图表库未加载</div>';
        }
    } catch (e) {
        document.getElementById('advancedLineChart').innerHTML = `<div class="text-danger">加载数据失败：${e.message}</div>`;
        document.getElementById('advancedBarChart').innerHTML = `<div class="text-danger">加载数据失败：${e.message}</div>`;
        document.getElementById('advancedPieChart').innerHTML = `<div class="text-danger">加载数据失败：${e.message}</div>`;
    }
}
