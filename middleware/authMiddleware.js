const { verifyToken } = require('../utils/jwt');
const pool = require('../config/db');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Не авторизован' });
        }
        return res.redirect('/login');
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Неверный токен' });
        }
        return res.redirect('/login');
    }
    
    req.userId = decoded.userId;
    next();
};

// Middleware для проверки прав администратора
const adminMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
        return res.status(401).json({ error: 'Не авторизован' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Неверный токен' });
    }
    
    try {
        const result = await pool.query('SELECT role_id FROM users WHERE id = $1', [decoded.userId]);
        const user = result.rows[0];
        
        // role_id = 2 это администратор (из таблицы roles)
        if (!user || user.role_id !== 2) {
            return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
        }
        
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

module.exports = { authMiddleware, adminMiddleware };