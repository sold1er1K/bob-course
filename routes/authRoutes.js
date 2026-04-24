const express = require('express');
const path = require('path');
const AuthController = require('../controllers/authController');
const router = express.Router();

// Простой маршрут без лишних проверок для теста
router.get('/login', (req, res) => {
    console.log('Запрос на /login получен');
    const filePath = path.join(__dirname, '..', 'views', 'auth', 'login.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Ошибка отправки файла:', err);
            res.status(404).send('Страница не найдена');
        }
    });
});

// API эндпоинты
router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/login', AuthController.login);

module.exports = router;