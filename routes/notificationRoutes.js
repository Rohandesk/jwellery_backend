const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');
const { requireActiveJeweller } = require('../middlewares/jewellerMiddleware');

router.get('/', protect, requireActiveJeweller, getNotifications);
router.put('/:id/read', protect, requireActiveJeweller, markAsRead);

module.exports = router;
