import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?city=${city}&check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`);
  };

  return (
    <form onSubmit={handleSearch} className="search-card">
      <input
        placeholder="Where to?"
        value={city}
        onChange={e => setCity(e.target.value)}
        required
        className="input"
      />
      <input
        type="date"
        value={checkIn}
        onChange={e => setCheckIn(e.target.value)}
        required
        className="input"
      />
      <input
        type="date"
        value={checkOut}
        onChange={e => setCheckOut(e.target.value)}
        required
        className="input"
      />
      <input
        type="number"
        min={1}
        value={guests}
        onChange={e => setGuests(e.target.value)}
        placeholder="Guests"
        className="input"
      />
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
}
