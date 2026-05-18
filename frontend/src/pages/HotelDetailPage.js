import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getHotelById, createBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import CommentSection from '../components/CommentSection';

export default function HotelDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const checkIn = searchParams.get('check_in');
  const checkOut = searchParams.get('check_out');
  const guests = searchParams.get('guests');
  const selectedRoomType = searchParams.get('room_type');
  const selectedRoomPrice = searchParams.get('price_per_night');

  useEffect(() => {
    getHotelById(id)
      .then(res => setHotel(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
    : 1;

  const price = Number(selectedRoomPrice || hotel?.base_price_per_night || 0);
  const discountedPrice = user ? (price * 0.85).toFixed(2) : price;
  const totalPrice = (discountedPrice * nights).toFixed(2);

  const handleBooking = async (roomId) => {
    if (!user) {
      toast.error('Please login to book');
      return;
    }
    setBooking(true);
    try {
      await createBooking({
        room_id: roomId,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: parseInt(guests) || 1
      });
      toast.success('Booking confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="page-shell narrow"><p className="loading-state">Loading...</p></div>;
  if (!hotel) return <div className="page-shell narrow"><p className="empty-state">Hotel not found</p></div>;

  return (
    <div className="page-shell narrow">
      <section className="detail-hero">
        {hotel.image_url && (
          <img src={hotel.image_url} alt={hotel.name} />
        )}
        <div className="detail-heading">
          <p className="eyebrow">{hotel.city}</p>
          <h1>{hotel.name}</h1>
          <p className="muted">{hotel.address}, {hotel.city}</p>
        </div>
      </section>

      <div className="panel booking-panel" style={{ marginTop: 24, marginBottom: 24 }}>
        <h2 className="section-title">Booking Details</h2>
        {checkIn && checkOut ? (
          <>
            <div className="booking-facts">
              <div className="fact"><span>Check-in</span><strong>{checkIn}</strong></div>
              <div className="fact"><span>Check-out</span><strong>{checkOut}</strong></div>
              <div className="fact"><span>Nights</span><strong>{nights}</strong></div>
              <div className="fact"><span>Guests</span><strong>{guests}</strong></div>
              {selectedRoomType && (
                <div className="fact"><span>Room</span><strong>{selectedRoomType}</strong></div>
              )}
              <div className="fact"><span>Nightly price</span><strong>${price.toFixed(2)}</strong></div>
            </div>
            {user && (
              <span className="badge">
                Member price: 15% off
              </span>
            )}
            <p className="price" style={{ marginTop: 14 }}>
              Total: ${totalPrice}
            </p>
            <button
              onClick={() => handleBooking(searchParams.get('room_id') || id)}
              disabled={booking || !user}
              className="btn btn-primary"
            >
              {booking ? 'Booking...' : user ? 'Reserve Now' : 'Login to Book'}
            </button>
          </>
        ) : (
          <p>Go back and select dates to book this hotel.</p>
        )}
      </div>

      <CommentSection hotelId={id} />
    </div>
  );
}
