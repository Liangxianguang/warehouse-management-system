// js/quality.js
// 质检管理前端逻辑，所有函数均带注释

/**
 * 加载入库质检页面
 */
function loadQualityInspectionPage() {
    // 页面结构
    const content = `
        <div class="container-fluid">
            <h2 class="mb-4">入库质检</h2>
            <form id="qualityForm">
                <div class="mb-3">
                    <label class="form-label">选择入库单</label>
                    <select class="form-select" id="purchaseSelect" required></select>
                </div>
                <div class="mb-3">
                    <label class="form-label">质检人员</label>
                    <input type="text" class="form-control" id="inspector" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">备注</label>
                    <textarea class="form-control" id="note"></textarea>
                </div>
                <div id="inspectionDetails"></div>
                <button type="button" class="btn btn-primary mt-3" onclick="submitQualityInspection()">提交质检</button>
            </form>
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
    loadPurchaseOptions();
}

/**
 * 加载入库单下拉选项，并联动加载商品明细
 */
async function loadPurchaseOptions() {
    // 获取所有入库单
    const res = await fetch('http://localhost:3000/api/quality/purchases');
    const purchases = await res.json();
    const select = document.getElementById('purchaseSelect');
    select.innerHTML = '<option value="">请选择入库单</option>' +
        purchases.map(p => `<option value="${p.PurchaseID}" data-supplierid="${p.SupplierID}" data-supplier="${p.SupplierName}" data-productid="${p.ProductID}" data-productname="${p.ProductName}" data-quantity="${p.Quantity}">${p.PurchaseID} - ${p.ProductName} - ${p.SupplierName}</option>`).join('');
    select.onchange = () => loadInspectionDetails(select.value, select.selectedOptions[0]);
}

/**
 * 加载入库单商品明细，生成质检明细表单
 */
async function loadInspectionDetails(purchaseId, option) {
    if (!purchaseId || !option) {
        document.getElementById('inspectionDetails').innerHTML = '';
        return;
    }
    // 直接用option上的数据
    const productId = option.dataset.productid;
    const productName = option.dataset.productname;
    const quantity = option.dataset.quantity;
    let html = `<div class="mb-2"><b>供应商：</b>${option.dataset.supplier || ''}</div>`;
    html += `<table class="table table-bordered"><thead>
        <tr><th>商品名称</th><th>数量</th><th>质检结果</th><th>备注</th></tr>
    </thead><tbody>`;
    html += `<tr>
        <td>${productName}</td>
        <td>${quantity}</td>
        <td>
            <select class="form-select" id="qcResult">
                <option value="合格">合格</option>
                <option value="不合格">不合格</option>
            </select>
        </td>
        <td><input type="text" class="form-control" id="qcRemark"></td>
    </tr>`;
    html += '</tbody></table>';
    document.getElementById('inspectionDetails').innerHTML = html;
}

/**
 * 提交质检表单
 */
async function submitQualityInspection() {
    const purchaseId = document.getElementById('purchaseSelect').value;
    const inspector = document.getElementById('inspector').value;
    const note = document.getElementById('note').value;
    let supplierId = document.getElementById('purchaseSelect').selectedOptions[0]?.dataset.supplierid;
    if (supplierId === undefined || supplierId === 'undefined' || supplierId === '') {
        supplierId = null;
    }
    if (!purchaseId || !inspector) {
        alert('请填写完整信息');
        return;
    }
    // 直接用option上的数据
    const option = document.getElementById('purchaseSelect').selectedOptions[0];
    console.log('option:', option);
    console.log('data-productid:', option?.dataset.productid);
    const productId = option.dataset.productid;
    const quantity = option.dataset.quantity;
    const result = document.getElementById('qcResult')?.value;
    const remark = document.getElementById('qcRemark')?.value;
    if (!productId || productId === 'undefined') {
        alert('商品ID获取失败，请刷新页面重试！');
        return;
    }
    const details = [{ productId, quantity, result, remark }];
    const body = { purchaseId, inspector, supplierId, note, details };
    const res = await fetch('http://localhost:3000/api/quality/inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
        alert('质检录入成功');
        loadQualityInspectionPage();
    } else {
        alert('录入失败：' + (data.error || '未知错误'));
    }
}

/**
 * 加载质检查询页面
 */
function loadQualityQueryPage() {
    const content = `
        <div class="container-fluid">
            <h2 class="mb-4">质检查询</h2>
            <form class="row g-3 mb-3" id="qualityQueryForm" onsubmit="event.preventDefault();queryQualityResults();">
                <div class="col-md-3">
                    <label class="form-label">开始日期</label>
                    <input type="date" class="form-control" id="startDate">
                </div>
                <div class="col-md-3">
                    <label class="form-label">结束日期</label>
                    <input type="date" class="form-control" id="endDate">
                </div>
                <div class="col-md-3">
                    <label class="form-label">商品名称</label>
                    <input type="text" class="form-control" id="productName">
                </div>
                <div class="col-md-3">
                    <label class="form-label">质检结果</label>
                    <select class="form-select" id="result">
                        <option value="">全部</option>
                        <option value="合格">合格</option>
                        <option value="不合格">不合格</option>
                    </select>
                </div>
                <div class="col-12">
                    <button class="btn btn-primary" type="submit">查询</button>
                </div>
            </form>
            <div id="qualityResults"></div>
        </div>
    `;
    document.getElementById('main-content').innerHTML = content;
}

/**
 * 查询质检结果
 */
async function queryQualityResults() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const productName = document.getElementById('productName').value;
    const result = document.getElementById('result').value;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (productName) params.append('productName', productName);
    if (result) params.append('result', result);
    const res = await fetch('http://localhost:3000/api/quality/query?' + params.toString());
    const data = await res.json();
    let html = `<table class="table table-bordered"><thead>
        <tr>
            <th>质检时间</th><th>质检人员</th><th>供应商</th>
            <th>商品名称</th><th>数量</th><th>结果</th><th>备注</th>
        </tr></thead><tbody>`;
    if (data.length === 0) {
        html += '<tr><td colspan="7" class="text-center">无数据</td></tr>';
    } else {
        data.forEach(row => {
            html += `<tr>
                <td>${row.InspectionDate}</td>
                <td>${row.Inspector}</td>
                <td>${row.SupplierName || ''}</td>
                <td>${row.ProductName}</td>
                <td>${row.Quantity}</td>
                <td>${row.Result}</td>
                <td>${row.Remark || ''}</td>
            </tr>`;
        });
    }
    html += '</tbody></table>';
    document.getElementById('qualityResults').innerHTML = html;
}

// 供 main.js 调用
window.loadQualityInspectionPage = loadQualityInspectionPage;
window.loadQualityQueryPage = loadQualityQueryPage;
