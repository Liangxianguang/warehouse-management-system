// 本文件用于封装统计分析相关的图表渲染逻辑（支持 Chart.js 或 ECharts）

// 统一入口：高级统计页面调用
function renderAdvancedStatsChart(containerId, statType, data) {
    // 这里以 ECharts 为例，Chart.js 可自行替换
    if (typeof echarts === 'undefined') {
        document.getElementById(containerId).innerHTML = '<div class="text-danger">ECharts 未加载</div>';
        return;
    }
    const dom = document.getElementById(containerId);
    // 销毁旧实例，防止残影
    if (echarts.getInstanceByDom(dom)) {
        echarts.dispose(dom);
    }
    const chart = echarts.init(dom);

    let option = {};
    if (statType === 'inout') {
        // 出入库趋势（折线图）
        option = {
            title: { text: '出入库趋势' },
            tooltip: { trigger: 'axis' },
            legend: { data: ['入库', '出库'] },
            xAxis: {
                type: 'category',
                data: data.dates || [],
                axisLabel: {
                    formatter: function (value) {
                        // 只处理 ISO 格式
                        if (typeof value === 'string' && value.includes('T')) {
                            const d = new Date(value);
                            const y = d.getFullYear();
                            const m = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            const h = String(d.getHours()).padStart(2, '0');
                            const min = String(d.getMinutes()).padStart(2, '0');
                            return `${y}-${m}-${day} ${h}:${min}`;
                        }
                        return value;
                    }
                }
            },
            yAxis: { type: 'value' },
            series: [
                { name: '入库', type: 'line', data: data.in || [] },
                { name: '出库', type: 'line', data: data.out || [] }
            ]
        };
    } else if (statType === 'category') {
        // 按类别分布（饼图）
        option = {
            title: { text: '出库-按类别统计', left: 'center' },
            tooltip: { trigger: 'item' },
            legend: { orient: 'vertical', left: 'left' },
            series: [{
                name: '类别',
                type: 'pie',
                radius: '60%',
                data: data.categories || [],
                emphasis: {
                    itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
                }
            }]
        };
    } else if (statType === 'supplier') {
        // 按供应商统计（柱状图）
        option = {
            title: { text: '入库-按供应商统计' },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: data.suppliers || [] },
            yAxis: { type: 'value' },
            series: [{
                name: '入库量',
                type: 'bar',
                data: data.amounts || []
            }]
        };
    } else if (statType === 'customer') {
        // 按客户统计（柱状图）
        option = {
            title: { text: '出库-按客户统计' },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: data.customers || [] },
            yAxis: { type: 'value' },
            series: [{
                name: '出库量',
                type: 'bar',
                data: data.amounts || []
            }]
        };
    } else {
        option = { title: { text: '暂无数据' } };
    }

    chart.setOption(option);
}

// 其它统计页面可添加类似的渲染函数，如：
// function renderDailyStockChart(containerId, data) { ... }
// function renderMonthlyInOutChart(containerId, data) { ... }
