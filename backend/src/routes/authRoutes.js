const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.loginAdmin);
router.post('/setup-admin', authController.registerFirstAdmin);
router.post('/client/login', authController.loginClient);

module.exports = router;