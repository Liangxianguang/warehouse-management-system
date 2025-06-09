// 本文件用于封装统计分析相关的图表渲染逻辑（使用ECharts）

// 渲染折线图（以时间为横轴，入库/出库/库存）
function renderLineChart(containerId, lineData, params = {}) {
    if (typeof echarts === 'undefined') {
        document.getElementById(containerId).innerHTML = '<div class="text-danger">ECharts 未加载</div>';
        return;
    }
    const dom = document.getElementById(containerId);
    if (echarts.getInstanceByDom(dom)) echarts.dispose(dom);
    const chart = echarts.init(dom);

    // 动态series
    let series = [];
    if (lineData.in && lineData.in.length) {
        series.push({ name: '入库', type: 'line', data: lineData.in });
    }
    if (lineData.out && lineData.out.length) {
        series.push({ name: '出库', type: 'line', data: lineData.out });
    }
    if (lineData.stock && lineData.stock.length) {
        series.push({ name: '库存', type: 'line', data: lineData.stock });
    }

    const option = {
        title: { text: '出入库/库存趋势' },
        tooltip: { trigger: 'axis' },
        legend: { data: series.map(s => s.name) },
        xAxis: {
            type: 'category',
            data: lineData.dates || [],
            axisLabel: {
                formatter: function (value) {
                    if (typeof value === 'string' && value.includes('T')) {
                        const d = new Date(value);
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${y}-${m}-${day}`;
                    }
                    return value;
                }
            }
        },
        yAxis: { type: 'value' },
        series
    };

    chart.setOption(option);
}

// 渲染柱状图（以商品名为横轴，入库/出库/库存）
function renderBarChart(containerId, barData, params = {}) {
    if (typeof echarts === 'undefined') {
        document.getElementById(containerId).innerHTML = '<div class="text-danger">ECharts 未加载</div>';
        return;
    }
    const dom = document.getElementById(containerId);
    if (echarts.getInstanceByDom(dom)) echarts.dispose(dom);
    const chart = echarts.init(dom);

    let series = [];
    if (barData.in && barData.in.length) {
        series.push({ name: '入库', type: 'bar', data: barData.in });
    }
    if (barData.out && barData.out.length) {
        series.push({ name: '出库', type: 'bar', data: barData.out });
    }
    if (barData.stock && barData.stock.length) {
        series.push({ name: '库存', type: 'bar', data: barData.stock });
    }

    const option = {
        title: { text: '商品统计（柱状图）' },
        tooltip: { trigger: 'axis' },
        legend: { data: series.map(s => s.name) },
        xAxis: { type: 'category', data: barData.products || [] },
        yAxis: { type: 'value' },
        series
    };

    chart.setOption(option);
}

// 渲染饼图（以商品名为分类）
function renderPieChart(containerId, pieData, params = {}) {
    if (typeof echarts === 'undefined') {
        document.getElementById(containerId).innerHTML = '<div class="text-danger">ECharts 未加载</div>';
        return;
    }
    const dom = document.getElementById(containerId);
    if (echarts.getInstanceByDom(dom)) echarts.dispose(dom);
    const chart = echarts.init(dom);

    const option = {
        title: { text: '商品分布（饼图）', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
            name: '商品',
            type: 'pie',
            radius: '60%',
            data: pieData.products || pieData.categories || [],
            emphasis: {
                itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
            }
        }]
    };

    chart.setOption(option);
}

// 渲染出入库趋势折线图（用于日数据统计、月数据统计页面）
function renderInOutTrendChart(containerId, data, title = '出入库趋势') {
    if (typeof echarts === 'undefined') {
        document.getElementById(containerId).innerHTML = '<div class="text-danger">ECharts 未加载</div>';
        return;
    }
    const dom = document.getElementById(containerId);
    if (echarts.getInstanceByDom(dom)) {
        echarts.dispose(dom);
    }
    const chart = echarts.init(dom);

    const option = {
        title: { text: title },
        tooltip: { trigger: 'axis' },
        legend: { data: ['入库', '出库'] },
        xAxis: {
            type: 'category',
            data: data.dates || [],
            axisLabel: {
                formatter: function (value) {
                    if (typeof value === 'string' && value.includes('T')) {
                        const d = new Date(value);
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${y}-${m}-${day}`;
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

    chart.setOption(option);
}