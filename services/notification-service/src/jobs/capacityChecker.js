const pool = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const checkCapacity = async () => {
  try {
    // Find hotels where any room type has less than 20% availability for next month
    const nextMonthStart = new Date();
    nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);
    nextMonthStart.setDate(1);

    const nextMonthEnd = new Date(nextMonthStart);
    nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 1);
    nextMonthEnd.setDate(0);

    const result = await pool.query(
      `SELECT
        h.id as hotel_id,
        h.name as hotel_name,
        u.email as admin_email,
        r.room_type,
        r.total_count,
        ra.available_count,
        ROUND((ra.available_count::decimal / r.total_count) * 100, 2) as availability_pct
       FROM hotels h
       JOIN users u ON h.admin_user_id = u.id
       JOIN rooms r ON r.hotel_id = h.id
       JOIN room_availability ra ON ra.room_id = r.id
       WHERE
         ra.start_date >= $1
         AND ra.end_date <= $2
         AND (ra.available_count::decimal / r.total_count) < 0.20`,
      [nextMonthStart.toISOString().split('T')[0], nextMonthEnd.toISOString().split('T')[0]]
    );

    for (const row of result.rows) {
      console.log(`Low capacity alert: ${row.hotel_name} - ${row.room_type} at ${row.availability_pct}%`);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: row.admin_email,
        subject: `Low capacity alert: ${row.hotel_name}`,
        text: `Your hotel "${row.hotel_name}" has low availability for ${row.room_type} rooms next month. Current availability: ${row.availability_pct}% (${row.available_count}/${row.total_count} rooms available).`
      });
    }

    console.log(`Capacity check done. ${result.rows.length} alerts sent.`);
  } catch (err) {
    console.error('Capacity check failed:', err);
  }
};

module.exports = { checkCapacity };