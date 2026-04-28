// ============================================================
// ProtectedRoute.jsx — Protección de rutas autenticadas
// ============================================================

import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: "Por favor inicie sesión para utilizar el sistema." }}
        replace
      />
    );
  }

  // Si hay children (uso como wrapper directo) o Outlet (uso en el Router)
  return children ? children : <Outlet />;
}