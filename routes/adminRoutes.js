const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getDashboardStats,
  updateGoldPrice,
  updateAppThemeSettings,
  broadcastNotification,
  getAllUsers,
  updateStoreCustomerStatus,
} = require('../controllers/adminController');
const { protectAdmin } = require('../middlewares/adminMiddleware');

router.post('/login', adminLogin);
router.get('/dashboard-stats', protectAdmin, getDashboardStats);
router.post('/gold-price', protectAdmin, updateGoldPrice);
router.post('/theme-settings', protectAdmin, updateAppThemeSettings);
router.post('/notifications/send', protectAdmin, broadcastNotification);
router.get('/users', protectAdmin, getAllUsers);
router.patch('/users/:id/status', protectAdmin, updateStoreCustomerStatus);

module.exports = router;
