const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const setAvailability = async (req, res) => {
  const { room_id, start_date, end_date, available_count, is_vacant } = req.body;
  try {
    // Check if availability already exists for this room and date range
    const existing = await pool.query(
      `SELECT id FROM room_availability
       WHERE room_id = $1 AND start_date = $2 AND end_date = $3`,
      [room_id, start_date, end_date]
    );

    let result;
    if (existing.rows.length) {
      // Update existing
      result = await pool.query(
        `UPDATE room_availability
         SET available_count=$1, is_vacant=$2, updated_at=NOW()
         WHERE room_id=$3 AND start_date=$4 AND end_date=$5
         RETURNING *`,
        [available_count, is_vacant, room_id, start_date, end_date]
      );
    } else {
      // Insert new
      result = await pool.query(
        `INSERT INTO room_availability (id, room_id, start_date, end_date, available_count, is_vacant, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *`,
        [uuidv4(), room_id, start_date, end_date, available_count, is_vacant]
      );
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to set availability' });
  }
};

const getAvailabilityByRoom = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM room_availability
       WHERE room_id = $1
       ORDER BY start_date ASC`,
      [req.params.roomId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

const getAvailabilityByHotel = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ra.*, r.room_type, r.total_count
       FROM room_availability ra
       JOIN rooms r ON ra.room_id = r.id
       WHERE r.hotel_id = $1
       ORDER BY ra.start_date ASC`,
      [req.params.hotelId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

module.exports = { setAvailability, getAvailabilityByRoom, getAvailabilityByHotel };