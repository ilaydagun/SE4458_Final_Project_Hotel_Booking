import React, { useEffect, useState } from 'react';
import { getHotels, createHotel, createRoom, setAvailability, getRoomsByHotel } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('hotels');

  const [hotelForm, setHotelForm] = useState({
    name: '', city: '', address: '', latitude: '', longitude: '', base_price_per_night: ''
  });

  const [roomForm, setRoomForm] = useState({
    hotel_id: '', room_type: 'Standard', total_count: 1
  });

  const [availForm, setAvailForm] = useState({
    room_id: '', start_date: '', end_date: '', available_count: 1, is_vacant: true
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getHotels().then(res => setHotels(res.data.data)).catch(console.error);
  }, [user, navigate]);

  useEffect(() => {
    if (selectedHotel) {
      getRoomsByHotel(selectedHotel).then(res => setRooms(res.data.data)).catch(console.error);
    }
  }, [selectedHotel]);

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      await createHotel(hotelForm);
      toast.success('Hotel created!');
      getHotels().then(res => setHotels(res.data.data));
      setHotelForm({ name: '', city: '', address: '', latitude: '', longitude: '', base_price_per_night: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create hotel');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await createRoom(roomForm);
      toast.success('Room created!');
      if (selectedHotel) getRoomsByHotel(selectedHotel).then(res => setRooms(res.data.data));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create room');
    }
  };

  const handleSetAvailability = async (e) => {
    e.preventDefault();
    try {
      await setAvailability(availForm);
      toast.success('Availability updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to set availability');
    }
  };

  return (
    <div className="page-shell narrow">
      <p className="eyebrow">Operations</p>
      <h1 className="section-title">Admin Panel</h1>
      <p className="muted">Manage hotels, rooms, and room availability from one focused workspace.</p>

      <div className="admin-tabs">
        {['hotels', 'rooms', 'availability'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`btn ${activeTab === tab ? 'btn-primary' : ''}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'hotels' && (
        <div className="admin-layout">
          <div className="panel admin-card">
            <h2 style={{ marginTop: 0 }}>Create Hotel</h2>
            <form onSubmit={handleCreateHotel} className="form-grid">
              {['name', 'city', 'address', 'latitude', 'longitude', 'base_price_per_night'].map(field => (
                <input key={field} placeholder={field.replace(/_/g, ' ')}
                  value={hotelForm[field]}
                  onChange={e => setHotelForm({ ...hotelForm, [field]: e.target.value })}
                  required className="input" />
              ))}
              <button type="submit" className="btn btn-primary">Create Hotel</button>
            </form>
          </div>

          <div className="panel admin-card">
            <h2 style={{ marginTop: 0 }}>Your Hotels</h2>
            <div className="admin-list">
              {hotels.map(h => (
                <div key={h.id} className="admin-list-item">
                  <strong>{h.name}</strong>
                  <span className="muted">{h.city} - ${h.base_price_per_night}/night</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="panel admin-card">
          <h2 style={{ marginTop: 0 }}>Create Room</h2>
          <form onSubmit={handleCreateRoom} className="form-grid">
            <select value={roomForm.hotel_id}
              onChange={e => { setRoomForm({ ...roomForm, hotel_id: e.target.value }); setSelectedHotel(e.target.value); }}
              required className="select">
              <option value="">Select Hotel</option>
              {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <select value={roomForm.room_type}
              onChange={e => setRoomForm({ ...roomForm, room_type: e.target.value })}
              className="select">
              {['Standard', 'Aile', 'Suite', 'Deluxe'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input type="number" min={1} placeholder="Total room count"
              value={roomForm.total_count}
              onChange={e => setRoomForm({ ...roomForm, total_count: parseInt(e.target.value) })}
              required className="input" />
            <button type="submit" className="btn btn-primary">Create Room</button>
          </form>
        </div>
      )}

      {activeTab === 'availability' && (
        <div className="panel admin-card">
          <h2 style={{ marginTop: 0 }}>Set Availability</h2>
          <form onSubmit={handleSetAvailability} className="form-grid">
            <select value={selectedHotel || ''}
              onChange={e => setSelectedHotel(e.target.value)}
              className="select">
              <option value="">Select Hotel</option>
              {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <select value={availForm.room_id}
              onChange={e => setAvailForm({ ...availForm, room_id: e.target.value })}
              required className="select">
              <option value="">Select Room</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.room_type} ({r.total_count} rooms) - ${r.price_per_night || r.base_price_per_night}/night
                </option>
              ))}
            </select>
            <input type="date" placeholder="Start date"
              value={availForm.start_date}
              onChange={e => setAvailForm({ ...availForm, start_date: e.target.value })}
              required className="input" />
            <input type="date" placeholder="End date"
              value={availForm.end_date}
              onChange={e => setAvailForm({ ...availForm, end_date: e.target.value })}
              required className="input" />
            <input type="number" min={0} placeholder="Available room count"
              value={availForm.available_count}
              onChange={e => setAvailForm({ ...availForm, available_count: parseInt(e.target.value) })}
              required className="input" />
            <label className="field-label">
              <input type="checkbox" checked={availForm.is_vacant}
                onChange={e => setAvailForm({ ...availForm, is_vacant: e.target.checked })} />
              {' '}Vacant (available for booking)
            </label>
            <button type="submit" className="btn btn-primary">Update Availability</button>
          </form>
        </div>
      )}
    </div>
  );
}
