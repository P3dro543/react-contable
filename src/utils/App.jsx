// ============================================================
// App.jsx — Router principal módulo AUX
// Login lo maneja el equipo de Geral/Felipe
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }            from "../context/AuthContext";
import { ProtectedRoute }         from "../components/ProtectedRoute";
import { Layout }                  from "../components/Layout";

// Páginas
import { LoginPage }               from "../pages/LoginPage";
import { BienvenidaPage }          from "../pages/BienvenidaPage";
import { ProrrateoCCPage }         from "../pages/ProrrateoCCPage";
import { ProrrateoTercerosPage }   from "../pages/ProrrateoTercerosPage";
import { TercerosPage }            from "../pages/TercerosPage";
import { DireccionesPage }         from "../pages/DireccionesPage";
import { ContactosPage }           from "../pages/ContactosPage";
import { CentrosCostoPage }        from "../pages/CentrosCostoPage";
import { ReporteTercerosPage }     from "../pages/ReporteTercerosPage";
import { ReporteCentrosCostoPage } from "../pages/ReporteCentrosCostoPage";

// CSS global
import "../styles.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/bienvenida" element={<BienvenidaPage />} />
            
            <Route path="/prorrateo" element={<ProrrateoCCPage />} />

            <Route path="/asignar-terceros" element={<ProrrateoTercerosPage />} />

            <Route path="/terceros" element={<TercerosPage />} />

            <Route path="/terceros/:id_tercero/direcciones" element={<DireccionesPage />} />

            <Route path="/terceros/:id_tercero/contactos" element={<ContactosPage />} />

            <Route path="/centros-costo" element={<CentrosCostoPage />} />

            <Route path="/reportes/terceros" element={<ReporteTercerosPage />} />

            <Route path="/reportes/centros-costo" element={<ReporteCentrosCostoPage />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}