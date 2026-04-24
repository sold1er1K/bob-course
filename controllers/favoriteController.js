const Favorite = require('../models/Favorite');

class FavoriteController {
    // Добавить в избранное
    static async add(req, res) {
        try {
            const { carId } = req.params;
            const favorite = await Favorite.add(req.userId, carId);
            res.json({ message: 'Добавлено в избранное', favorite });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка добавления в избранное' });
        }
    }

    // Удалить из избранного
    static async remove(req, res) {
        try {
            const { carId } = req.params;
            const favorite = await Favorite.remove(req.userId, carId);
            res.json({ message: 'Удалено из избранного' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка удаления из избранного' });
        }
    }

    // Получить избранное пользователя
    static async getUserFavorites(req, res) {
        try {
            const favorites = await Favorite.getUserFavorites(req.userId);
            res.json(favorites);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка загрузки избранного' });
        }
    }

    // Проверить, в избранном ли
    static async checkFavorite(req, res) {
        try {
            const { carId } = req.params;
            const isFavorite = await Favorite.isFavorite(req.userId, carId);
            res.json({ isFavorite });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка проверки' });
        }
    }
}

module.exports = FavoriteController;