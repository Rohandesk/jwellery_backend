const express = require('express');
const {
  registerMasterAdmin,
  loginMasterAdmin,
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
} = require('../controllers/masterAdminController');
const { protectMasterAdmin } = require('../middlewares/masterAdminMiddleware');

const router = express.Router();

// Public only for the first master-admin setup and login.
router.post('/register', registerMasterAdmin);
router.post('/login', loginMasterAdmin);
router.route('/admins')
  .get(protectMasterAdmin, getAdmins)
  .post(protectMasterAdmin, createAdmin);
router.route('/admins/:id')
  .get(protectMasterAdmin, getAdmin)
  .patch(protectMasterAdmin, updateAdmin)
  .delete(protectMasterAdmin, deleteAdmin);

module.exports = router;
