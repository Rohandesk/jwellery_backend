const express = require('express');
const {
  registerMasterAdmin,
  loginMasterAdmin,
  createMasterAdmin,
  getMasterAdmin,
  updateMasterAdmin,
  deleteMasterAdmin,
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
} = require('../controllers/masterAdminController');
const {
  protectMasterAdmin,
  protectOwnMasterAdmin,
} = require('../middlewares/masterAdminMiddleware');
const {
  createJeweller,
  getJewellers,
  getJeweller,
  updateJeweller,
  deleteJeweller,
} = require('../controllers/jewellerController');

const router = express.Router();

// Public only for the first master-admin setup and login.
router.post('/register', registerMasterAdmin);
router.post('/login', loginMasterAdmin);
router.post('/masteradmins', protectMasterAdmin, createMasterAdmin);
router.route('/masteradmins/:id')
  .all(protectMasterAdmin, protectOwnMasterAdmin)
  .get(getMasterAdmin)
  .patch(updateMasterAdmin)
  .delete(deleteMasterAdmin);
router.route('/stores')
  .get(protectMasterAdmin, getJewellers)
  .post(protectMasterAdmin, createJeweller);
router.route('/stores/:id')
  .get(protectMasterAdmin, getJeweller)
  .patch(protectMasterAdmin, updateJeweller)
  .delete(protectMasterAdmin, deleteJeweller);
router.route('/admins')
  .get(protectMasterAdmin, getAdmins)
  .post(protectMasterAdmin, createAdmin);
router.route('/admins/:id')
  .get(protectMasterAdmin, getAdmin)
  .patch(protectMasterAdmin, updateAdmin)
  .delete(protectMasterAdmin, deleteAdmin);

module.exports = router;
