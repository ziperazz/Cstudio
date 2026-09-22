const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protectAdmin } = require('../middlewares/authMiddleware');

router.post('/login', authController.loginAdmin);
router.post('/setup-admin', authController.registerFirstAdmin);
router.post('/client/login', authController.loginClient);

// 🔐 مسیرهای محافظت‌شده‌ی پنل ادمین
router.get('/me', protectAdmin, authController.getAdminProfile);
router.put('/change-password', protectAdmin, authController.changeAdminPassword);

module.exports = router;
