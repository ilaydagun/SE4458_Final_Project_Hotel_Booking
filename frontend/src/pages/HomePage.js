import React from 'react';
import SearchBar from '../components/SearchBar';

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.8)' }}>HotelHive</p>
          <h1>Find Your Perfect Hotel</h1>
          <p>
            Search stays by city, dates, and guests with member pricing ready when you sign in.
          </p>
          <div className="hero-search">
            <SearchBar />
          </div>
        </div>
      </section>
      <div className="page-shell">
        <p className="eyebrow">Quick start</p>
        <h2 className="section-title">Plan the stay, compare rooms, reserve faster.</h2>
        <p className="muted" style={{ maxWidth: 680 }}>
          Use the search above to discover available hotels, view them on a map, and open each listing for booking details and guest reviews.
        </p>
        <div className="home-highlights">
          <div className="feature-tile">
            <span>01</span>
            <strong>Search by dates</strong>
            <p>Find available rooms with city, guest count, and stay duration in one pass.</p>
          </div>
          <div className="feature-tile">
            <span>02</span>
            <strong>Compare visually</strong>
            <p>Scan hotel cards, prices, locations, and member discounts without losing context.</p>
          </div>
          <div className="feature-tile">
            <span>03</span>
            <strong>Reserve with confidence</strong>
            <p>Review booking details, guest feedback, and ratings before committing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
