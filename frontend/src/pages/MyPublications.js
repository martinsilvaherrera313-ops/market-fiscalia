import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import './MyPublications.css';

const MyPublications = () => {
  const location = useLocation();
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchMyPublicaciones();
    
    // Mostrar mensaje de éxito si viene de editar/eliminar
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchMyPublicaciones = async () => {
    try {
      const response = await api.get('/publicaciones/user/myposts');
      setPublicaciones(response.data);
    } catch (err) {
      setError('Error al cargar tus publicaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, titulo) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${titulo}"?`)) {
      return;
    }

    try {
      await api.delete(`/publicaciones/${id}`);
      // Actualizar la lista localmente
      setPublicaciones(publicaciones.filter(pub => pub.id !== id));
      // Mostrar mensaje de éxito
      setSuccessMessage('¡Publicación eliminada exitosamente!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      alert('Error al eliminar la publicación');
      console.error(err);
    }
  };

  const handleToggleEstado = async (id, estadoActual, titulo) => {
    const nuevoEstado = estadoActual === 'vendido' ? 'activo' : 'vendido';
    const mensaje = nuevoEstado === 'vendido' 
      ? `¿Marcar "${titulo}" como vendido?`
      : `¿Reactivar "${titulo}"?`;
    
    if (!window.confirm(mensaje)) {
      return;
    }

    try {
      await api.patch(`/publicaciones/${id}/estado`, { estado: nuevoEstado });
      // Actualizar el estado localmente
      setPublicaciones(publicaciones.map(pub => 
        pub.id === id ? { ...pub, estado: nuevoEstado } : pub
      ));
      // Mostrar mensaje de éxito
      const mensajeExito = nuevoEstado === 'vendido' 
        ? '¡Publicación marcada como vendida!'
        : '¡Publicación reactivada!';
      setSuccessMessage(mensajeExito);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      alert('Error al actualizar el estado');
      console.error(err);
    }
  };

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CL', options);
  };

  if (loading) {
    return (
      <div className="my-pubs-container">
        <div className="my-pubs-header">
          <h1>Mis Publicaciones</h1>
        </div>

        <div className="my-pubs-grid">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="my-pub-card skeleton-card">
              <div className="skeleton skeleton-image-my"></div>
              <div className="my-pub-content">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-price"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text-short"></div>
              </div>
              <div className="my-pub-actions">
                <div className="skeleton skeleton-button"></div>
                <div className="skeleton skeleton-button"></div>
                <div className="skeleton skeleton-button"></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-pubs-container">
      <div className="my-pubs-header">
        <h1>Mis Publicaciones</h1>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {publicaciones.length === 0 ? (
        <div className="empty-state">
          <h2>No tienes publicaciones</h2>
          <p>Comienza a vender tus artículos creando tu primera publicación</p>
          <Link to="/crear-publicacion" className="btn-primary">
            Crear Publicación
          </Link>
        </div>
      ) : (
        <div className="my-pubs-grid">
          {publicaciones.map((pub) => (
            <div key={pub.id} className="my-pub-card">
              <div className="my-pub-image">
                {pub.imagen_principal ? (
                  <img 
                    src={pub.imagen_principal?.startsWith('http') ? pub.imagen_principal : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${pub.imagen_principal}`} 
                    alt={pub.titulo}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
                    }}
                  />
                ) : (
                  <div className="no-image">Sin imagen</div>
                )}
                <span className={`status-badge status-${pub.estado}`}>
                  {pub.estado}
                </span>
              </div>
              
              <div className="my-pub-content">
                <h3 className="my-pub-title">{pub.titulo}</h3>
                <p className="my-pub-price">{formatPrice(pub.precio)}</p>
                <p className="my-pub-description">
                  {pub.descripcion.substring(0, 100)}
                  {pub.descripcion.length > 100 ? '...' : ''}
                </p>
                <p className="my-pub-date">
                  Publicado: {formatDate(pub.created_at)}
                </p>
              </div>

              <div className="my-pub-footer">
                <button 
                  className={`toggle-actions-btn ${expandedCards[pub.id] ? 'expanded' : ''}`}
                  onClick={() => toggleCardExpansion(pub.id)}
                >
                  <span>Acciones</span>
                  <span className="arrow">▼</span>
                </button>

                <div className={`my-pub-actions ${expandedCards[pub.id] ? 'show' : ''}`}>
                  <Link 
                    to={`/publicacion/${pub.id}`}
                    className="btn-view"
                  >
                    Ver
                  </Link>
                  <Link 
                    to={`/editar-publicacion/${pub.id}`}
                    className="btn-edit"
                    style={{ display: pub.estado === 'vendido' ? 'none' : 'inline-block' }}
                  >
                    Editar
                  </Link>
                  <button 
                    onClick={() => handleToggleEstado(pub.id, pub.estado, pub.titulo)}
                    className={pub.estado === 'vendido' ? 'btn-reactivar' : 'btn-vendido'}
                  >
                    {pub.estado === 'vendido' ? 'Reactivar' : 'Vendido'}
                  </button>
                  <button 
                    onClick={() => handleDelete(pub.id, pub.titulo)}
                    className="btn-delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPublications;
