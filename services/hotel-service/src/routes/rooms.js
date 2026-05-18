const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  createRoom,
  getRoomsByHotel,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

router.get('/hotel/:hotelId', getRoomsByHotel);
router.post('/', authenticate, requireAdmin, createRoom);
router.put('/:id', authenticate, requireAdmin, updateRoom);
router.delete('/:id', authenticate, requireAdmin, deleteRoom);

module.exports = router;