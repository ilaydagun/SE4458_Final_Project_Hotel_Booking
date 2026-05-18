import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HotelCard({ hotel, searchParams }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const price = Number(hotel.price_per_night || hotel.base_price_per_night);
  const discountedPrice = user ? (price * 0.85).toFixed(2) : null;

  const handleClick = () => {
    const p = searchParams ? { ...searchParams } : {};
    if (hotel.room_id) p.room_id = hotel.room_id;
    if (hotel.price_per_night) p.price_per_night = hotel.price_per_night;
    if (hotel.room_type) p.room_type = hotel.room_type;
    const params = Object.keys(p).length ? `?${new URLSearchParams(p).toString()}` : '';
    navigate(`/hotel/${hotel.id}${params}`);
  };

  return (
    <div onClick={handleClick} className="hotel-card">
      {hotel.image_url && (
        <img src={hotel.image_url} alt={hotel.name} />
      )}
      <div className="hotel-card-body">
        <h3>{hotel.name}</h3>
        <p className="muted" style={{ margin: '0 0 8px' }}>{hotel.city}</p>
        {hotel.room_type && (
          <span className="badge">Room: {hotel.room_type}</span>
        )}
        <div className="price-row">
          {discountedPrice ? (
            <>
              <span className="old-price">
                ${price}/night
              </span>
              <span className="price">
                ${discountedPrice}/night
              </span>
              <span className="badge">
                15% OFF
              </span>
            </>
          ) : (
            <span className="price">${price}/night</span>
          )}
        </div>
      </div>
    </div>
  );
}
