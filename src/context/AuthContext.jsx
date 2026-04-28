// ============================================================
// AuthContext.jsx — Manejo de sesión (AUX4)
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const AuthContext = createContext(null);

const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutos
const USUARIO_DEFAULT = null;

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) || USUARIO_DEFAULT;
    } catch {
      return USUARIO_DEFAULT;
    }
  });

  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const timerRef = useRef(null);

  // Función de logout actualizada para aceptar motivos
  const logout = useCallback((reason = null) => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    
    if (reason) {
      sessionStorage.setItem("logout_reason", reason);
    }
    
    setUsuario(USUARIO_DEFAULT);
    setShowExpiredModal(false);
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(userData));
    sessionStorage.removeItem("logout_reason"); // Limpieza al iniciar
    setUsuario(userData);
    setShowExpiredModal(false);
  }, []);

  // ─── Lógica de inactividad ──────────────────────────
  const resetTimer = useCallback(() => {
    if (!usuario || showExpiredModal) return; 
    
    clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      // Disparamos el logout cuando el tiempo se cumple
      logout("Tu sesión ha expirado por inactividad.");
      setShowExpiredModal(true);
    }, INACTIVITY_MS);
  }, [usuario, showExpiredModal, logout]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    
    if (usuario && !showExpiredModal) {
      events.forEach((e) => window.addEventListener(e, resetTimer));
      resetTimer();
    }
    
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, [resetTimer, usuario, showExpiredModal]);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, showExpiredModal, setShowExpiredModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);