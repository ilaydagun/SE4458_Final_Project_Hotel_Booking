const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const hotelRoutes = require('./routes/hotels');
const roomRoutes = require('./routes/rooms');
const availabilityRoutes = require('./routes/availability');
const searchRoutes = require('./routes/search');
const bookingRoutes = require('./routes/bookings');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/availability', availabilityRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'hotel-service' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Hotel service running on port ${PORT}`));