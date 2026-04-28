// ============================================================
// AuthContext.jsx — Manejo de sesión (AUX4)
// Login lo maneja el equipo de Geral/Felipe
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const AuthContext = createContext(null);

const INACTIVITY_MS = 5 * 60 * 1000; // 

const USUARIO_DEFAULT = null;

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) || USUARIO_DEFAULT;
    } catch {
      return USUARIO_DEFAULT;
    }
  });

  const timerRef = useRef(null);

  const logout = useCallback((reason = null) => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    if (reason) {
      sessionStorage.setItem("logout_reason", reason);
    }
    setUsuario(USUARIO_DEFAULT);
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(userData));
    sessionStorage.removeItem("logout_reason");
    setUsuario(userData);
  }, []);

  // ─── AUX4: Timer de inactividad ──────────────────────────
  const resetTimer = useCallback(() => {
    if (!usuario) return; // Solo si hay sesión activa
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout("Su sesión ha expirado por inactividad para proteger sus datos.");
    }, INACTIVITY_MS);
  }, [logout, usuario]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);