import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <div className="navbar-user" ref={dropdownRef}>
              <button 
                className="navbar-username-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="user-icon">👤</span>
                <span>{user?.nombre}</span>
                <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
              </button>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <Link 
                    to="/editar-perfil" 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="dropdown-icon">✏️</span>
                    Editar Perfil
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="dropdown-item dropdown-logout"
                  >
                    <span className="dropdown-icon">🚪</span>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
