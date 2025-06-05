// 出库管理相关的功能模块

// 获取出库表单HTML
function getOutboundFormHTML() {
    return `
    <div class="row">
        <!-- 左侧出库表单 -->
        <div class="col-md-8">
            <!-- 商品查询和出库策略 -->
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">商品查询</h5>
                    <button type="button" class="btn btn-secondary" onclick="showOutboundRecords()">
                        查看出库记录
                    </button>
                </div>
                <div class="card-body">
                    <form id="outboundSearchForm" class="mb-4">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">商品名称/编号</label>
                                <input type="text" class="form-control" id="productSearch" placeholder="输入商品名称或编号">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">出库策略</label>
                                <select class="form-select" id="outboundStrategy">
                                    <option value="FIFO">先进先出(FIFO)</option>
                                    <option value="LIFO">后进先出(LIFO)</option>
                                    <option value="BATCH">按批次出库</option>
                                    <option value="LOCATION">库位优化</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">&nbsp;</label>
                                <button type="button" class="btn btn-primary w-100" onclick="searchProducts()">
                                    <i class="bi bi-search"></i> 查询商品
                                </button>
                            </div>
                        </div>
                    </form>
                    
                    <!-- 商品列表 -->
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>商品编号</th>
                                    <th>商品名称</th>
                                    <th>批次号</th>
                                    <th>入库日期</th>
                                    <th>库位</th>
                                    <th>可用数量</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="productList">
                                <!-- 商品列表将动态加载 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- 出库清单 -->
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">出库清单</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>商品名称</th>
                                    <th>批次号</th>
                                    <th>出库数量</th>
                                    <th>库位</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="outboundList">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右侧出库信息 -->
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">出库信息</h5>
                    <form id="outboundForm">
                        <div class="mb-3">
                            <label class="form-label">出库单号</label>
                            <input type="text" class="form-control" id="outboundNo" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">出库类型</label>
                            <select class="form-select" id="outboundType" required>
                                <option value="SALE">销售出库</option>
                                <option value="TRANSFER">调拨出库</option>
                                <option value="DAMAGE">损坏出库</option>
                                <option value="OTHER">其他出库</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">经办人</label>
                            <select class="form-select" id="operatorSelect" required>
                                <option value="">请选择经办人</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">备注</label>
                            <textarea class="form-control" id="outboundNote" rows="3"></textarea>
                        </div>
                        <button type="button" class="btn btn-primary w-100" onclick="submitOutbound()">
                            确认出库
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}

// 加载出库管理页面
window.loadOutboundPage = function() {
    const content = `
        ${createPageHeader('出库管理')}
        <div class="container-fluid">
            <!-- 导航按钮 -->
            <div class="row mb-3">
                <div class="col">
                    <div class="btn-group">
                        <button class="btn btn-primary active" onclick="showOutboundForm()">新建出库</button>
                        <button class="btn btn-secondary" onclick="showOutboundRecords()">出库记录</button>
                    </div>
                </div>
            </div>
            
            <!-- 内容显示区域 -->
            <div id="outboundContent">
                ${getOutboundFormHTML()}
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    initOutboundPage();
}

// 显示出库表单
window.showOutboundForm = function() {
    // 更新按钮状态
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.btn-group .btn-primary').classList.add('active');
    
    // 显示表单内容
    document.getElementById('outboundContent').innerHTML = getOutboundFormHTML();
    initOutboundPage();
}

