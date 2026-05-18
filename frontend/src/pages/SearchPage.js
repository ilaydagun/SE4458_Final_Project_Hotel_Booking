import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { searchHotels } from '../services/api';
import HotelCard from '../components/HotelCard';
import SearchBar from '../components/SearchBar';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showMap, setShowMap] = useState(false);

  const params = useMemo(() => ({
    city: searchParams.get('city'),
    check_in: searchParams.get('check_in'),
    check_out: searchParams.get('check_out'),
    guests: searchParams.get('guests'),
    page,
    limit: 10
  }), [searchParams, page]);

  useEffect(() => {
    if (!params.city) return;
    setLoading(true);
    searchHotels(params)
      .then(res => {
        setHotels(res.data.data);
        setTotal(res.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params]);

  const validHotels = hotels.filter(h => h.latitude && h.longitude);
  const mapCenter = validHotels.length
    ? [validHotels[0].latitude, validHotels[0].longitude]
    : [41.0082, 28.9784];

  return (
    <div className="page-shell">
      <div>
        <SearchBar />
      </div>
      <div className="results-header">
        <div>
          <p className="eyebrow">Search results</p>
          <h1 className="section-title">{total} hotels found in <strong>{params.city}</strong></h1>
        </div>
        <button onClick={() => setShowMap(!showMap)} className="btn btn-primary">
          {showMap ? 'Hide Map' : 'Show on Map'}
        </button>
      </div>

      {showMap && validHotels.length > 0 && (
        <div className="map-panel">
          <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {validHotels.map(hotel => (
              <Marker key={hotel.id} position={[hotel.latitude, hotel.longitude]}>
                <Popup>
                  <strong>{hotel.name}</strong><br />
                  ${hotel.price_per_night || hotel.base_price_per_night}/night
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {loading ? (
        <p className="loading-state">Searching...</p>
      ) : hotels.length === 0 ? (
        <p className="empty-state">No hotels found for your search criteria.</p>
      ) : (
        <div className="hotel-grid">
          {hotels.map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} searchParams={params} />
          ))}
        </div>
      )}

      {total > 10 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="btn">Previous</button>
          <span className="btn" style={{ cursor: 'default' }}>Page {page}</span>
          <button disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)}
            className="btn">Next</button>
        </div>
      )}
    </div>
  );
}
