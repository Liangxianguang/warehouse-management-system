const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [employees] = await db.query('SELECT EmployeeID, EmployeeName FROM Employee');
        res.json(employees);
    } catch (error) {
        console.error('获取员工列表失败:', error);
        res.status(500).json({ error: '获取员工列表失败' });
    }
});

module.exports = router;