// 显示出库记录
window.showOutboundRecords = async function() {
    try {
        // 更新按钮状态
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.btn-group .btn-secondary').classList.add('active');

        const response = await fetch('http://localhost:3000/api/outbound/records');
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || '获取出库记录失败');
        }
        
        const records = await response.json();
        console.log('从服务器获取的数据:', records); // 添加调试日志
        
        const recordsContent = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">出库记录</h5>
                    <button class="btn btn-outline-primary" onclick="showOutboundForm()">
                        新建出库
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>出库单号</th>
                                    <th>出库类型</th>
                                    <th>出库日期</th>
                                    <th>经办人</th>
                                    <th>出库策略</th>
                                    <th>商品</th>
                                    <th>数量</th>
                                    <th>批次号</th>
                                    <th>库位</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${records.length === 0 ? 
                                    '<tr><td colspan="9" class="text-center">暂无出库记录</td></tr>' :
                                    records.map(record => {
                                        console.log('处理单条记录:', record); // 添加调试日志
                                        return `
                                            <tr>
                                                <td>${record.OutboundNo || '-'}</td>
                                                <td>${record.OutboundType || '-'}</td>
                                                <td>${record.OutboundDate || '-'}</td>
                                                <td>${record.OperatorName || '-'}</td>
                                                <td>${record.OutboundStrategy || '-'}</td>
                                                <td>${record.ProductNames || '暂无商品信息'}</td>
                                                <td>${record.TotalQuantity || 0} </td>
                                                <td>${record.BatchNos || '暂无批次'}</td>
                                                <td>${record.Locations || '暂无库位'}</td>
                                            </tr>
                                        `;
                                    }).join('')
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('outboundContent').innerHTML = recordsContent;
        
    } catch (error) {
        console.error('获取出库记录失败:', error);
        document.getElementById('outboundContent').innerHTML = `
            <div class="alert alert-danger">
                获取出库记录失败: ${error.message}
            </div>
        `;
    }
}

// 辅助函数：获取出库记录行HTML
function getRecordRowHTML(record) {
    return `
        <tr>
            <td>${record.OutboundNo}</td>
            <td>${getOutboundTypeName(record.OutboundType)}</td>
            <td>${new Date(record.OutboundDate).toLocaleString()}</td>
            <td>${record.OperatorName}</td>
            <td>${getStrategyName(record.OutboundStrategy)}</td>
            <td>${record.ItemCount || 0} 种</td>
            <td>${record.TotalQuantity || 0} 件</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewOutboundDetail('${record.OutboundNo}')">
                    查看详情
                </button>
            </td>
        </tr>
    `;
}

// 辅助函数：获取出库类型名称
function getOutboundTypeName(type) {
    const types = {
        'SALE': '销售出库',
        'TRANSFER': '调拨出库',
        'DAMAGE': '损坏出库',
        'OTHER': '其他出库'
    };
    return types[type] || type;
}

// 辅助函数：获取出库策略名称
function getStrategyName(strategy) {
    const strategies = {
        'FIFO': '先进先出',
        'LIFO': '后进先出',
        'BATCH': '按批次',
        'LOCATION': '库位优化'
    };
    return strategies[strategy] || strategy;
}

// 初始化出库页面
window.initOutboundPage = async function() {
    try {
        // 生成出库单号
        const timestamp = new Date().getTime();
        document.getElementById('outboundNo').value = `OUT${timestamp}`;
        
        // 加载员工列表
        const empResponse = await fetch('http://localhost:3000/api/employees');
        const employees = await empResponse.json();
        
        const operatorSelect = document.getElementById('operatorSelect');
        operatorSelect.innerHTML = employees.map(emp => `
            <option value="${emp.EmployeeID}">${emp.EmployeeName}</option>
        `).join('');
        
        // 初始化商品搜索
        await searchProducts();
        
    } catch (error) {
        console.error('Error initializing outbound page:', error);
        alert('初始化出库页面失败');
    }
}

