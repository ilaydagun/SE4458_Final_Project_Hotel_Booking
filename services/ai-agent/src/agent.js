const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
require('dotenv').config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';

const tools = [
  {
    name: 'search_hotels',
    description: 'Search for available hotels by city, dates and number of guests',
    input_schema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City to search hotels in' },
        check_in: { type: 'string', description: 'Check-in date in YYYY-MM-DD format' },
        check_out: { type: 'string', description: 'Check-out date in YYYY-MM-DD format' },
        guests: { type: 'number', description: 'Number of guests' }
      },
      required: ['city', 'check_in', 'check_out', 'guests']
    }
  },
  {
    name: 'get_hotel_details',
    description: 'Get details of a specific hotel including rooms and availability',
    input_schema: {
      type: 'object',
      properties: {
        hotel_id: { type: 'string', description: 'The hotel ID' }
      },
      required: ['hotel_id']
    }
  },
  {
    name: 'book_hotel',
    description: 'Book a hotel room for the user',
    input_schema: {
      type: 'object',
      properties: {
        room_id: { type: 'string', description: 'The room ID to book' },
        check_in: { type: 'string', description: 'Check-in date in YYYY-MM-DD format' },
        check_out: { type: 'string', description: 'Check-out date in YYYY-MM-DD format' },
        guest_count: { type: 'number', description: 'Number of guests' }
      },
      required: ['room_id', 'check_in', 'check_out', 'guest_count']
    }
  }
];

const executeToolCall = async (toolName, toolInput, authToken) => {
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  try {
    switch (toolName) {
      case 'search_hotels': {
        const { data } = await axios.get(`${GATEWAY_URL}/api/v1/search`, {
          params: toolInput,
          headers
        });
        return data;
      }
      case 'get_hotel_details': {
        const { data } = await axios.get(`${GATEWAY_URL}/api/v1/hotels/${toolInput.hotel_id}`, { headers });
        return data;
      }
      case 'book_hotel': {
        const { data } = await axios.post(`${GATEWAY_URL}/api/v1/bookings`, toolInput, { headers });
        return data;
      }
      default:
        return { error: 'Unknown tool' };
    }
  } catch (err) {
    return { error: err.response?.data || err.message };
  }
};

const runAgent = async (messages, authToken) => {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are a helpful hotel booking assistant. You help users search for hotels and make bookings.
When searching, always confirm the city, dates and number of guests with the user first.
When showing hotel results, display the hotel name, city, price per night and room type clearly.
When booking, always confirm the details with the user before making the reservation.
Today's date is ${new Date().toISOString().split('T')[0]}.`,
    messages,
    tools
  });

  // Handle tool use
  if (response.stop_reason === 'tool_use') {
    const toolUseBlock = response.content.find(b => b.type === 'tool_use');
    const toolResult = await executeToolCall(toolUseBlock.name, toolUseBlock.input, authToken);

    // Continue conversation with tool result
    const newMessages = [
      ...messages,
      { role: 'assistant', content: response.content },
      {
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolUseBlock.id,
          content: JSON.stringify(toolResult)
        }]
      }
    ];

    return runAgent(newMessages, authToken);
  }

  return {
    message: response.content.find(b => b.type === 'text')?.text || '',
    stop_reason: response.stop_reason
  };
};

module.exports = { runAgent };