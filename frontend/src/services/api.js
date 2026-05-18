import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_GATEWAY_URL
});

API.interceptors.request.use(async (config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const searchHotels = (params) => API.get('/api/v1/search', { params });
export const getHotels = (params) => API.get('/api/v1/hotels', { params });
export const getHotelById = (id) => API.get(`/api/v1/hotels/${id}`);
export const createHotel = (data) => API.post('/api/v1/hotels', data);
export const updateHotel = (id, data) => API.put(`/api/v1/hotels/${id}`, data);

export const getRoomsByHotel = (hotelId) => API.get(`/api/v1/rooms/hotel/${hotelId}`);
export const createRoom = (data) => API.post('/api/v1/rooms', data);

export const setAvailability = (data) => API.post('/api/v1/availability', data);
export const getAvailabilityByHotel = (hotelId) => API.get(`/api/v1/availability/hotel/${hotelId}`);

export const createBooking = (data) => API.post('/api/v1/bookings', data);
export const getMyBookings = () => API.get('/api/v1/bookings/my');

export const getComments = (hotelId, params) => API.get(`/api/v1/comments/${hotelId}`, { params });
export const createComment = (data) => API.post('/api/v1/comments', data);

export const agentChat = (messages) => API.post('/api/v1/agent/chat', { messages });