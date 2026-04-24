const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');

class User {
    static async create({ name, email, password }) {
        const hashed = await hashPassword(password);
        const query = `
            INSERT INTO users (name, email, password_hash, role_id)
            VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'user'))
            RETURNING id, name, email, role_id, created_at
        `;
        const result = await pool.query(query, [name, email, hashed]);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const query = `
            SELECT u.*, r.name as role_name 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `
            SELECT u.*, r.name as role_name 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findAll() {
        const query = `
            SELECT u.id, u.name, u.email, u.avatar_url, u.is_blocked, u.created_at, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await comparePassword(plainPassword, hashedPassword);
    }

    static async updateAvatar(userId, avatarPath) {
        const query = `UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING avatar_url, id`;
        const result = await pool.query(query, [avatarPath, userId]);
        return result.rows[0];
    }

    static async blockUser(userId) {
        const query = `UPDATE users SET is_blocked = TRUE WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    static async unblockUser(userId) {
        const query = `UPDATE users SET is_blocked = FALSE WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    static async changeRole(userId, roleId) {
        const query = `UPDATE users SET role_id = $1 WHERE id = $2 RETURNING id`;
        const result = await pool.query(query, [roleId, userId]);
        return result.rows[0];
    }
}

module.exports = User;