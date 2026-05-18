const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { runAgent } = require('./agent');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.post('/api/v1/agent/chat', async (req, res) => {
  const { messages } = req.body;
  const authToken = req.headers.authorization?.split(' ')[1];

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const result = await runAgent(messages, authToken);
    res.json(result);
  } catch (err) {
    console.error('Agent error:', err);
    res.status(500).json({ error: 'Agent failed' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ai-agent' }));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`AI Agent service running on port ${PORT}`));