const express = require('express');
const { getActiveJewellers } = require('../controllers/jewellerController');

const router = express.Router();

router.get('/', getActiveJewellers);

module.exports = router;
