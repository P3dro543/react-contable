import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SessionExpiredOverlay() {
  const { showExpiredModal, logout } = useAuth();
  const navigate = useNavigate();

  if (!showExpiredModal) return null;

  const handleAccept = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#1a1d21',
        padding: '40px',
        borderRadius: '16px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        border: '1px solid #31363c',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontSize: '50px', marginBottom: '20px' }}>⏳</div>
        <h2 style={{ color: '#fff', marginBottom: '15px', fontSize: '24px' }}>Sesión Expirada</h2>
        <p style={{ color: '#9eaab7', marginBottom: '30px', lineHeight: '1.6' }}>
          Su sesión ha expirado por inactividad. Por favor inicie sesión nuevamente.
        </p>
        <button
          onClick={handleAccept}
          style={{
            backgroundColor: '#0061ff',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0052d9'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#0061ff'}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}