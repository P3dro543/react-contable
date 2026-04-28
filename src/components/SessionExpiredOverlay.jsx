// ============================================================
// SessionExpiredOverlay.jsx — Aviso de sesión expirada (AUX4)
// ============================================================

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function SessionExpiredOverlay() {
  const { sessionExpired, setSessionExpired } = useAuth();
  const navigate = useNavigate();

  if (!sessionExpired) return null;

  const handleOk = () => {
    setSessionExpired(false);
    navigate("/login");
  };

  return (
    <div className="session-overlay">
      <div className="session-box">
        <div className="session-icon">⏱️</div>
        <div className="session-title">Sesión expirada</div>
        <p className="session-desc">
          Su sesión ha expirado por inactividad. Por favor inicie sesión nuevamente.
        </p>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleOk}>
          Ir al inicio de sesión
        </button>
      </div>
    </div>
  );
}