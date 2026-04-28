// ============================================================
// TercerosPage.jsx — CRUD completo de Terceros (AUX5)
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout }          from "../components/Layout";
import { Modal, ConfirmModal } from "../components/Modal";
import { Pagination }      from "../components/Pagination";
import { Toast, useToast } from "../components/Toast";
import { terceroService }  from "../services/terceroService";

const TIPOS   = ["Cliente", "Proveedor", "Empleado", "Otro"];
const INITIAL  = { identificacion: "", nombre: "", tipo: "Cliente", correo: "", telefono: "", estado: 1 };

// ── Formulario ────────────────────────────────────────────
function TerceroForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm]     = useState(initial || INITIAL);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.identificacion.trim()) e.identificacion = "Requerido";
    if (!form.nombre.trim())         e.nombre         = "Requerido";
    if (!form.tipo)                  e.tipo            = "Requerido";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Identificación <span className="required">*</span></label>
          <input
            className={`form-control ${errors.identificacion ? "error" : ""}`}
            value={form.identificacion}
            onChange={(e) => set("identificacion", e.target.value)}
            placeholder="Ej. 1-2345-6789"
          />
          {errors.identificacion && <div className="form-error">{errors.identificacion}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Tipo <span className="required">*</span></label>
          <select
            className={`form-control ${errors.tipo ? "error" : ""}`}
            value={form.tipo}
            onChange={(e) => set("tipo", e.target.value)}
          >
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
          {errors.tipo && <div className="form-error">{errors.tipo}</div>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Nombre / Razón Social <span className="required">*</span></label>
        <input
          className={`form-control ${errors.nombre ? "error" : ""}`}
          value={form.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          placeholder="Nombre completo o razón social"
        />
        {errors.nombre && <div className="form-error">{errors.nombre}</div>}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Correo</label>
          <input
            className="form-control"
            type="email"
            value={form.correo || ""}
            onChange={(e) => set("correo", e.target.value)}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Teléfono</label>
          <input
            className="form-control"
            value={form.telefono || ""}
            onChange={(e) => set("telefono", e.target.value)}
            placeholder="8888-8888"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Estado</label>
        <select
          className="form-control"
          value={form.estado}
          onChange={(e) => set("estado", Number(e.target.value))}
        >
          <option value={1}>Activo</option>
          <option value={0}>Inactivo</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

// ── Página principal ──────────────────────────────────────
export function TercerosPage() {
  const navigate = useNavigate();

  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [pagina, setPagina]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Modales
  const [modalOpen, setModalOpen]     = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId]       = useState(null);

  const { toast, showToast, clearToast } = useToast();

  // ── Cargar datos ────────────────────────────────────────
  const cargar = useCallback(async (p = pagina) => {
    setLoading(true);
    try {
      const data = await terceroService.listar(p);
      setRows(data.rows || []);
      setTotal(data.total || 0);
    } catch (err) {
      showToast(err.message || "Error al cargar terceros", "error");
    } finally {
      setLoading(false);
    }
  }, [pagina]);

  useEffect(() => { cargar(pagina); }, [pagina]);

  // ── Abrir modal nuevo ───────────────────────────────────
  const handleNuevo = () => { setEditItem(null); setModalOpen(true); };

  // ── Abrir modal editar ──────────────────────────────────
  const handleEditar = (item) => { setEditItem(item); setModalOpen(true); };

  // ── Guardar (crear o actualizar) ─────────────────────────
  const handleGuardar = async (form) => {
    setSaving(true);
    try {
      if (editItem) {
        await terceroService.actualizar(editItem.id_tercero, form);
        showToast("Tercero actualizado exitosamente.", "success");
      } else {
        await terceroService.crear(form);
        showToast("Tercero creado exitosamente.", "success");
      }
      setModalOpen(false);
      cargar(pagina);
    } catch (err) {
      showToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Confirmar eliminar ──────────────────────────────────
  const handleEliminarClick = (id) => { setDeleteId(id); setConfirmOpen(true); };

  const handleEliminarConfirm = async () => {
    setDeleting(true);
    try {
      await terceroService.eliminar(deleteId);
      showToast("Tercero eliminado exitosamente.", "success");
      setConfirmOpen(false);
      cargar(pagina);
    } catch (err) {
      showToast(err.message || "Error al eliminar", "error");
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const tipoBadge = (tipo) => {
    const map = { Cliente: "badge-info", Proveedor: "badge-warning", Empleado: "badge-success", Otro: "badge-gray" };
    return map[tipo] || "badge-gray";
  };

  return (
    <Layout title="Terceros">
      <div className="page-header">
        <div>
          <h2 className="page-title">Terceros</h2>
          <p className="page-subtitle">Administración de clientes, proveedores y empleados</p>
        </div>
        <button className="btn btn-primary" onClick={handleNuevo}>
          + Nuevo Tercero
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : rows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">Sin terceros registrados</div>
              <div className="empty-state-desc">Haga clic en "Nuevo Tercero" para agregar el primero.</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Identificación</th>
                  <th>Nombre / Razón Social</th>
                  <th>Tipo</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id_tercero}>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{r.identificacion}</td>
                    <td style={{ fontWeight: 500 }}>{r.nombre}</td>
                    <td><span className={`badge ${tipoBadge(r.tipo)}`}>{r.tipo}</span></td>
                    <td style={{ color: "var(--txt2)", fontSize: 13 }}>{r.correo || "—"}</td>
                    <td style={{ color: "var(--txt2)", fontSize: 13 }}>{r.telefono || "—"}</td>
                    <td>
                      <span className={`badge ${r.estado ? "badge-success" : "badge-danger"}`}>
                        {r.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Direcciones"
                          onClick={() => navigate(`/terceros/${r.id_tercero}/direcciones`, { state: { tercero: r } })}
                        >
                          📍
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Contactos"
                          onClick={() => navigate(`/terceros/${r.id_tercero}/contactos`, { state: { tercero: r } })}
                        >
                          📞
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Editar"
                          onClick={() => handleEditar(r)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Eliminar"
                          onClick={() => handleEliminarClick(r.id_tercero)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          pagina={pagina}
          total={total}
          porPagina={10}
          onPageChange={(p) => setPagina(p)}
        />
      </div>

      {/* ── Modal Crear/Editar ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Editar Tercero" : "Nuevo Tercero"}
        size="md"
      >
        <TerceroForm
          initial={editItem}
          onSubmit={handleGuardar}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      </Modal>

      {/* ── Modal Confirmar Eliminar ── */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleEliminarConfirm}
        loading={deleting}
      />

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </Layout>
  );
}