const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// 👇 اینجا هم نگهبان رو به protectAdmin آپدیت کردیم
const { protectAdmin } = require('../middlewares/authMiddleware');

// مسیر دریافت لیست کاربران (محافظت شده با توکن ادمین)
router.get('/', protectAdmin, userController.getUsers);

// مسیر ایجاد کاربر جدید (محافظت شده با توکن ادمین)
router.post('/', protectAdmin, userController.createUser);

// مسیر حذف کاربر (محافظت شده با توکن ادمین)
router.delete('/:id', protectAdmin, userController.deleteUser);
// مسیر تغییر رمز عبور کاربر (محافظت شده با توکن ادمین)
router.put('/:id/password', protectAdmin, userController.updateUserPassword);

module.exports = router;