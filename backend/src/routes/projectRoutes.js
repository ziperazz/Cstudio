const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const upload = require('../middlewares/upload');
const { protectAdmin } = require('../middlewares/authMiddleware');

const multiUpload = upload.fields([
    { name: 'videos', maxCount: 2 },
    { name: 'images', maxCount: 2 }
]);

// مسیر دریافت لیست پروژه‌ها (عمومی)
router.get('/', projectController.getProjects);

// مسیر ایجاد پروژه (محافظت شده با توکن ادمین)
router.post('/', protectAdmin, multiUpload, projectController.createProject);

// مسیر حذف پروژه (محافظت شده با توکن ادمین)
router.delete('/:id', protectAdmin, projectController.deleteProject);

// روت دریافت تک‌پروژه
router.get('/:id', projectController.getProjectById);

// روت دریافت پروژه با اسلاگ
router.get('/slug/:slug', projectController.getProjectBySlug);

// مسیر ویرایش پروژه (محافظت شده با توکن ادمین + پشتیبانی از آپلود فایل)
router.put('/:id', protectAdmin, multiUpload, projectController.updateProject);

module.exports = router;