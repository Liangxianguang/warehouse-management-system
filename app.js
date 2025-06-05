const express = require('express');
const cors = require('cors');
const app = express();

// 添加日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 跨域和解析设置
app.use(cors());
app.use(express.json());

// 测试路由
app.get('/api/test', (req, res) => {
    res.json({ status: 'ok', message: '服务器运行正常' });
});

// 注册路由
const employeesRouter = require('./routes/employees');
const outboundRouter = require('./routes/outbound');

app.use('/api/employees', employeesRouter);
app.use('/api/outbound', outboundRouter);

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        error: '服务器错误',
        message: err.message
    });
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`测试链接: http://localhost:${PORT}/api/test`);
});

module.exports = app;