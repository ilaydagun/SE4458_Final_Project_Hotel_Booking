const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const commentRoutes = require('./routes/comments');

const app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/comments', commentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'comments-service' }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Comments service running on port ${PORT}`));