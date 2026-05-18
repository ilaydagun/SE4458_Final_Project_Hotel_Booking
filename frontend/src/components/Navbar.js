import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">HH</span>
        <span>HotelHive</span>
      </Link>
      <div className="nav-links">
        <Link to="/search" className="nav-link">Search</Link>
        {user ? (
          <>
            <Link to="/admin" className="nav-link">Admin</Link>
            <button onClick={handleLogout} className="btn btn-primary">Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
}