// 修改搜索商品函数
window.searchProducts = async function() {
    const searchTerm = document.getElementById('productSearch').value;
    const strategy = document.getElementById('outboundStrategy').value;
    
    try {
        // 测试服务连接
        const testResponse = await fetch('http://localhost:3000/api/outbound/test');
        if (!testResponse.ok) {
            throw new Error('服务器连接测试失败');
        }
        console.log('服务器连接正常');

        // 执行搜索请求
        const response = await fetch('http://localhost:3000/api/outbound/available-stock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                searchTerm,
                strategy
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }

        const products = await response.json();
        console.log('获取到的商品数据:', products);

        // 根据策略对数据进行排序
        const sortedProducts = sortProductsByStrategy(products, strategy);

        const tbody = document.getElementById('productList');
        if (!Array.isArray(sortedProducts) || sortedProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">未找到可用库存</td></tr>';
            return;
        }

        tbody.innerHTML = sortedProducts.map(product => `
            <tr>
                <td>${product.ProductID || ''}</td>
                <td>${product.ProductName || ''}</td>
                <td>${product.BatchNo || '未分配'}</td>
                <td>${product.InboundDate ? new Date(product.InboundDate).toLocaleString() : '-'}</td>
                <td>${product.Location || '默认库位'}</td>
                <td>${product.AvailableQuantity || 0}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-primary"
                            onclick="addToOutbound('${product.ProductID}', '${product.ProductName}', '${product.BatchNo}', ${product.AvailableQuantity}, '${product.Location}')">
                        出库
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('搜索商品时发生错误:', error);
        const tbody = document.getElementById('productList');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    搜索失败: ${error.message}
                    <br>
                    <small>请检查服务器控制台获取详细错误信息</small>
                </td>
            </tr>
        `;
    }
}

// 添加排序函数
function sortProductsByStrategy(products, strategy) {
    return [...products].sort((a, b) => {
        switch (strategy) {
            case 'FIFO': // 先进先出，按入库时间升序
                return new Date(a.InboundDate) - new Date(b.InboundDate);
            
            case 'LIFO': // 后进先出，按入库时间降序
                return new Date(b.InboundDate) - new Date(a.InboundDate);
            
            case 'BATCH': // 按批次号排序
                return (a.BatchNo || '').localeCompare(b.BatchNo || '');
            
            case 'LOCATION': // 按库位排序
                return (a.Location || '').localeCompare(b.Location || '');
            
            default:
                return new Date(a.InboundDate) - new Date(b.InboundDate);
        }
    });
}

// 添加到出库清单
window.addToOutbound = function(productId, productName, batchNo, availableQuantity, location) {
    const quantity = prompt('请输入出库数量：');
    if (!quantity || isNaN(quantity) || quantity <= 0) {
        alert('请输入有效的出库数量');
        return;
    }
    
    // 验证出库数量是否超过可用库存
    if (parseInt(quantity) > availableQuantity) {
        alert(`出库数量不能超过可用库存 ${availableQuantity}`);
        return;
    }
    
    const existingRows = document.getElementById('outboundList').getElementsByTagName('tr');
    for (let row of existingRows) {
        if (row.dataset.productId === productId && row.dataset.batchNo === batchNo) {
            alert('该商品批次已在出库清单中');
            return;
        }
    }
    
    const tr = document.createElement('tr');
    tr.dataset.productId = productId;
    tr.dataset.batchNo = batchNo;
    tr.dataset.maxQuantity = availableQuantity; // 保存可用库存用于后续验证
    tr.innerHTML = `
        <td>${productName}</td>
        <td>${batchNo}</td>
        <td>${quantity}</td>
        <td>${location}</td>
        <td>
            <button type="button" class="btn btn-sm btn-danger" onclick="removeFromOutbound(this)">
                删除
            </button>
        </td>
    `;
    
    document.getElementById('outboundList').appendChild(tr);
}

// 从出库清单中移除
window.removeFromOutbound = function(button) {
    button.closest('tr').remove();
}

// 提交出库
window.submitOutbound = async function() {
    const rows = document.getElementById('outboundList').getElementsByTagName('tr');
    if (rows.length === 0) {
        alert('请添加出库商品');
        return;
    }

    // 验证必填信息
    const operatorId = document.getElementById('operatorSelect').value;
    if (!operatorId) {
        alert('请选择经办人');
        return;
    }
    
    // 收集并验证出库项
    const outboundItems = [];
    for (let row of rows) {
        const quantity = parseInt(row.cells[2].textContent);
        const maxQuantity = parseInt(row.dataset.maxQuantity || 0);
        
        // 验证出库数量
        if (quantity > maxQuantity) {
            alert(`商品 ${row.cells[0].textContent} 的出库数量超过可用库存!`);
            return;
        }
        
        outboundItems.push({
            productId: row.dataset.productId,
            batchNo: row.dataset.batchNo,
            quantity: quantity,
            location: row.cells[3].textContent
        });
    }
    
    const outboundData = {
        outboundNo: document.getElementById('outboundNo').value,
        outboundType: document.getElementById('outboundType').value,
        operatorId: operatorId,
        note: document.getElementById('outboundNote').value,
        strategy: document.getElementById('outboundStrategy').value,
        items: outboundItems
    };
    
    try {
        // 修改请求URL从 /api/warehouse/outbound 改为 /api/outbound
        const response = await fetch('http://localhost:3000/api/outbound', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(outboundData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '出库失败');
        }
        
        const result = await response.json();
        if (result.success) {
            alert('出库成功');
            // 重新加载页面
            window.loadOutboundPage();
        } else {
            throw new Error(result.message || '出库失败');
        }
    } catch (error) {
        console.error('Error submitting outbound:', error);
        alert('提交出库失败: ' + error.message);
    }
}

// 添加出库策略切换事件处理
document.addEventListener('DOMContentLoaded', function() {
    const strategySelect = document.getElementById('outboundStrategy');
    if (strategySelect) {
        strategySelect.addEventListener('change', function() {
            // 切换策略时重新搜索商品
            window.searchProducts();
        });
    }
});

// 查看出库详情
window.viewOutboundDetail = async function(outboundNo) {
    try {
        const response = await fetch(`http://localhost:3000/api/outbound/record/${outboundNo}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '获取出库详情失败');
        }
        
        const data = await response.json();
        console.log('获取到的出库详情:', data); // 添加日志

        // 创建模态框
        const modalHtml = `
            <div class="modal fade" id="outboundDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">出库单详情 - ${outboundNo}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p><strong>出库日期：</strong> ${new Date(data.outboundInfo.OutboundDate).toLocaleString()}</p>
                                    <p><strong>经办人：</strong> ${data.outboundInfo.OperatorName || '未知'}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>出库策略：</strong> ${getStrategyName(data.outboundInfo.OutboundStrategy)}</p>
                                    <p><strong>出库类型：</strong> ${getOutboundTypeName(data.outboundInfo.OutboundType)}</p>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>商品名称</th>
                                            <th>批次号</th>
                                            <th>数量</th>
                                            <th>库位</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${data.details.map(detail => `
                                            <tr>
                                                <td>${detail.ProductName}</td>
                                                <td>${detail.BatchNo || '未分配'}</td>
                                                <td>${detail.Quantity} 件</td>
                                                <td>${detail.Location || '默认库位'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            ${data.outboundInfo.Note ? 
                                `<div class="mt-3">
                                    <strong>备注：</strong>
                                    <p class="mb-0">${data.outboundInfo.Note}</p>
                                </div>` : 
                                ''
                            }
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 删除可能存在的旧模态框
        const oldModal = document.getElementById('outboundDetailModal');
        if (oldModal) {
            oldModal.remove();
        }
        
        // 添加新模态框到页面
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('outboundDetailModal'));
        modal.show();
        
        // 模态框关闭时移除元素
        document.getElementById('outboundDetailModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
        
    } catch (error) {
        console.error('获取出库详情失败:', error);
        alert('获取出库详情失败: ' + error.message);
    }
}

// 在页面加载完成后显示出库记录
document.addEventListener('DOMContentLoaded', function() {
    const outboundStrategy = document.getElementById('outboundStrategy');
    if (outboundStrategy) {
        outboundStrategy.addEventListener('change', function() {
            window.searchProducts();
        });
    }
});

// 修改页面加载函数
window.loadOutboundPage = function() {
    const content = `
        ${createPageHeader('出库管理')}
        <div class="container-fluid">
            <!-- 导航按钮 -->
            <div class="row mb-3">
                <div class="col">
                    <div class="btn-group">
                        <button class="btn btn-primary active" onclick="showOutboundForm()">新建出库</button>
                        <button class="btn btn-secondary" onclick="showOutboundRecords()">出库记录</button>
                    </div>
                </div>
            </div>
            
            <!-- 内容显示区域 -->
            <div id="outboundContent">
                ${getOutboundFormHTML()}
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    initOutboundPage();
}
