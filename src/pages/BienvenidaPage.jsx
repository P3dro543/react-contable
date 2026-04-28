import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

export function BienvenidaPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // REQUISITO PDF: Solo administradores (Rol 1) pueden entrar a esta pantalla
    if (usuario && usuario.id_rol !== 1) {
      navigate('/login'); // O a una página de "No autorizado"
    }
  }, [usuario, navigate]);

  if (!usuario || usuario.id_rol !== 1) return null;

  return (
    <Layout title="Bienvenida">
      <div className="welcome-container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 'calc(100vh - 160px)',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .welcome-gradient {
            background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
          }
          .welcome-card {
            text-align: center;
            padding: 45px;
            background: var(--surface);
            border-radius: 24px;
            border: 1px solid var(--border2);
            box-shadow: var(--shadow-lg);
            max-width: 550px;
            width: 100%;
            position: relative;
            overflow: hidden;
          }
          .welcome-card::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--accent));
          }
        `}</style>
  
        <div className="welcome-card">
          <div style={{ marginBottom: '30px' }}>
            <img src="/logo.png" alt="Logo Empresa" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
          </div>
          
          <h1 style={{ fontSize: '1.4rem', color: 'var(--txt2)', marginBottom: '8px' }}>
            Bienvenido,
          </h1>
          <h2 className="welcome-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px', lineHeight: 1.2 }}>
            {usuario.nombre} {usuario.apellido}
          </h2>
          
          <div style={{ height: '1px', background: 'var(--border2)', margin: '25px auto', width: '35%' }}></div>
          
          <p style={{ color: 'var(--txt3)', fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Desarrollos Ordenados S.A.
          </p>
        </div>
      </div>
    </Layout>
  );
}
