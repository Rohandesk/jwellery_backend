const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      enum: ['Home Top', 'Home Middle', 'Home Bottom', 'SIP Main'],
      default: 'Home Top',
    },
    type: {
      type: String,
      enum: ['Horizontal', 'Vertical'],
      default: 'Horizontal',
    },
    layoutStyle: {
      type: String,
      enum: [
        'Without Container (Full-Width)',
        'With Container (Boxed)',
        'Without Container (Full-Height)',
        'With Container (Sidebar/Card)',
      ],
      default: 'Without Container (Full-Width)',
    },
    dimensions: {
      type: String,
      default: '1920 x 1080',
    },
    aspectRatio: {
      type: String,
      default: '16:9',
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Carousel', carouselSchema);
