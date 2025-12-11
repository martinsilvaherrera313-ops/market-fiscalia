import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  // Timers para inactividad
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos
  const WARNING_TIMEOUT = 28 * 60 * 1000; // 28 minutos (advertencia 2 min antes)
  let inactivityTimer = null;
  let warningTimer = null;

  const resetInactivityTimer = () => {
    // Limpiar timers existentes
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (warningTimer) clearTimeout(warningTimer);
    setShowInactivityWarning(false);

    // Solo establecer timers si hay usuario autenticado
    if (user) {
      // Timer para mostrar advertencia
      warningTimer = setTimeout(() => {
        setShowInactivityWarning(true);
      }, WARNING_TIMEOUT);

      // Timer para cerrar sesión
      inactivityTimer = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  const continueSession = () => {
    setShowInactivityWarning(false);
    resetInactivityTimer();
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Monitorear actividad del usuario
  useEffect(() => {
    if (user) {
      // Eventos que indican actividad
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        window.addEventListener(event, resetInactivityTimer);
      });

      // Iniciar timer al cargar
      resetInactivityTimer();

      // Cleanup
      return () => {
        events.forEach(event => {
          window.removeEventListener(event, resetInactivityTimer);
        });
        if (inactivityTimer) clearTimeout(inactivityTimer);
        if (warningTimer) clearTimeout(warningTimer);
      };
    }
  }, [user]);

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return response.data;
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return response.data;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setShowInactivityWarning(false);
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (warningTimer) clearTimeout(warningTimer);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    showInactivityWarning,
    continueSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showInactivityWarning && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 10000,
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#e74c3c' }}>⚠️ Sesión por expirar</h3>
          <p style={{ marginBottom: '1.5rem', color: '#555' }}>
            Tu sesión se cerrará en 2 minutos por inactividad.
          </p>
          <button
            onClick={continueSession}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Continuar sesión
          </button>
        </div>
      )}
      {showInactivityWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999
        }} onClick={continueSession} />
      )}
    </AuthContext.Provider>
  );
};
