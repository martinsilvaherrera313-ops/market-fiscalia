import React, { useState, useEffect, useRef } from 'react';
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
  const [isVertical, setIsVertical] = useState(false);
  const mainImgRef = useRef(null);
  const images = publicacion && Array.isArray(publicacion.imagenes) ? publicacion.imagenes : [];
  // Detectar si la imagen principal es vertical SOLO si hay imágenes y publicacion cargada
  useEffect(() => {
    if (!publicacion || !images.length) return;
    const img = new window.Image();
    img.src = images[currentImageIndex].url.startsWith('http')
      ? images[currentImageIndex].url
      : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${images[currentImageIndex].url}`;
    img.onload = function () {
      setIsVertical(img.naturalHeight > img.naturalWidth);
    };
  }, [currentImageIndex, images, publicacion]);

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="detail-container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-back" aria-label="Volver al inicio">Volver al inicio</button>
      </div>
      <div className="detail-content">
        <div className="detail-images">
          {images.length > 0 ? (
            <>
              <div className={`main-image${isVertical ? ' vertical-img' : ''}`}>
                <img
                  ref={mainImgRef}
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
          {/* Título y precio destacado */}
          <div className="product-header">
            <h1 className="detail-title">{publicacion.titulo}</h1>
            {publicacion.categoria && (
              <span className="product-category">{publicacion.categoria}</span>
            )}
          </div>

          <div className="price-section">
            <p className="detail-price">{formatPrice(publicacion.precio)}</p>
            {publicacion.ubicacion && (
              <p className="product-location">{publicacion.ubicacion}</p>
            )}
          </div>

          {/* Descripción destacada */}
          <div className="detail-section description-box">
            <h3>Descripción</h3>
            <p className="detail-description">{publicacion.descripcion}</p>
          </div>

          {/* Información del vendedor en card */}
          <div className="detail-section seller-card">
            <h3>Información del vendedor</h3>
            <div className="seller-info">
              <div className="seller-row">
                <span className="seller-label">Nombre:</span>
                <span className="seller-value">{publicacion.usuario_nombre}</span>
              </div>
              <div className="seller-row">
                <span className="seller-label">Email:</span>
                <a href={`mailto:${publicacion.usuario_email}`} className="seller-email">
                  {publicacion.usuario_email}
                </a>
              </div>
              {publicacion.usuario_telefono && (
                <div className="seller-row">
                  <span className="seller-label">Teléfono:</span>
                  <a href={`tel:${publicacion.usuario_telefono}`} className="seller-phone">
                    {publicacion.usuario_telefono}
                  </a>
                </div>
              )}
              {publicacion.usuario_departamento && (
                <div className="seller-row">
                  <span className="seller-label">Departamento:</span>
                  <span className="seller-value">{publicacion.usuario_departamento}</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="detail-meta">
            <p className="meta-date">Publicado el {formatDate(publicacion.created_at)}</p>
            {publicacion.updated_at !== publicacion.created_at && (
              <p className="meta-date">Actualizado el {formatDate(publicacion.updated_at)}</p>
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
