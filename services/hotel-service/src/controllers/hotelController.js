const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createHotel = async (req, res) => {
  const { name, city, address, latitude, longitude, base_price_per_night, image_url } = req.body;
  try {
    const adminResult = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1', [req.user.uid]
    );
    const admin_user_id = adminResult.rows[0].id;
    const result = await pool.query(
      `INSERT INTO hotels (id, admin_user_id, name, city, address, latitude, longitude, base_price_per_night, image_url, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
      [uuidv4(), admin_user_id, name, city, address, latitude, longitude, base_price_per_night, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
};

const getHotels = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const result = await pool.query(
      'SELECT * FROM hotels ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    const count = await pool.query('SELECT COUNT(*) FROM hotels');
    res.json({
      data: result.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
};

const getHotelById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hotels WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Hotel not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
};

const updateHotel = async (req, res) => {
  const { name, city, address, latitude, longitude, base_price_per_night, image_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE hotels SET name=$1, city=$2, address=$3, latitude=$4, longitude=$5,
       base_price_per_night=$6, image_url=$7 WHERE id=$8 RETURNING *`,
      [name, city, address, latitude, longitude, base_price_per_night, image_url, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Hotel not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
};

const deleteHotel = async (req, res) => {
  try {
    await pool.query('DELETE FROM hotels WHERE id = $1', [req.params.id]);
    res.json({ message: 'Hotel deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
};

module.exports = { createHotel, getHotels, getHotelById, updateHotel, deleteHotel };