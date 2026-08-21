const express = require('express');
const router = express.Router();
const { createFolder, getAllFolders, getMyFolders } = require('../controllers/clientFolderController');

// وارد کردن دو تا نگهبانی که ساختیم
const { protectAdmin, protectClient } = require('../middlewares/authMiddleware');

// ==========================================
// 👤 مسیر مخصوص مشتری (فقط مشتری با نگهبان خودش میتونه وارد شه)
// ==========================================
router.get('/my-folders', protectClient, getMyFolders);

// ==========================================
// 🛠️ مسیرهای مخصوص تو / ادمین کل (با نگهبان ادمین محافظت میشه)
// ==========================================
router.post('/', protectAdmin, createFolder);      // ساخت فولدر جدید
router.get('/all', protectAdmin, getAllFolders);   // دیدن همه فولدرهای همه مشتری‌ها

module.exports = router;