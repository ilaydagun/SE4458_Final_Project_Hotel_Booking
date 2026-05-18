import React, { useCallback, useEffect, useState } from 'react';
import { getComments, createComment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function RatingControl({ label, value, onChange }) {
  const handleChange = (e) => {
    const next = parseInt(e.target.value, 10);
    if (Number.isNaN(next)) {
      onChange(0);
      return;
    }
    onChange(Math.min(10, Math.max(0, next)));
  };

  return (
    <div className="rating-control">
      <div className="rating-control-head">
        <label>{label}</label>
        <span>{value}/10</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={handleChange}
        className="rating-slider"
        aria-label={label}
        style={{ '--rating-value': `${Math.max(0, Math.min(10, value)) * 10}%` }}
      />
    </div>
  );
}

export default function CommentSection({ hotelId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [averages, setAverages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    rating_overall: 8,
    comment_text: '',
    nights_stayed: 1,
    ratings: {
      cleanliness: 8,
      staff: 8,
      facilities: 8,
      location: 8,
      eco_friendliness: 8
    }
  });

  const fetchComments = useCallback(() => {
    getComments(hotelId)
      .then(res => {
        setComments(res.data.data);
        setAverages(res.data.averages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [hotelId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to comment'); return; }
    try {
      await createComment({
        hotel_id: hotelId,
        user_name: user.email,
        ...form
      });
      toast.success('Comment added!');
      setForm({
        rating_overall: 8, comment_text: '', nights_stayed: 1,
        ratings: { cleanliness: 8, staff: 8, facilities: 8, location: 8, eco_friendliness: 8 }
      });
      fetchComments();
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const chartData = averages ? [
    { name: 'Cleanliness', value: parseFloat(averages.avg_cleanliness?.toFixed(1) || 0) },
    { name: 'Staff', value: parseFloat(averages.avg_staff?.toFixed(1) || 0) },
    { name: 'Facilities', value: parseFloat(averages.avg_facilities?.toFixed(1) || 0) },
    { name: 'Location', value: parseFloat(averages.avg_location?.toFixed(1) || 0) },
    { name: 'Eco', value: parseFloat(averages.avg_eco_friendliness?.toFixed(1) || 0) },
  ] : [];

  const ratingLabels = {
    cleanliness: 'Cleanliness',
    staff: 'Staff',
    facilities: 'Facilities',
    location: 'Location',
    eco_friendliness: 'Eco friendliness'
  };

  return (
    <section className="reviews">
      <p className="eyebrow">Guest voice</p>
      <h2 className="section-title">Guest Reviews</h2>

      {averages && (
        <div className="panel review-summary">
          <div>
            <p className="rating-big">{averages.avg_overall?.toFixed(1)}</p>
            <p className="muted" style={{ margin: 0 }}>out of 10 overall</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 18 }}>
              <XAxis type="number" domain={[0, 10]} tick={{ fill: '#D8B98C' }} axisLine={{ stroke: '#D8B98C' }} />
              <YAxis type="category" dataKey="name" width={92} tick={{ fill: '#D8B98C' }} axisLine={{ stroke: '#D8B98C' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1AA6B7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="panel review-form" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Leave a Review</h3>
          <RatingControl
            label="Overall Rating"
            value={form.rating_overall}
            onChange={value => setForm({ ...form, rating_overall: value })}
          />

          {Object.keys(ratingLabels).map(cat => (
            <RatingControl
              key={cat}
              label={ratingLabels[cat]}
              value={form.ratings[cat]}
              onChange={value => setForm({
                  ...form,
                  ratings: { ...form.ratings, [cat]: value }
                })}
            />
          ))}

          <div className="range-row">
            <label>Nights stayed</label>
            <input type="number" min={1} value={form.nights_stayed}
              onChange={e => setForm({ ...form, nights_stayed: parseInt(e.target.value) })}
              className="input" style={{ maxWidth: 140 }} />
          </div>
          <textarea
            placeholder="Share your experience..."
            value={form.comment_text}
            onChange={e => setForm({ ...form, comment_text: e.target.value })}
            rows={3}
            className="textarea"
          />
          <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>Submit Review</button>
        </form>
      )}

      {loading ? <p className="loading-state">Loading reviews...</p> : comments.length === 0 ? (
        <p className="empty-state">No reviews yet.</p>
      ) : (
        <div className="review-list">
          {comments.map(c => (
            <div key={c._id} className="panel review-item">
              <div className="review-head">
                <strong>{c.user_name}</strong>
                <span className="badge">{c.rating_overall}/10</span>
              </div>
              <p className="muted" style={{ fontSize: 13 }}>
                {c.nights_stayed} nights - {new Date(c.created_at).toLocaleDateString()}
              </p>
              <p style={{ marginBottom: 0 }}>{c.comment_text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
