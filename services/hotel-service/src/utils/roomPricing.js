const ROOM_TYPE_MULTIPLIERS = {
  standard: 1,
  aile: 1.25,
  family: 1.25,
  deluxe: 1.4,
  suite: 1.6
};

const getRoomTypeMultiplier = (roomType = '') => {
  const normalizedType = roomType.toString().trim().toLowerCase();
  return ROOM_TYPE_MULTIPLIERS[normalizedType] || ROOM_TYPE_MULTIPLIERS.standard;
};

const calculateRoomPrice = (basePrice, roomType) => {
  const numericBasePrice = Number(basePrice) || 0;
  const multiplier = getRoomTypeMultiplier(roomType);
  return Number((numericBasePrice * multiplier).toFixed(2));
};

module.exports = {
  ROOM_TYPE_MULTIPLIERS,
  calculateRoomPrice,
  getRoomTypeMultiplier
};
