const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    database: process.env.DB_NAME || 'autosale',
});

async function createAdmin() {
    try {
        // Проверяем, существует ли администратор
        const checkResult = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            ['admin@example.com']
        );
        
        if (checkResult.rows.length > 0) {
            console.log('ℹ️ Администратор уже существует');
            return;
        }
        
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Получаем ID роли администратора
        const roleResult = await pool.query(
            "SELECT id FROM roles WHERE name = 'admin'"
        );
        const adminRoleId = roleResult.rows[0]?.id || 2;
        
        // Создаём администратора
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role_id, avatar_url, created_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
            ['Администратор', 'admin@example.com', hashedPassword, adminRoleId, '/uploads/avatars/default.png']
        );
        
        console.log('✅ Администратор создан:');
        console.log('   📧 Email: admin@example.com');
        console.log('   🔑 Пароль: admin123');
        console.log('   👑 Роль: администратор');
        
    } catch (error) {
        console.error('❌ Ошибка создания администратора:', error.message);
    } finally {
        await pool.end();
    }
}

createAdmin();