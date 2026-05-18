const express = require('express');
const cron = require('node-cron');
require('dotenv').config();

const capacityChecker = require('./jobs/capacityChecker');
const reservationConsumer = require('./consumers/reservationConsumer');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));

// Nightly job at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running nightly capacity check...');
  capacityChecker.checkCapacity();
});

// Start RabbitMQ consumer
reservationConsumer.start();

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Notification service running on port ${PORT}`));