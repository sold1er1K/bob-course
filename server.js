require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Логирование всех запросов
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Маршруты
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const carRoutes = require('./routes/carRoutes');

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

app.use('/', authRoutes);
app.use('/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', carRoutes);

// Главная страница
app.get('/', (req, res) => {
    console.log('Запрос на главную страницу');
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Страница создания объявления
app.get('/create-ad', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'create-ad.html'));
});

// Страница просмотра объявления
app.get('/car/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'car.html'));
});

// Админ-панель
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Страница избранного
app.get('/favorites', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'favorites.html'));
});

// Запуск
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Главная страница: http://localhost:${PORT}/`);
    console.log(`Страница логина: http://localhost:${PORT}/login`);
    console.log(`Тестовая страница: http://localhost:${PORT}/test`);
});

// Тестовый маршрут для проверки
app.get('/test', (req, res) => {
    res.send('Сервер работает!');
});