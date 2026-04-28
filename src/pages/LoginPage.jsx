// ============================================================
// LoginPage.jsx — Pantalla de ingreso al sistema (AUX1)
// ============================================================

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import axiosInstance from "../utils/axiosConfig";

export function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const redirectMsg = location.state?.message || "";
  const from        = location.state?.from?.pathname || "/terceros";

  const [form, setForm]       = useState({ username: "", password: "" });
  const [error, setError]     = useState(redirectMsg);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Revisar si hubo cierre de sesión por inactividad
  useState(() => {
    const reason = sessionStorage.getItem("logout_reason");
    if (reason) {
      setError(reason);
      sessionStorage.removeItem("logout_reason"); // Limpiar para que no se repita
    }
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Usuario y/o contraseña incorrectos.");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", {
        username: form.username,
        password: form.password,
      });

      if (response.data && response.status === 200) {
        login("", response.data.usuario);
        navigate("/bienvenida");
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("Usuario bloqueado por demasiados intentos fallidos.");
      } else {
        setError("Usuario y/o contraseña incorrectos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <img src="/logo.png" alt="Logo" style={{ width: "65px", height: "65px", objectFit: "contain" }} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div className="login-logo-text" style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--txt1)' }}>
            Desarrollos Ordenados S.A.
          </div>
        </div>

        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-sub">Ingrese sus credenciales para continuar.</p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario <span style={{ color: 'red' }}>*</span></label>
            <input
              className="form-control"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Nombre de usuario"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña <span style={{ color: 'red' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-control"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{ paddingRight: '40px' }}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: 15, fontWeight: '600' }}
            disabled={loading}
          >
            {loading ? "Verificando..." : "Aceptar"}
          </button>
        </form>
      </div>
    </div>
  );
}
