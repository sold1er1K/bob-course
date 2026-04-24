const Car = require('../models/Car');
const Comment = require('../models/Comment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка загрузки фото для объявлений
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'cars');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'car-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Только изображения!'));
    }
});

class CarController {
    static async getAll(req, res) {
        try {
            const filters = {
                brand: req.query.brand,
                model: req.query.model,
                priceFrom: req.query.priceFrom,
                priceTo: req.query.priceTo
            };
            const cars = await Car.findAll(filters);
            res.json(cars);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка загрузки объявлений' });
        }
    }

    static async getOne(req, res) {
        try {
            const car = await Car.findById(req.params.id);
            if (!car) {
                return res.status(404).json({ error: 'Объявление не найдено' });
            }
            const comments = await Comment.findByCar(req.params.id);
            res.json({ car, comments });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка загрузки объявления' });
        }
    }

    static async create(req, res) {
        try {
            const { brand, model, year, price, mileage, description } = req.body;
            
            if (!brand || !model || !year || !price) {
                return res.status(400).json({ error: 'Заполните обязательные поля' });
            }
            
            const car = await Car.create({
                userId: req.userId,
                brand,
                model,
                year,
                price,
                mileage: mileage || 0,
                description: description || ''
            });
            
            if (req.file) {
                const photoUrl = '/uploads/cars/' + req.file.filename;
                await Car.addPhoto(car.id, photoUrl, true);
            }
            
            res.status(201).json(car);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка создания объявления' });
        }
    }

    static async update(req, res) {
        try {
            const car = await Car.update(req.params.id, req.userId, req.body);
            if (!car) {
                return res.status(404).json({ error: 'Объявление не найдено или нет прав' });
            }
            res.json(car);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка обновления' });
        }
    }

    static async delete(req, res) {
        try {
            const car = await Car.delete(req.params.id, req.userId);
            if (!car) {
                return res.status(404).json({ error: 'Объявление не найдено или нет прав' });
            }
            res.json({ message: 'Объявление удалено' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка удаления' });
        }
    }

    // Админское удаление объявления
    static async adminDelete(req, res) {
        try {
            const car = await Car.adminDelete(req.params.id);
            if (!car) {
                return res.status(404).json({ error: 'Объявление не найдено' });
            }
            res.json({ message: 'Объявление удалено администратором' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка удаления' });
        }
    }

    static async getMyCars(req, res) {
        try {
            const cars = await Car.findByUser(req.userId);
            res.json(cars);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка загрузки' });
        }
    }

    static async addComment(req, res) {
        try {
            const { content } = req.body;
            if (!content) {
                return res.status(400).json({ error: 'Введите текст комментария' });
            }
            
            const comment = await Comment.create({
                carId: req.params.id,
                userId: req.userId,
                content
            });
            
            const pool = require('../config/db');
            const userResult = await pool.query('SELECT name, avatar_url, role_id FROM users WHERE id = $1', [req.userId]);
            
            res.status(201).json({
                ...comment,
                user_name: userResult.rows[0].name,
                user_avatar: userResult.rows[0].avatar_url,
                user_role: userResult.rows[0].role_id
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка добавления комментария' });
        }
    }

    // Админское удаление комментария
    static async adminDeleteComment(req, res) {
        try {
            const comment = await Comment.adminDelete(req.params.commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Комментарий не найден' });
            }
            res.json({ message: 'Комментарий удален администратором' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка удаления комментария' });
        }
    }

    static uploadPhoto = upload.single('photo');

    static async updateComment(req, res) {
        try {
            const { commentId } = req.params;
            const { content } = req.body;
            
            if (!content) {
                return res.status(400).json({ error: 'Введите текст комментария' });
            }
            
            const comment = await Comment.update(commentId, req.userId, content);
            if (!comment) {
                return res.status(404).json({ error: 'Комментарий не найден или нет прав' });
            }
            
            res.json({ message: 'Комментарий обновлен', comment });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка обновления комментария' });
        }
    }

    static async moderateComment(req, res) {
        try {
            const { commentId } = req.params;
            const { status } = req.body;
            
            const comment = await Comment.moderate(commentId, status);
            if (!comment) {
                return res.status(404).json({ error: 'Комментарий не найден' });
            }
            
            res.json({ message: `Комментарий ${status === 'active' ? 'активирован' : 'скрыт'}` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка модерации' });
        }
    }

    // Удаление своего комментария
    static async deleteOwnComment(req, res) {
        try {
            const { commentId } = req.params;
            const Comment = require('../models/Comment');
            const comment = await Comment.delete(commentId, req.userId);
            if (!comment) {
                return res.status(404).json({ error: 'Комментарий не найден или нет прав' });
            }
            res.json({ message: 'Комментарий удален' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка удаления' });
        }
    }
}

module.exports = CarController;