const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const start = async () => {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue('new_reservations', { durable: true });
    channel.prefetch(1);

    console.log('Waiting for reservation messages...');

    channel.consume('new_reservations', async (msg) => {
      if (!msg) return;

      const booking = JSON.parse(msg.content.toString());
      console.log('New reservation received:', booking.booking_id);

      try {
        // Get user email
        const userResult = await pool.query(
          'SELECT email, name FROM users WHERE id = $1', [booking.user_id]
        );

        if (userResult.rows.length) {
          const user = userResult.rows[0];
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Booking Confirmation',
            text: `Hi ${user.name}, your booking has been confirmed!
            
Booking ID: ${booking.booking_id}
Check-in: ${booking.check_in}
Check-out: ${booking.check_out}
Total Price: $${booking.total_price}
${booking.discount_applied ? 'Member discount of 15% applied!' : ''}

Thank you for choosing us!`
          });
          console.log(`Confirmation email sent to ${user.email}`);
        }

        channel.ack(msg);
      } catch (err) {
        console.error('Failed to process reservation:', err);
        channel.nack(msg, false, true);
      }
    });
  } catch (err) {
    console.error('RabbitMQ consumer failed to start:', err.message);
    // Retry after 5 seconds
    setTimeout(start, 5000);
  }
};

module.exports = { start };