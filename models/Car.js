const pool = require('../config/db');

class Car {
    static async create({ userId, brand, model, year, price, mileage, description }) {
        const query = `
            INSERT INTO cars (user_id, brand, model, year, price, mileage, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const result = await pool.query(query, [userId, brand, model, year, price, mileage, description]);
        return result.rows[0];
    }

    static async findAll(filters = {}) {
        let query = `
            SELECT c.*, u.name as owner_name, u.avatar_url as owner_avatar,
                   (SELECT photo_url FROM car_photos WHERE car_id = c.id AND is_main = TRUE LIMIT 1) as main_photo
            FROM cars c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = 'active'
        `;
        const values = [];
        let paramCount = 1;
        
        if (filters.brand) {
            query += ` AND c.brand ILIKE $${paramCount}`;
            values.push(`%${filters.brand}%`);
            paramCount++;
        }
        if (filters.model) {
            query += ` AND c.model ILIKE $${paramCount}`;
            values.push(`%${filters.model}%`);
            paramCount++;
        }
        if (filters.priceFrom) {
            query += ` AND c.price >= $${paramCount}`;
            values.push(filters.priceFrom);
            paramCount++;
        }
        if (filters.priceTo) {
            query += ` AND c.price <= $${paramCount}`;
            values.push(filters.priceTo);
            paramCount++;
        }
        
        query += ` ORDER BY c.created_at DESC`;
        
        const result = await pool.query(query, values);
        return result.rows;
    }

    static async findById(id) {
        const query = `
            SELECT c.*, u.name as owner_name, u.avatar_url as owner_avatar, u.role_id
            FROM cars c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findByUser(userId) {
        const query = `
            SELECT * FROM cars 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async update(id, userId, data) {
        const { brand, model, year, price, mileage, description } = data;
        const query = `
            UPDATE cars 
            SET brand = $1, model = $2, year = $3, price = $4, mileage = $5, description = $6, updated_at = CURRENT_TIMESTAMP
            WHERE id = $7 AND user_id = $8
            RETURNING *
        `;
        const result = await pool.query(query, [brand, model, year, price, mileage, description, id, userId]);
        return result.rows[0];
    }

    static async delete(id, userId) {
        const query = `DELETE FROM cars WHERE id = $1 AND user_id = $2 RETURNING id`;
        const result = await pool.query(query, [id, userId]);
        return result.rows[0];
    }

    // Админ может удалить любое объявление
    static async adminDelete(id) {
        const query = `DELETE FROM cars WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async addPhoto(carId, photoUrl, isMain = false) {
        const query = `
            INSERT INTO car_photos (car_id, photo_url, is_main)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await pool.query(query, [carId, photoUrl, isMain]);
        return result.rows[0];
    }
}

module.exports = Car;