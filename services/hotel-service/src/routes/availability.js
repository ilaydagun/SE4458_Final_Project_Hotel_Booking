const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  setAvailability,
  getAvailabilityByRoom,
  getAvailabilityByHotel
} = require('../controllers/availabilityController');

router.get('/room/:roomId', getAvailabilityByRoom);
router.get('/hotel/:hotelId', getAvailabilityByHotel);
router.post('/', authenticate, requireAdmin, setAvailability);

module.exports = router;