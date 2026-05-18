const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { calculateRoomPrice } = require('../utils/roomPricing');

const createRoom = async (req, res) => {
  const { hotel_id, room_type, total_count } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO rooms (id, hotel_id, room_type, total_count, created_at)
       VALUES ($1,$2,$3,$4,NOW()) RETURNING *`,
      [uuidv4(), hotel_id, room_type, total_count]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

const getRoomsByHotel = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, h.base_price_per_night
       FROM rooms r
       JOIN hotels h ON h.id = r.hotel_id
       WHERE r.hotel_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.hotelId]
    );
    const rooms = result.rows.map(row => ({
      ...row,
      price_per_night: calculateRoomPrice(row.base_price_per_night, row.room_type)
    }));
    res.json({ data: rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

const updateRoom = async (req, res) => {
  const { room_type, total_count } = req.body;
  try {
    const result = await pool.query(
      `UPDATE rooms SET room_type=$1, total_count=$2 WHERE id=$3 RETURNING *`,
      [room_type, total_count, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Room not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update room' });
  }
};

const deleteRoom = async (req, res) => {
  try {
    await pool.query('DELETE FROM rooms WHERE id = $1', [req.params.id]);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete room' });
  }
};

module.exports = { createRoom, getRoomsByHotel, updateRoom, deleteRoom };
