const express = require('express');
const {
  registerMasterAdmin,
  loginMasterAdmin,
  createMasterAdmin,
} = require('../controllers/masterAdminController');
const { protectMasterAdmin } = require('../middlewares/masterAdminMiddleware');

const router = express.Router();

// Public only for the first master-admin setup and login.
router.post('/register', registerMasterAdmin);
router.post('/login', loginMasterAdmin);
router.post('/admins', protectMasterAdmin, createMasterAdmin);

module.exports = router;
