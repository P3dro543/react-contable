// ============================================================
// ContactosPage.jsx — CRUD de Contactos de un Tercero (AUX12)
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Layout }              from "../components/Layout";
import { Modal, ConfirmModal } from "../components/Modal";
import { Toast, useToast }     from "../components/Toast";
import { contactoService }     from "../services/contactoService";

const TIPOS_CONTACTO = ["Principal", "Facturacion", "Cobros", "Soporte", "Otro"];
const INITIAL = {
  nombre: "", cargo: "", email: "", telefono: "",
  tipo_contacto: "Principal", estado: "Activo",
};

function ContactoForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm]     = useState(initial || INITIAL);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = "Requerido";
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
          <label className="form-label">Nombre del contacto <span className="required">*</span></label>
          <input
            className={`form-control ${errors.nombre ? "error" : ""}`}
            value={form.nombre || ""}
            onChange={(e) => set("nombre", e.target.value)}
            placeholder="Nombre completo"
          />
          {errors.nombre && <div className="form-error">{errors.nombre}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Cargo / Rol</label>
          <input
            className="form-control"
            value={form.cargo || ""}
            onChange={(e) => set("cargo", e.target.value)}
            placeholder="Ej. Gerente de Compras"
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            type="email"
            value={form.email || ""}
            onChange={(e) => set("email", e.target.value)}
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

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Tipo de contacto</label>
          <select
            className="form-control"
            value={form.tipo_contacto || "Principal"}
            onChange={(e) => set("tipo_contacto", e.target.value)}
          >
            {TIPOS_CONTACTO.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Estado</label>
          <select
            className="form-control"
            value={form.estado}
            onChange={(e) => set("estado", e.target.value)}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
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

export function ContactosPage() {
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
      const data = await contactoService.listar(id_tercero);
      setRows(Array.isArray(data) ? data : data.rows || []);
    } catch (err) {
      showToast(err.message || "Error al cargar contactos", "error");
    } finally {
      setLoading(false);
    }
  }, [id_tercero]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleGuardar = async (form) => {
    setSaving(true);
    try {
      if (editItem) {
        await contactoService.actualizar(id_tercero, editItem.id_contacto, form);
        showToast("Contacto actualizado.", "success");
      } else {
        await contactoService.crear(id_tercero, form);
        showToast("Contacto creado.", "success");
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
      await contactoService.eliminar(id_tercero, deleteId);
      showToast("Contacto eliminado.", "success");
      setConfirmOpen(false);
      cargar();
    } catch (err) {
      showToast(err.message || "Error al eliminar", "error");
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const tipoBadge = (tipo) => {
    const map = {
      Principal: "badge-info", Facturación: "badge-warning",
      Cobros: "badge-success", Soporte: "badge-gray", Otro: "badge-gray",
    };
    return map[tipo] || "badge-gray";
  };

  return (
    <Layout title="Contactos">
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => navigate("/terceros")}>Terceros</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">
          Contactos — {tercero?.nombre || `#${id_tercero}`}
        </span>
      </div>

      <div className="page-header">
        <div>
          <h2 className="page-title">Contactos</h2>
          <p className="page-subtitle">
            {tercero?.nombre || ""} · {tercero?.identificacion || ""}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setModalOpen(true); }}>
          + Nuevo Contacto
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : rows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📞</div>
              <div className="empty-state-title">Sin contactos registrados</div>
              <div className="empty-state-desc">Agregue el primer contacto para este tercero.</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Tipo</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id_contacto}>
                    <td style={{ fontWeight: 600 }}>{r.nombre}</td>
                    <td style={{ fontSize: 13, color: "var(--txt2)" }}>{r.cargo || "—"}</td>
                    <td><span className={`badge ${tipoBadge(r.tipo_contacto)}`}>{r.tipo_contacto}</span></td>
                    <td style={{ fontSize: 13, color: "var(--txt2)" }}>{r.email || "—"}</td>
                    <td style={{ fontSize: 13, color: "var(--txt2)" }}>{r.telefono || "—"}</td>
                    <td>
                      <span className={`badge ${r.estado === "Activo" ? "badge-success" : "badge-danger"}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(r); setModalOpen(true); }}>✏️</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setDeleteId(r.id_contacto); setConfirmOpen(true); }}>🗑️</button>
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
        title={editItem ? "Editar Contacto" : "Nuevo Contacto"}
        size="md"
      >
        <ContactoForm
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