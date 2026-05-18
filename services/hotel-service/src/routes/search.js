const express = require('express');
const router = express.Router();
const { searchHotels } = require('../controllers/searchController');

router.get('/', searchHotels);

module.exports = router;