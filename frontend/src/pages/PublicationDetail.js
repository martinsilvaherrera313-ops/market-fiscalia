import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './PublicationDetail.css';

const PublicationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [publicacion, setPublicacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchPublicacion();
  }, [id]);

  const fetchPublicacion = async () => {
    try {
      const response = await api.get(`/publicaciones/${id}`);
      setPublicacion(response.data);
    } catch (err) {
      setError('Error al cargar la publicación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      return;
    }

    try {
      await api.delete(`/publicaciones/${id}`);
      navigate('/mis-publicaciones');
    } catch (err) {
      alert('Error al eliminar la publicación');
      console.error(err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-CL', options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando publicación...</p>
      </div>
    );
  }

  if (error || !publicacion) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Publicación no encontrada'}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Volver al inicio
        </button>
      </div>
    );
  }

  const isOwner = user && user.id === publicacion.usuario_id;
  const images = publicacion.imagenes || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="detail-container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Volver
        </button>
      </div>
      <div className="detail-content">
        <div className="detail-images">
          {images.length > 0 ? (
            <>
              <div className="main-image">
                <img 
                  src={images[currentImageIndex].url.startsWith('http') ? images[currentImageIndex].url : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${images[currentImageIndex].url}`}
                  alt={publicacion.titulo}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=Error+al+cargar+imagen';
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button className="carousel-btn prev-btn" onClick={prevImage}>
                      ‹
                    </button>
                    <button className="carousel-btn next-btn" onClick={nextImage}>
                      ›
                    </button>
                    <div className="carousel-indicator">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="image-thumbnails">
                  {images.map((img, index) => (
                    <div 
                      key={img.id}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img 
                        src={img.url.startsWith('http') ? img.url : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img.url}`}
                        alt={`${publicacion.titulo} ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-image-large">Sin imágenes disponibles</div>
          )}
        </div>

        <div className="detail-info">
          <h1 className="detail-title">{publicacion.titulo}</h1>
          <p className="detail-price">{formatPrice(publicacion.precio)}</p>

          <div className="detail-section">
            <h3>Descripción</h3>
            <p className="detail-description">{publicacion.descripcion}</p>
          </div>

          <div className="detail-section">
            <h3>Información del vendedor</h3>
            <div className="seller-info">
              <p><strong>Nombre:</strong> {publicacion.usuario_nombre}</p>
              <p><strong>Email:</strong> {publicacion.usuario_email}</p>
              {publicacion.usuario_telefono && (
                <p><strong>Teléfono:</strong> {publicacion.usuario_telefono}</p>
              )}
            </div>
          </div>

          <div className="detail-meta">
            <p>Publicado el {formatDate(publicacion.created_at)}</p>
            {publicacion.updated_at !== publicacion.created_at && (
              <p>Actualizado el {formatDate(publicacion.updated_at)}</p>
            )}
          </div>

          {isOwner && (
            <div className="detail-actions">
              <button 
                onClick={() => navigate(`/editar-publicacion/${id}`)}
                className="btn-edit"
              >
                Editar Publicación
              </button>
              <button 
                onClick={handleDelete}
                className="btn-delete"
              >
                Eliminar Publicación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicationDetail;
