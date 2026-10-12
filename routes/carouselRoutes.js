const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middlewares/adminMiddleware');
const {
  getAllCarousels,
  getCarouselById,
  createCarousel,
  updateCarousel,
  toggleStatus,
  deleteCarousel,
} = require('../controllers/carouselController');

// Public read routes
router.get('/', getAllCarousels);
router.get('/:id', getCarouselById);

// Admin mutation routes
router.post('/', protectAdmin, createCarousel);
router.put('/:id', protectAdmin, updateCarousel);
router.patch('/:id/status', protectAdmin, toggleStatus);
router.delete('/:id', protectAdmin, deleteCarousel);

module.exports = router;
