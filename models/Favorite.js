const pool = require('../config/db');

class Favorite {
    static async add(userId, carId) {
        const query = `
            INSERT INTO favorites (user_id, car_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, car_id) DO NOTHING
            RETURNING *
        `;
        const result = await pool.query(query, [userId, carId]);
        return result.rows[0];
    }

    static async remove(userId, carId) {
        const query = `DELETE FROM favorites WHERE user_id = $1 AND car_id = $2 RETURNING car_id`;
        const result = await pool.query(query, [userId, carId]);
        return result.rows[0];
    }

    static async getUserFavorites(userId) {
        const query = `
            SELECT c.*, u.name as owner_name, 
                   (SELECT photo_url FROM car_photos WHERE car_id = c.id AND is_main = TRUE LIMIT 1) as main_photo
            FROM favorites f
            JOIN cars c ON f.car_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE f.user_id = $1 AND c.status = 'active'
            ORDER BY f.created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async isFavorite(userId, carId) {
        const query = `SELECT 1 FROM favorites WHERE user_id = $1 AND car_id = $2`;
        const result = await pool.query(query, [userId, carId]);
        return result.rows.length > 0;
    }
}

module.exports = Favorite;