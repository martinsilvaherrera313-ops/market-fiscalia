import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CreatePublication.css';

const CreatePublication = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: ''
  });
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imagenes.length > 8) {
      setError('Máximo 8 imágenes permitidas');
      return;
    }

    setImagenes([...imagenes, ...files]);

    // Crear previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    setError('');
  };

  const removeImage = (index) => {
    const newImagenes = imagenes.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Liberar URL del preview
    URL.revokeObjectURL(previews[index]);
    
    setImagenes(newImagenes);
    setPreviews(newPreviews);
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

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('precio', formData.precio);

      imagenes.forEach((imagen) => {
        formDataToSend.append('imagenes', imagen);
      });

      const response = await api.post('/publicaciones', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Redirigir al inicio para ver todas las publicaciones actualizadas
      navigate('/', { state: { refresh: true, message: '¡Publicación creada exitosamente!' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      <div className="create-card">
        <h1>Nueva Publicación</h1>

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
              placeholder="Describe tu producto: características, estado, motivo de venta, etc."
            />
          </div>

          <div className="form-group">
            <label htmlFor="imagenes">
              Imágenes ({imagenes.length}/5)
            </label>
            <input
              type="file"
              id="imagenes"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={imagenes.length >= 8}
            />
            <small>Máximo 8 imágenes. Formatos: JPG, PNG, GIF, WebP (máx. 5MB cada una)</small>
          </div>

          {previews.length > 0 && (
            <div className="image-previews">
              {previews.map((preview, index) => (
                <div key={index} className="preview-item">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePublication;
