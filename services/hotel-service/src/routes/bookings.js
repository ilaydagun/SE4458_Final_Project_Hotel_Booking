const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  getBookingById
} = require('../controllers/bookingController');

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);

module.exports = router;