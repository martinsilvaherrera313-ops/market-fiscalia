import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './InactivityWarning.css';

const InactivityWarning = () => {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIME = 14 * 60 * 1000; // 14 minutos (advertencia 1 min antes)
    const WARNING_TIME = 60 * 1000; // 60 segundos de advertencia
    let inactivityTimer;
    let warningTimer;
    let countdownInterval;

    const resetTimers = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      setShowWarning(false);
      setCountdown(60);

      inactivityTimer = setTimeout(() => {
        // Mostrar advertencia
        setShowWarning(true);
        let timeLeft = 60;
        setCountdown(timeLeft);

        countdownInterval = setInterval(() => {
          timeLeft--;
          setCountdown(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);

        // Cerrar sesión después de la advertencia
        warningTimer = setTimeout(() => {
          logout();
          window.location.href = '/login';
        }, WARNING_TIME);
      }, INACTIVITY_TIME);
    };

    const handleActivity = () => {
      if (showWarning) {
        resetTimers();
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimers);
    });

    resetTimers();

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      events.forEach(event => {
        window.removeEventListener(event, resetTimers);
      });
    };
  }, [user, logout, showWarning]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    setCountdown(60);
  };

  if (!showWarning) return null;

  return (
    <div className="inactivity-overlay">
      <div className="inactivity-modal">
        <div className="inactivity-icon">⏱️</div>
        <h2>Sesión por expirar</h2>
        <p>
          Tu sesión se cerrará automáticamente en <strong>{countdown}</strong> segundos por inactividad.
        </p>
        <p className="inactivity-subtitle">
          Esto ayuda a ahorrar recursos del servidor.
        </p>
        <button onClick={handleStayLoggedIn} className="btn-stay-logged">
          Mantener sesión activa
        </button>
      </div>
    </div>
  );
};

export default InactivityWarning;
