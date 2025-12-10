import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './EditProfile.css';

const EditProfile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
    departamento: user?.departamento || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setLoading(true);

    try {
      const response = await api.put('/auth/profile', formData);
      
      // Actualizar datos en sessionStorage
      const updatedUser = { ...user, ...formData };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Perfil actualizado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Todos los campos de contraseña son obligatorios');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess('Contraseña actualizada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          Volver
        </button>
      </div>

      <div className="edit-profile-card">
        <h1>Editar Perfil</h1>
        <p className="edit-profile-subtitle">Actualiza tu información personal</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Información de cuenta */}
        <div className="profile-info-section">
          <h3>Información de cuenta</h3>
          <div className="info-item">
            <label>Correo electrónico:</label>
            <p className="email-display">{user?.email}</p>
            <small>El email no se puede modificar</small>
          </div>
        </div>

        {/* Formulario de perfil */}
        <form onSubmit={handleSubmitProfile} className="profile-form">
          <h3>Datos personales</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Juan Pérez González"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: +56912345678"
              />
              <small>Opcional - Visible en tus publicaciones</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-row-full">
              <label htmlFor="departamento">Departamento</label>
              <input
                type="text"
                id="departamento"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                placeholder="Ej: Fiscalía Regional Metropolitana Sur"
              />
              <small>Opcional</small>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>

        {/* Sección de contraseña */}
        <div className="password-section">
          <h3>Seguridad</h3>
          
          {!showPasswordForm ? (
            <button 
              onClick={() => setShowPasswordForm(true)} 
              className="btn-secondary"
            >
              Cambiar Contraseña
            </button>
          ) : (
            <form onSubmit={handleSubmitPassword} className="password-form">
              <div className="form-row">
                <div className="form-group form-row-full">
                  <label htmlFor="currentPassword">Contraseña actual *</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Ingresa tu contraseña actual"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="newPassword">Nueva contraseña *</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar contraseña *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setError('');
                  }}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
