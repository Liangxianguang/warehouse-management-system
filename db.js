const mysql = require('mysql2/promise');
const config = require('./config/db.config');

// 创建连接池
const pool = mysql.createPool({
    ...config,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// 测试数据库连接
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('数据库连接成功!');
        console.log('连接信息:', {
            host: config.host,
            user: config.user,
            database: config.database
        });
        connection.release();
    } catch (error) {
        console.error('数据库连接失败:', error.message);
        console.error('请检查:');
        console.error('1. MySQL服务是否启动');
        console.error('2. 数据库配置是否正确');
        console.error('3. 数据库是否存在');
        throw error;
    }
};

// 执行连接测试
testConnection();

// 导出带错误处理的查询方法
module.exports = {
    query: async (sql, params) => {
        try {
            const [results] = await pool.execute(sql, params);
            return [results];
        } catch (error) {
            console.error('SQL执行错误:', error);
            console.error('SQL语句:', sql);
            console.error('参数:', params);
            throw error;
        }
    },
    getConnection: () => pool.getConnection(),
    beginTransaction: async (connection) => await connection.beginTransaction(),
    commit: async (connection) => await connection.commit(),
    rollback: async (connection) => await connection.rollback()
};
