const express = require('express');
const CarController = require('../controllers/carController');
const FavoriteController = require('../controllers/favoriteController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Публичные маршруты
router.get('/cars', CarController.getAll);
router.get('/cars/:id', CarController.getOne);

// Защищенные маршруты (для авторизованных)
router.post('/cars', authMiddleware, CarController.uploadPhoto, CarController.create);
router.put('/cars/:id', authMiddleware, CarController.update);
router.delete('/cars/:id', authMiddleware, CarController.delete);
router.get('/cars/my', authMiddleware, CarController.getMyCars);
router.post('/cars/:id/comments', authMiddleware, CarController.addComment);
router.put('/comments/:commentId', authMiddleware, CarController.updateComment);

// Избранное
router.post('/favorites/:carId', authMiddleware, FavoriteController.add);
router.delete('/favorites/:carId', authMiddleware, FavoriteController.remove);
router.get('/favorites', authMiddleware, FavoriteController.getUserFavorites);
router.get('/favorites/:carId/check', authMiddleware, FavoriteController.checkFavorite);

// Админские маршруты
router.delete('/admin/cars/:id', authMiddleware, adminMiddleware, CarController.adminDelete);
router.delete('/admin/comments/:commentId', authMiddleware, adminMiddleware, CarController.adminDeleteComment);
router.delete('/comments/:commentId', authMiddleware, CarController.deleteOwnComment);
router.put('/admin/comments/:commentId/moderate', authMiddleware, adminMiddleware, CarController.moderateComment);

module.exports = router;