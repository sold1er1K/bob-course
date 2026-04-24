const express = require('express');
const path = require('path');
const { authMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// Страница личного кабинета
router.get('/me', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'profile.html'));
});

// API: получить данные пользователя
router.get('/api/user', authMiddleware, async (req, res) => {
    try {
        const pool = require('../config/db');
        const result = await pool.query(
            'SELECT id, name, email, avatar_url, role_id, created_at FROM users WHERE id = $1',
            [req.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;