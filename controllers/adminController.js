const User = require('../models/User');
const Car = require('../models/Car');
const Comment = require('../models/Comment');
const pool = require('../config/db');

class AdminController {
    // Получить всех пользователей
    static async getAllUsers(req, res) {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка загрузки пользователей' });
        }
    }

    // Блокировка пользователя
    static async blockUser(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.blockUser(userId);
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            res.json({ message: 'Пользователь заблокирован' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка блокировки' });
        }
    }

    // Разблокировка пользователя
    static async unblockUser(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.unblockUser(userId);
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            res.json({ message: 'Пользователь разблокирован' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка разблокировки' });
        }
    }

    // Изменить роль пользователя
    static async changeRole(req, res) {
        try {
            const { userId } = req.params;
            const { roleId } = req.body;
            
            const user = await User.changeRole(userId, roleId);
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            res.json({ message: 'Роль изменена' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка изменения роли' });
        }
    }

    // Получить статистику
    static async getStats(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM users) as total_users,
                    (SELECT COUNT(*) FROM cars WHERE status = 'active') as total_cars,
                    (SELECT COUNT(*) FROM comments) as total_comments,
                    (SELECT COUNT(*) FROM users WHERE is_blocked = TRUE) as blocked_users
            `);
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка загрузки статистики' });
        }
    }
}

module.exports = AdminController;