import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CreatePublication.css';

const EditPublication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: ''
  });
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]);
  const [previewsNuevas, setPreviewsNuevas] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicacion();
  }, [id]);

  const fetchPublicacion = async () => {
    try {
      const response = await api.get(`/publicaciones/${id}`);
      const pub = response.data;
      
      setFormData({
        titulo: pub.titulo,
        descripcion: pub.descripcion,
        precio: pub.precio
      });
      setImagenesExistentes(pub.imagenes || []);
    } catch (err) {
      setError('Error al cargar la publicación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImagenes = imagenesExistentes.length - imagenesAEliminar.length + imagenesNuevas.length;
    
    if (files.length + totalImagenes > 8) {
      setError('Máximo 8 imágenes permitidas');
      return;
    }

    setImagenesNuevas([...imagenesNuevas, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewsNuevas([...previewsNuevas, ...newPreviews]);
    setError('');
  };

  const removeExistingImage = (imagenId) => {
    setImagenesAEliminar([...imagenesAEliminar, imagenId]);
  };

  const restoreExistingImage = (imagenId) => {
    setImagenesAEliminar(imagenesAEliminar.filter(id => id !== imagenId));
  };

  const removeNewImage = (index) => {
    const newImagenesNuevas = imagenesNuevas.filter((_, i) => i !== index);
    const newPreviews = previewsNuevas.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(previewsNuevas[index]);
    
    setImagenesNuevas(newImagenesNuevas);
    setPreviewsNuevas(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.titulo || !formData.descripcion || !formData.precio) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (parseFloat(formData.precio) <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('imagenesAEliminar', JSON.stringify(imagenesAEliminar));

      imagenesNuevas.forEach((imagen) => {
        formDataToSend.append('imagenes', imagen);
      });

      await api.put(`/publicaciones/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/mis-publicaciones', { state: { message: '¡Publicación actualizada exitosamente!' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar la publicación');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando publicación...</p>
      </div>
    );
  }

  const totalImagenes = imagenesExistentes.length - imagenesAEliminar.length + imagenesNuevas.length;

  return (
    <div className="create-container">
      <div className="create-card">
        <h1>Editar Publicación</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label htmlFor="titulo">Título *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              maxLength="200"
              placeholder="Ej: iPhone 13 Pro en excelente estado"
            />
          </div>

          <div className="form-group">
            <label htmlFor="precio">Precio (CLP) *</label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              required
              min="0"
              step="1"
              placeholder="Ej: 450000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Describe tu producto..."
            />
          </div>

          {/* Imágenes existentes */}
          {imagenesExistentes.length > 0 && (
            <div className="form-group">
              <label>Imágenes actuales</label>
              <div className="image-previews">
                {imagenesExistentes.map((img) => (
                  <div 
                    key={img.id} 
                    className={`preview-item ${imagenesAEliminar.includes(img.id) ? 'to-delete' : ''}`}
                  >
                    <img 
                      src={`http://localhost:5000${img.url}`} 
                      alt="Imagen actual"
                    />
                    {imagenesAEliminar.includes(img.id) ? (
                      <button
                        type="button"
                        onClick={() => restoreExistingImage(img.id)}
                        className="restore-image"
                      >
                        ↶
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="remove-image"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nuevas imágenes */}
          <div className="form-group">
            <label htmlFor="imagenes">
              Agregar nuevas imágenes ({totalImagenes}/5)
            </label>
            <input
              type="file"
              id="imagenes"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={totalImagenes >= 8}
            />
            <small>Máximo 8 imágenes en total</small>
          </div>

          {previewsNuevas.length > 0 && (
            <div className="image-previews">
              {previewsNuevas.map((preview, index) => (
                <div key={`new-${index}`} className="preview-item">
                  <img src={preview} alt={`Nueva ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="remove-image"
                  >
                    ✕
                  </button>
                  <span className="new-badge">Nueva</span>
                </div>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(`/publicacion/${id}`)}
              className="btn-secondary"
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPublication;
