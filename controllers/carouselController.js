const Carousel = require('../models/Carousel');

// @desc    Get all carousels (with optional position filter)
// @route   GET /api/v1/carousels
// @access  Public
exports.getAllCarousels = async (req, res, next) => {
  try {
    const { position, status } = req.query;
    const filter = {};

    if (position && position !== 'All') {
      filter.position = position;
    }

    if (status !== undefined) {
      filter.status = status === 'true' || status === true;
    }

    const carousels = await Carousel.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: carousels.length,
      data: carousels,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get single carousel by ID
// @route   GET /api/v1/carousels/:id
// @access  Public
exports.getCarouselById = async (req, res, next) => {
  try {
    const carousel = await Carousel.findById(req.params.id);

    if (!carousel) {
      return res.status(404).json({
        success: false,
        message: 'Carousel item not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: carousel,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Create new carousel item
// @route   POST /api/v1/carousels
// @access  Private/Admin
exports.createCarousel = async (req, res, next) => {
  try {
    const { name, position, type, layoutStyle, dimensions, aspectRatio, image, status } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: 'Carousel name and image URL are required',
      });
    }

    const allowedPositions = ['Home Top', 'Home Middle', 'Home Bottom', 'SIP Main'];
    const validPosition = allowedPositions.includes(position) ? position : 'Home Top';

    const carousel = await Carousel.create({
      name,
      position: validPosition,
      type: type || 'Horizontal',
      layoutStyle: layoutStyle || 'Without Container (Full-Width)',
      dimensions: dimensions || '1920 x 1080',
      aspectRatio: aspectRatio || '16:9',
      image,
      status: status !== undefined ? String(status) === 'true' || status === true : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Carousel item created successfully',
      data: carousel,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update carousel item
// @route   PUT /api/v1/carousels/:id
// @access  Private/Admin
exports.updateCarousel = async (req, res, next) => {
  try {
    const { name, position, type, layoutStyle, dimensions, aspectRatio, image, status } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (position !== undefined) {
      const allowedPositions = ['Home Top', 'Home Middle', 'Home Bottom', 'SIP Main'];
      if (allowedPositions.includes(position)) {
        updateData.position = position;
      }
    }
    if (type !== undefined) updateData.type = type;
    if (layoutStyle !== undefined) updateData.layoutStyle = layoutStyle;
    if (dimensions !== undefined) updateData.dimensions = dimensions;
    if (aspectRatio !== undefined) updateData.aspectRatio = aspectRatio;
    if (image !== undefined) updateData.image = image;
    if (status !== undefined) updateData.status = String(status) === 'true' || status === true;

    const carousel = await Carousel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!carousel) {
      return res.status(404).json({
        success: false,
        message: 'Carousel item not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Carousel item updated successfully',
      data: carousel,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Toggle carousel active status
// @route   PATCH /api/v1/carousels/:id/status
// @access  Private/Admin
exports.toggleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Status boolean is required',
      });
    }

    const newStatus = String(status) === 'true' || status === true;
    const carousel = await Carousel.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true }
    );

    if (!carousel) {
      return res.status(404).json({
        success: false,
        message: 'Carousel item not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Carousel item ${newStatus ? 'enabled' : 'disabled'} successfully`,
      data: carousel,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete carousel item
// @route   DELETE /api/v1/carousels/:id
// @access  Private/Admin
exports.deleteCarousel = async (req, res, next) => {
  try {
    const carousel = await Carousel.findByIdAndDelete(req.params.id);

    if (!carousel) {
      return res.status(404).json({
        success: false,
        message: 'Carousel item not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Carousel item deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};
