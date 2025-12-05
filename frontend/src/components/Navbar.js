import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo-fiscalia.png" alt="Fiscalía de Chile" className="navbar-logo-img" />
          <span>Market Fiscalía</span>
        </Link>

        {isAuthenticated && (
          <div className="navbar-menu">
            <Link to="/" className="navbar-link">
              Inicio
            </Link>
            <Link to="/crear-publicacion" className="navbar-link navbar-link-crear">
              + Nueva Publicación
            </Link>
            <Link to="/mis-publicaciones" className="navbar-link">
              Mis Publicaciones
            </Link>
            <div className="navbar-user">
              <span className="navbar-username">{user?.nombre}</span>
              <button onClick={handleLogout} className="navbar-logout">
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
