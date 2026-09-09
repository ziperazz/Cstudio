const express = require('express');
const router = express.Router();
const {
    submitOrder,
    getOrders,
    markAsRead,
    deleteOrder
} = require('../controllers/orderController');

const { protectAdmin } = require('../middlewares/authMiddleware');


router.post('/', submitOrder);
router.get('/', protectAdmin, getOrders);
router.patch('/:id/read', protectAdmin, markAsRead);
router.delete('/:id', protectAdmin, deleteOrder);

module.exports = router;