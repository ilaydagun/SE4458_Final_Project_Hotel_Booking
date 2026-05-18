const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib');
const { calculateRoomPrice } = require('../utils/roomPricing');
require('dotenv').config();

const publishToQueue = async (booking) => {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue('new_reservations', { durable: true });
    channel.sendToQueue(
      'new_reservations',
      Buffer.from(JSON.stringify(booking)),
      { persistent: true }
    );
    await channel.close();
    await conn.close();
  } catch (err) {
    console.error('RabbitMQ publish failed:', err.message);
  }
};

const createBooking = async (req, res) => {
  const { room_id, check_in, check_out, guest_count } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get user from DB
    const userResult = await client.query(
      'SELECT id, role FROM users WHERE firebase_uid = $1',
      [req.user.uid]
    );
    if (!userResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];

    // Get room and hotel price
    const roomResult = await client.query(
      `SELECT r.*, h.base_price_per_night
       FROM rooms r
       JOIN hotels h ON r.hotel_id = h.id
       WHERE r.id = $1`,
      [room_id]
    );
    if (!roomResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Room not found' });
    }
    const room = roomResult.rows[0];

    // Check availability
    const availResult = await client.query(
      `SELECT * FROM room_availability
       WHERE room_id = $1
         AND is_vacant = true
         AND available_count >= 1
         AND start_date <= $2
         AND end_date >= $3
       FOR UPDATE`,
      [room_id, check_in, check_out]
    );
    if (!availResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Room not available for selected dates' });
    }

    // Calculate price
    const nights = Math.ceil(
      (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24)
    );
    const isClient = user.role === 'client';
    const discount = isClient ? 0.15 : 0;
    const roomPricePerNight = calculateRoomPrice(room.base_price_per_night, room.room_type);
    const total_price = Number((roomPricePerNight * nights * (1 - discount)).toFixed(2));

    // Decrement available_count
    await client.query(
      `UPDATE room_availability
       SET available_count = available_count - 1,
           is_vacant = CASE WHEN available_count - 1 <= 0 THEN false ELSE true END,
           updated_at = NOW()
       WHERE room_id = $1 AND start_date <= $2 AND end_date >= $3`,
      [room_id, check_in, check_out]
    );

    // Create booking
    const bookingId = uuidv4();
    const bookingResult = await client.query(
      `INSERT INTO bookings
         (id, user_id, room_id, check_in, check_out, guest_count, total_price, discount_applied, status, booked_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'confirmed',NOW())
       RETURNING *`,
      [bookingId, user.id, room_id, check_in, check_out, guest_count, total_price, isClient]
    );

    await client.query('COMMIT');

    const booking = bookingResult.rows[0];

    // Push to RabbitMQ (non-blocking)
    publishToQueue({
      booking_id: booking.id,
      user_id: user.id,
      room_id,
      check_in,
      check_out,
      total_price,
      discount_applied: isClient
    });

    res.status(201).json(booking);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Booking failed' });
  } finally {
    client.release();
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1', [req.user.uid]
    );
    if (!userResult.rows.length) return res.status(404).json({ error: 'User not found' });

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT b.*, r.room_type, h.name as hotel_name, h.city
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       JOIN hotels h ON r.hotel_id = h.id
       WHERE b.user_id = $1
       ORDER BY b.booked_at DESC
       LIMIT $2 OFFSET $3`,
      [userResult.rows[0].id, limit, offset]
    );

    res.json({
      data: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const getBookingById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, r.room_type, h.name as hotel_name, h.city
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       JOIN hotels h ON r.hotel_id = h.id
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Booking not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById };
