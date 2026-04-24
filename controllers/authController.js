const path = require('path')
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

class AuthController {
    static showLoginPage(req, res) {
        res.sendFile('login.html', { root: './views/auth' });
    }

    static async register(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Все поля обязательны' });
            }
            if (password.length < 6) {
                return res.status(400).json({ error: 'Пароль минимум 6 символов' });
            }

            const existing = await User.findByEmail(email);
            if (existing) {
                return res.status(400).json({ error: 'Email уже зарегистрирован' });
            }

            const user = await User.create({ name, email, password });
            const token = generateToken(user.id, user.email, user.role_id);

            // Сохраняем токен в cookie
            res.cookie('token', token, { 
                httpOnly: true, 
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
            });

            res.status(201).json({
                message: 'Регистрация успешна',
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email и пароль обязательны' });
            }

            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            if (user.is_blocked) {
                return res.status(403).json({ error: 'Ваш аккаунт заблокирован' });
            }

            const isPasswordValid = await User.verifyPassword(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            const token = generateToken(user.id, user.email, user.role_id);

            // Сохраняем токен в cookie
            res.cookie('token', token, { 
                httpOnly: true, 
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
            });

            res.json({
                message: 'Вход выполнен',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role_name,
                    avatar: user.avatar_url
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
}

module.exports = AuthController;