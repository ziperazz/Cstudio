const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protectAdmin } = require('../middlewares/authMiddleware');

// 🔒 هر دو مسیر محافظت شده با توکن ادمین هستند
router.get('/', protectAdmin, mediaController.getAllMedia);
router.delete('/:filename', protectAdmin, mediaController.deleteMedia);

module.exports = router;