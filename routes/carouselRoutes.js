const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middlewares/adminMiddleware');
const { requireActiveJeweller } = require('../middlewares/jewellerMiddleware');
const {
  getAllCarousels,
  getAllCarouselsForAdmin,
  getCarouselById,
  createCarousel,
  updateCarousel,
  toggleStatus,
  deleteCarousel,
} = require('../controllers/carouselController');

// Admin management can include disabled items; public reads only return active items.
router.get('/manage', protectAdmin, getAllCarouselsForAdmin);
router.get('/', requireActiveJeweller, getAllCarousels);
router.get('/:id', requireActiveJeweller, getCarouselById);

// Admin mutation routes
router.post('/', protectAdmin, createCarousel);
router.put('/:id', protectAdmin, updateCarousel);
router.patch('/:id/status', protectAdmin, toggleStatus);
router.delete('/:id', protectAdmin, deleteCarousel);

module.exports = router;
