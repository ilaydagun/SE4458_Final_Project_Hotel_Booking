const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelController');

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/', authenticate, requireAdmin, createHotel);
router.put('/:id', authenticate, requireAdmin, updateHotel);
router.delete('/:id', authenticate, requireAdmin, deleteHotel);

module.exports = router;