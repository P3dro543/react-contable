// ============================================================
// Layout.jsx — Plantilla global del sitio (AUX3)
// Sidebar dinámico + header con usuario + timer de sesión
// ============================================================

import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MENU = [
  {
    section: "General",
    items: [
      { path: "/bienvenida", label: "Inicio", icon: "🏠" },
    ],
  },
  {
    section: "Auxiliares",
    items: [
      { path: "/terceros",       label: "Terceros",         icon: "👥" },
      { path: "/centros-costo",  label: "Centros de Costo", icon: "🏷️" },
    ],
  },
  {
    section: "Prorrateo",
    items: [
      { path: "/prorrateo",       label: "Asignar CC",       icon: "📊" },
      { path: "/asignar-terceros", label: "Asignar Terceros", icon: "🤝" },
    ],
  },
  {
    section: "Reportes",
    items: [
      { path: "/reportes/terceros",      label: "Por Tercero",        icon: "📋" },
      { path: "/reportes/centros-costo", label: "Por Centro de Costo",icon: "📉" },
    ],
  },
];

function getInitials(nombre = "") {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

export function Layout({ children, title }) {
  const { usuario, logout } = useAuth();

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <NavLink to="/bienvenida" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src="/logo.png" alt="Logo" style={{ width: "30px", height: "30px", objectFit: "contain" }} />
          <div>
            <div className="sidebar-brand-name">SistemaContable</div>
            <span className="sidebar-brand-sub">Módulo Administradores</span>
          </div>
        </NavLink>

        <nav className="sidebar-nav">
          {MENU.map((group) => (
            <div key={group.section} className="sidebar-section">
              <div className="sidebar-section-label">{group.section}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    "sidebar-link" + (isActive ? " active" : "")
                  }
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {getInitials(usuario?.nombre || usuario?.username || "U")}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {usuario?.nombre || usuario?.username || "Usuario"}
              </div>
              <div className="sidebar-user-role">
                {usuario?.rol || "Administrador"}
              </div>
            </div>
            <button
              className="sidebar-logout"
              onClick={() => logout()}
              title="Cerrar sesión"
            >
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-area">
        <header className="main-header">
          <h1 className="main-header-title">{title || "Sistema Contable"}</h1>
          <div className="main-header-right">
            <div className="header-user">
              <span>👤</span>
              <span>{usuario?.nombre || usuario?.username || "Usuario"}</span>
            </div>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}