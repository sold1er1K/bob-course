const pool = require('../config/db');

class Comment {
    static async create({ carId, userId, content }) {
        const query = `
            INSERT INTO comments (car_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await pool.query(query, [carId, userId, content]);
        return result.rows[0];
    }

    static async findByCar(carId) {
        const query = `
            SELECT c.*, u.name as user_name, u.avatar_url as user_avatar, u.role_id
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.car_id = $1 AND c.status = 'active'
            ORDER BY c.created_at DESC
        `;
        const result = await pool.query(query, [carId]);
        return result.rows;
    }

    static async update(id, userId, content) {
        const query = `
            UPDATE comments 
            SET content = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND user_id = $3
            RETURNING *
        `;
        const result = await pool.query(query, [content, id, userId]);
        return result.rows[0];
    }

    static async delete(id, userId) {
        const query = `DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id`;
        const result = await pool.query(query, [id, userId]);
        return result.rows[0];
    }

    static async adminDelete(id) {
        const query = `DELETE FROM comments WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Модерация комментария (скрыть/показать)
    static async moderate(id, status) {
        const query = `UPDATE comments SET status = $1 WHERE id = $2 RETURNING id`;
        const result = await pool.query(query, [status, id]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `SELECT * FROM comments WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = Comment;