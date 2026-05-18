const pool = require('../config/db');
const redis = require('redis');
const { calculateRoomPrice } = require('../utils/roomPricing');
require('dotenv').config();

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

const searchHotels = async (req, res) => {
  const { city, check_in, check_out, guests, page = 1, limit = 10 } = req.query;

  if (!city || !check_in || !check_out || !guests) {
    return res.status(400).json({ error: 'city, check_in, check_out and guests are required' });
  }

  const offset = (page - 1) * limit;
  const cacheKey = `search:${city}:${check_in}:${check_out}:${guests}:${page}:${limit}`;

  try {
    // Check Redis cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ ...JSON.parse(cached), fromCache: true });
    }

    const result = await pool.query(
      `SELECT
        h.id,
        h.name,
        h.city,
        h.address,
        h.latitude,
        h.longitude,
        h.image_url,
        h.base_price_per_night,
        r.id as room_id,
        r.room_type,
        ra.available_count,
        ra.start_date,
        ra.end_date
       FROM hotels h
       JOIN rooms r ON r.hotel_id = h.id
       JOIN room_availability ra ON ra.room_id = r.id
       WHERE
         LOWER(h.city) = LOWER($1)
         AND ra.is_vacant = true
         AND ra.available_count >= 1
         AND ra.start_date <= $2
         AND ra.end_date >= $3
       ORDER BY h.base_price_per_night ASC
       LIMIT $4 OFFSET $5`,
      [city, check_in, check_out, limit, offset]
    );

    const count = await pool.query(
      `SELECT COUNT(*) FROM hotels h
       JOIN rooms r ON r.hotel_id = h.id
       JOIN room_availability ra ON ra.room_id = r.id
       WHERE
         LOWER(h.city) = LOWER($1)
         AND ra.is_vacant = true
         AND ra.available_count >= 1
         AND ra.start_date <= $2
         AND ra.end_date >= $3`,
      [city, check_in, check_out]
    );

    const pricedRows = result.rows.map(row => ({
      ...row,
      price_per_night: calculateRoomPrice(row.base_price_per_night, row.room_type)
    }));

    const response = {
      data: pricedRows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
};

module.exports = { searchHotels };
