const express = require('express');
const router = express.Router();
const {
    submitContact,
    getContacts,
    markAsRead,
    deleteContact
} = require('../controllers/contactController');

// مسیر ارسال پیام (استفاده شده در سایت)
router.post('/', submitContact);

// مسیرهای پنل ادمین
router.get('/', getContacts); // گرفتن لیست
router.patch('/:id/read', markAsRead); // خوانده شده
router.delete('/:id', deleteContact); // حذف

module.exports = router;