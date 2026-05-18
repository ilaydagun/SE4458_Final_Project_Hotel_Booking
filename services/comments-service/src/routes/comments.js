const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createComment,
  getCommentsByHotel
} = require('../controllers/commentController');

router.get('/:hotelId', getCommentsByHotel);
router.post('/', authenticate, createComment);

module.exports = router;