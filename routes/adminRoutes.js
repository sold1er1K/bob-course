const express = require('express');
const AdminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Все маршруты требуют авторизации и прав админа
router.use(authMiddleware, adminMiddleware);

router.get('/users', AdminController.getAllUsers);
router.post('/users/:userId/block', AdminController.blockUser);
router.post('/users/:userId/unblock', AdminController.unblockUser);
router.put('/users/:userId/role', AdminController.changeRole);
router.get('/stats', AdminController.getStats);

module.exports = router;