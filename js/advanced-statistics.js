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
                        <div class="col-md-4">
                            <label class="form-label">时间范围</label>
                            <input type="date" class="form-control" id="startDate">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">&nbsp;</label>
                            <input type="date" class="form-control" id="endDate">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">统计类型</label>
                            <select class="form-select" id="statTypeSelect">
                                <option value="inout">出入库趋势</option>
                                <option value="category">出库-按类别统计</option>
                                <option value="supplier">入库-按供应商统计</option>
                                <option value="customer">出库-按客户统计</option>
                            </select>
                        </div>
                        <div class="col-12">
                            <button type="button" class="btn btn-primary" onclick="queryAdvancedStats()">
                                <i class="bi bi-search"></i> 查询
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div id="advancedStatsChart" style="height:400px;">
                        <!-- 图表将在此处渲染 -->
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
    initAdvancedStatsPage();
}

// 初始化高级统计页面（加载类别等选项）
async function initAdvancedStatsPage() {
    // 设置默认日期范围（本月）
    const end = new Date();
    const start = new Date();
    start.setDate(1);
    document.getElementById('startDate').value = start.toISOString().split('T')[0];
    document.getElementById('endDate').value = end.toISOString().split('T')[0];
}

// 查询并渲染高级统计图表
async function queryAdvancedStats() {
    // 获取表单参数
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const statType = document.getElementById('statTypeSelect').value;

    // 发送请求获取数据（接口需后端支持）
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('type', statType);

        const resp = await fetch(`http://localhost:3000/api/statistics/advanced?${params}`);
        if (!resp.ok) throw new Error('数据获取失败');
        const data = await resp.json();

        // 渲染图表（调用外部charts工具）
        if (window.renderAdvancedStatsChart) {
            renderAdvancedStatsChart('advancedStatsChart', statType, data);
        } else {
            document.getElementById('advancedStatsChart').innerHTML = '<div class="text-danger">图表库未加载</div>';
        }
    } catch (e) {
        document.getElementById('advancedStatsChart').innerHTML = `<div class="text-danger">加载数据失败：${e.message}</div>`;
    }
}
