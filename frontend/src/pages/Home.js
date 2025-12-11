import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [publicaciones, setPublicaciones] = useState([]);
  const [publicacionesFiltradas, setPublicacionesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('recientes');
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const publicacionesPorPagina = 12;

  useEffect(() => {
    fetchPublicaciones();
    
    // Mostrar mensaje de éxito si viene de crear publicación
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      // Limpiar el estado para que no se muestre de nuevo
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    filtrarYOrdenar();
    setPaginaActual(1); // Resetear a página 1 cuando cambian filtros
  }, [publicaciones, busqueda, ordenamiento]);

  const fetchPublicaciones = async () => {
    try {
      const response = await api.get('/publicaciones');
      setPublicaciones(response.data);
    } catch (err) {
      setError('Error al cargar las publicaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtrarYOrdenar = () => {
    let resultado = [...publicaciones];

    // Filtrar publicaciones propias del usuario
    if (user) {
      resultado = resultado.filter(pub => pub.usuario_id !== user.id);
    }

    // Aplicar búsqueda
    if (busqueda.trim()) {
      resultado = resultado.filter(pub => 
        pub.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        pub.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        pub.usuario_nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    switch (ordenamiento) {
      case 'recientes':
        resultado.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'antiguos':
        resultado.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'precio-menor':
        resultado.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
        break;
      case 'precio-mayor':
        resultado.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
        break;
      default:
        break;
    }

    setPublicacionesFiltradas(resultado);
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

  // Calcular índices de paginación
  const indexUltimaPublicacion = paginaActual * publicacionesPorPagina;
  const indexPrimeraPublicacion = indexUltimaPublicacion - publicacionesPorPagina;
  const publicacionesActuales = publicacionesFiltradas.slice(indexPrimeraPublicacion, indexUltimaPublicacion);
  const totalPaginas = Math.ceil(publicacionesFiltradas.length / publicacionesPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="home-header">
          <h1>Market Fiscalía</h1>
          <p>Descubre productos y servicios de tus compañeros</p>
        </div>

        <div className="filters-container">
          <div className="search-box">
            <div className="skeleton skeleton-input"></div>
          </div>
          <div className="skeleton skeleton-select"></div>
        </div>

        <div className="publications-grid">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="pub-card skeleton-card">
              <div className="skeleton skeleton-image"></div>
              <div className="pub-content">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-price"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text-short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Market Fiscalía</h1>
        <p>Descubre productos y servicios de tus compañeros</p>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="filters-wrapper">
        <button 
          className="filters-toggle-btn"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          <span>🔍 Filtros y Búsqueda</span>
          <span className={`toggle-arrow ${mostrarFiltros ? 'open' : ''}`}>▼</span>
        </button>

        <div className={`filters-container ${mostrarFiltros ? 'expanded' : 'collapsed'}`}>
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar publicaciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="filter-box">
            <label htmlFor="ordenamiento">Ordenar por:</label>
            <select
              id="ordenamiento"
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              className="filter-select"
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="precio-menor">Precio: Menor a mayor</option>
              <option value="precio-mayor">Precio: Mayor a menor</option>
            </select>
          </div>
        </div>
      </div>

      <div className="results-count">
        {publicacionesFiltradas.length} {publicacionesFiltradas.length === 1 ? 'publicación encontrada' : 'publicaciones encontradas'}
      </div>

      {error && <div className="error-message">{error}</div>}

      {publicacionesFiltradas.length === 0 ? (
        <div className="empty-state">
          {busqueda ? (
            <>
              <h2>No se encontraron resultados</h2>
              <p>Intenta con otros términos de búsqueda</p>
            </>
          ) : (
            <>
              <h2>No hay publicaciones aún</h2>
              <p>Sé el primero en publicar algo</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="publications-grid">
            {publicacionesActuales.map((pub) => (
              <div key={pub.id} className="publication-card">
              <Link to={`/publicacion/${pub.id}`} className="card-link">
                <div className="publication-image">
                  {pub.imagen_principal ? (
                    <img 
                      src={pub.imagen_principal.startsWith('http') ? pub.imagen_principal : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${pub.imagen_principal}`}
                      alt={pub.titulo}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
                      }}
                    />
                  ) : (
                    <div className="no-image">Sin imagen</div>
                  )}
                  <div className="card-overlay">
                    <button className="btn-view-details">Ver detalles</button>
                  </div>
                </div>
                
                <div className="publication-content">
                  <h3 className="publication-title">{pub.titulo}</h3>
                  <p className="publication-price">{formatPrice(pub.precio)}</p>
                  <p className="publication-description">
                    {pub.descripcion.substring(0, 100)}
                    {pub.descripcion.length > 100 ? '...' : ''}
                  </p>
                  <div className="publication-footer">
                    <span className="publication-author">
                      Por: {pub.usuario_nombre}
                    </span>
                    <span className="publication-date">
                      {formatDate(pub.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Controles de paginación */}
        {totalPaginas > 1 && (
          <div className="pagination">
            <button 
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="pagination-btn"
            >
              ← Anterior
            </button>

            <div className="pagination-numbers">
              {[...Array(totalPaginas)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => cambiarPagina(index + 1)}
                  className={`pagination-number ${paginaActual === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="pagination-btn"
            >
              Siguiente →
            </button>
          </div>
        )}
      </>
      )}
    </div>
  );
};

export default Home;
