// ============================================================
// DireccionesPage.jsx — CRUD de Direcciones de un Tercero (AUX11)
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Layout }              from "../components/Layout";
import { Modal, ConfirmModal } from "../components/Modal";
import { Toast, useToast }     from "../components/Toast";
import { direccionService }    from "../services/direccionService";

const INITIAL = {
  alias: "", provincia: "", canton: "", distrito: "",
  direccion_exacta: "", estado: 1, principal: 0,
};

function DireccionForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm]     = useState(initial || INITIAL);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.alias?.trim())            e.alias            = "Requerido";
    if (!form.direccion_exacta?.trim()) e.direccion_exacta = "Requerida";
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
          <label className="form-label">Alias <span className="required">*</span></label>
          <input
            className={`form-control ${errors.alias ? "error" : ""}`}
            value={form.alias || ""}
            onChange={(e) => set("alias", e.target.value)}
            placeholder='Ej. "Casa", "Oficina"'
          />
          {errors.alias && <div className="form-error">{errors.alias}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Estado</label>
          <select
            className="form-control"
            value={form.estado}
            onChange={(e) => set("estado", Number(e.target.value))}
          >
            <option value={1}>Activa</option>
            <option value={0}>Inactiva</option>
          </select>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Provincia</label>
          <input
            className="form-control"
            value={form.provincia || ""}
            onChange={(e) => set("provincia", e.target.value)}
            placeholder="Ej. San José"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cantón</label>
          <input
            className="form-control"
            value={form.canton || ""}
            onChange={(e) => set("canton", e.target.value)}
            placeholder="Ej. Cartago"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Distrito</label>
        <input
          className="form-control"
          value={form.distrito || ""}
          onChange={(e) => set("distrito", e.target.value)}
          placeholder="Ej. El Guarco"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Dirección exacta <span className="required">*</span></label>
        <textarea
          className={`form-control ${errors.direccion_exacta ? "error" : ""}`}
          rows={3}
          value={form.direccion_exacta || ""}
          onChange={(e) => set("direccion_exacta", e.target.value)}
          placeholder="200m norte de la iglesia..."
          style={{ resize: "vertical" }}
        />
        {errors.direccion_exacta && <div className="form-error">{errors.direccion_exacta}</div>}
      </div>

      <div className="form-group">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!form.principal}
            onChange={(e) => set("principal", e.target.checked ? 1 : 0)}
          />
          <span className="form-label" style={{ margin: 0 }}>Marcar como dirección principal</span>
        </label>
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

export function DireccionesPage() {
  const { id_tercero }       = useParams();
  const location             = useLocation();
  const navigate             = useNavigate();
  const tercero              = location.state?.tercero;

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen]     = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId]       = useState(null);

  const { toast, showToast, clearToast } = useToast();

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await direccionService.listar(id_tercero);
      setRows(Array.isArray(data) ? data : data.rows || []);
    } catch (err) {
      showToast(err.message || "Error al cargar direcciones", "error");
    } finally {
      setLoading(false);
    }
  }, [id_tercero]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleGuardar = async (form) => {
    setSaving(true);
    try {
      if (editItem) {
        await direccionService.actualizar(id_tercero, editItem.id_direccion, form);
        showToast("Dirección actualizada.", "success");
      } else {
        await direccionService.crear(id_tercero, form);
        showToast("Dirección creada.", "success");
      }
      setModalOpen(false);
      cargar();
    } catch (err) {
      showToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarConfirm = async () => {
    setDeleting(true);
    try {
      await direccionService.eliminar(id_tercero, deleteId);
      showToast("Dirección eliminada.", "success");
      setConfirmOpen(false);
      cargar();
    } catch (err) {
      showToast(err.message || "Error al eliminar", "error");
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout title="Direcciones">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => navigate("/terceros")}>Terceros</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">
          Direcciones — {tercero?.nombre || `#${id_tercero}`}
        </span>
      </div>

      <div className="page-header">
        <div>
          <h2 className="page-title">Direcciones</h2>
          <p className="page-subtitle">
            {tercero?.nombre || ""} · {tercero?.identificacion || ""}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setModalOpen(true); }}>
          + Nueva Dirección
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : rows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📍</div>
              <div className="empty-state-title">Sin direcciones registradas</div>
              <div className="empty-state-desc">Agregue la primera dirección para este tercero.</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Alias</th>
                  <th>Provincia / Cantón / Distrito</th>
                  <th>Dirección exacta</th>
                  <th>Principal</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id_direccion}>
                    <td style={{ fontWeight: 600 }}>{r.alias}</td>
                    <td style={{ fontSize: 13, color: "var(--txt2)" }}>
                      {[r.provincia, r.canton, r.distrito].filter(Boolean).join(" / ") || "—"}
                    </td>
                    <td style={{ fontSize: 13 }}>{r.direccion_exacta}</td>
                    <td>
                      {r.principal
                        ? <span className="badge badge-info">Principal</span>
                        : <span style={{ color: "var(--txt3)", fontSize: 13 }}>—</span>}
                    </td>
                    <td>
                      <span className={`badge ${r.estado ? "badge-success" : "badge-danger"}`}>
                        {r.estado ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(r); setModalOpen(true); }}>✏️</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setDeleteId(r.id_direccion); setConfirmOpen(true); }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Editar Dirección" : "Nueva Dirección"}
        size="md"
      >
        <DireccionForm
          initial={editItem}
          onSubmit={handleGuardar}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      </Modal>

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