// ============================================================
// CentrosCostoPage.jsx — CRUD de Centros de Costo (AUX6)
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { Layout }              from "../components/Layout";
import { Modal, ConfirmModal } from "../components/Modal";
import { Pagination }          from "../components/Pagination";
import { Toast, useToast }     from "../components/Toast";
import { centroCostoService }  from "../services/centroCostoService";

const INITIAL = { codigo: "", nombre: "", descripcion: "", estado: 1 };

function CentroForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm]     = useState(initial || INITIAL);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.codigo.trim()) e.codigo = "Requerido";
    if (!form.nombre.trim()) e.nombre = "Requerido";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Código <span className="required">*</span></label>
          <input
            className={`form-control ${errors.codigo ? "error" : ""}`}
            value={form.codigo}
            onChange={(e) => set("codigo", e.target.value)}
            placeholder="Ej. CC-001"
            style={{ fontFamily: "var(--mono)" }}
          />
          {errors.codigo && <div className="form-error">{errors.codigo}</div>}
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
      </div>

      <div className="form-group">
        <label className="form-label">Nombre <span className="required">*</span></label>
        <input
          className={`form-control ${errors.nombre ? "error" : ""}`}
          value={form.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          placeholder="Nombre del centro de costo"
        />
        {errors.nombre && <div className="form-error">{errors.nombre}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Descripción</label>
        <textarea
          className="form-control"
          rows={3}
          value={form.descripcion || ""}
          onChange={(e) => set("descripcion", e.target.value)}
          placeholder="Descripción opcional..."
          style={{ resize: "vertical" }}
        />
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

export function CentrosCostoPage() {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [pagina, setPagina]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen]     = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId]       = useState(null);

  const { toast, showToast, clearToast } = useToast();

  const cargar = useCallback(async (p = pagina) => {
    setLoading(true);
    try {
      const res = await centroCostoService.listar(p);
      setRows(res.data || []);       // el repo devuelve { data, total }
      setTotal(res.total || 0);
    } catch (err) {
      showToast(err.message || "Error al cargar centros de costo", "error");
    } finally {
      setLoading(false);
    }
  }, [pagina]);

  useEffect(() => { cargar(pagina); }, [pagina]);

  const handleGuardar = async (form) => {
    setSaving(true);
    try {
      if (editItem) {
        await centroCostoService.actualizar(editItem.id_centro_costo, form);
        showToast("Centro de costo actualizado.", "success");
      } else {
        await centroCostoService.crear(form);
        showToast("Centro de costo creado.", "success");
      }
      setModalOpen(false);
      cargar(pagina);
    } catch (err) {
      showToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarConfirm = async () => {
    setDeleting(true);
    try {
      await centroCostoService.eliminar(deleteId);
      showToast("Centro de costo eliminado.", "success");
      setConfirmOpen(false);
      cargar(pagina);
    } catch (err) {
      showToast(err.message || "Error al eliminar", "error");
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout title="Centros de Costo">
      <div className="page-header">
        <div>
          <h2 className="page-title">Centros de Costo</h2>
          <p className="page-subtitle">Administración de centros de costo del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setModalOpen(true); }}>
          + Nuevo Centro
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : rows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏷️</div>
              <div className="empty-state-title">Sin centros de costo registrados</div>
              <div className="empty-state-desc">Haga clic en "Nuevo Centro" para agregar el primero.</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id_centro_costo}>
                    <td style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: 13 }}>{r.codigo}</td>
                    <td style={{ fontWeight: 500 }}>{r.nombre}</td>
                    <td style={{ color: "var(--txt2)", fontSize: 13 }}>{r.descripcion || "—"}</td>
                    <td>
                      <span className={`badge ${r.estado ? "badge-success" : "badge-danger"}`}>
                        {r.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => { setEditItem(r); setModalOpen(true); }}
                        >✏️</button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => { setDeleteId(r.id_centro_costo); setConfirmOpen(true); }}
                        >🗑️</button>
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Editar Centro de Costo" : "Nuevo Centro de Costo"}
        size="md"
      >
        <CentroForm
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