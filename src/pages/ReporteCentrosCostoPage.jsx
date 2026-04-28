// ============================================================
// ReporteCentrosCostoPage.jsx — Reporte de movimientos por Centro de Costo (AUX10)
// API: GET /centrocostos/reporte
// Params: id_centro_costo (req) + fecha_inicio+fecha_fin | id_periodo + id_estado?, pagina, porPagina
// Respuesta: { data: [...], total, suma }
// Campos fila: consecutivo, codigo_asiento, fecha, referencia, estado_asiento,
//              cuenta, tipo_movimiento, descripcion_linea, monto_prorrateo,
//              centro_costo, codigo_cc
// ============================================================

import { useState, useEffect } from "react";
import { Layout }              from "../components/Layout";
import { Pagination }          from "../components/Pagination";
import { Toast, useToast }     from "../components/Toast";
import { centroCostoService }  from "../services/centroCostoService";

const ESTADOS = [
  { label: "— Todos —",              value: "" },
  { label: "Borrador",               value: "1" },
  { label: "Pendiente de aprobación",value: "2" },
  { label: "Aprobado",               value: "3" },
  { label: "Rechazado",              value: "4" },
  { label: "Anulado",                value: "5" },
];

const MODO_FECHA = [
  { label: "Rango de fechas",  value: "rango" },
  { label: "Período contable", value: "periodo" },
];

function formatMonto(v) {
  if (v == null) return "—";
  return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(v);
}

export function ReporteCentrosCostoPage() {
  const [centros, setCentros]     = useState([]);
  const [modoFecha, setModoFecha] = useState("rango");
  const [filtros, setFiltros]     = useState({
    id_centro_costo: "", fecha_inicio: "", fecha_fin: "",
    id_periodo: "", id_estado: "", pagina: 1, porPagina: 10,
  });
  const [resultado, setResultado] = useState(null);   // { data, total, suma }
  const [loading, setLoading]     = useState(false);
  const [buscado, setBuscado]     = useState(false);
  const [formError, setFormError] = useState("");

  const { toast, showToast, clearToast } = useToast();

  // Cargar centros de costo para el select
  useEffect(() => {
    centroCostoService.listar(1, 200)
      .then((d) => setCentros(d.data || []))
      .catch(() => {});
  }, []);

  const setF = (k, v) => {
    setFiltros((f) => ({ ...f, [k]: v, pagina: 1 }));
    setFormError("");
  };

  const validar = () => {
    if (!filtros.id_centro_costo) return "Debe seleccionar un centro de costo.";
    if (modoFecha === "rango" && (!filtros.fecha_inicio || !filtros.fecha_fin))
      return "Debe indicar fecha inicio y fecha fin.";
    if (modoFecha === "periodo" && !filtros.id_periodo)
      return "Debe indicar el período contable.";
    return "";
  };

  const buscar = async (paginaOverride) => {
    const err = validar();
    if (err) { setFormError(err); return; }

    const p = paginaOverride ?? filtros.pagina;
    setLoading(true);
    setBuscado(true);

    try {
      const params = {
        id_centro_costo: filtros.id_centro_costo,
        pagina: p,
        porPagina: filtros.porPagina,
      };
      if (filtros.id_estado) params.id_estado = filtros.id_estado;
      if (modoFecha === "rango") {
        params.fecha_inicio = filtros.fecha_inicio;
        params.fecha_fin    = filtros.fecha_fin;
      } else {
        params.id_periodo = filtros.id_periodo;
      }

      const data = await centroCostoService.reporte(params);
      setResultado(data);
    } catch (err) {
      showToast(err.message || "Error al generar reporte", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (p) => {
    setFiltros((f) => ({ ...f, pagina: p }));
    buscar(p);
  };

  const rows  = resultado?.data  || [];
  const total = resultado?.total || 0;
  const suma  = resultado?.suma  ?? null;

  return (
    <Layout title="Reporte por Centro de Costo">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reporte por Centro de Costo</h2>
          <p className="page-subtitle">Movimientos de asientos asociados a un centro de costo — AUX10</p>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="filters-card">
        {formError && (
          <div className="alert alert-error" style={{ marginBottom: 14 }}>⚠️ {formError}</div>
        )}

        <div className="filters-grid">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Centro de Costo <span className="required">*</span></label>
            <select
              className="form-control"
              value={filtros.id_centro_costo}
              onChange={(e) => setF("id_centro_costo", e.target.value)}
            >
              <option value="">— Seleccione —</option>
              {centros.map((c) => (
                <option key={c.id_centro_costo} value={c.id_centro_costo}>
                  [{c.codigo}] {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Filtrar por</label>
            <select
              className="form-control"
              value={modoFecha}
              onChange={(e) => setModoFecha(e.target.value)}
            >
              {MODO_FECHA.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Estado del asiento</label>
            <select
              className="form-control"
              value={filtros.id_estado}
              onChange={(e) => setF("id_estado", e.target.value)}
            >
              {ESTADOS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {modoFecha === "rango" ? (
          <div className="filters-grid" style={{ marginTop: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fecha inicio <span className="required">*</span></label>
              <input
                type="date" className="form-control"
                value={filtros.fecha_inicio}
                onChange={(e) => setF("fecha_inicio", e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fecha fin <span className="required">*</span></label>
              <input
                type="date" className="form-control"
                value={filtros.fecha_fin}
                onChange={(e) => setF("fecha_fin", e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 12, maxWidth: 300 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">ID Período contable <span className="required">*</span></label>
              <input
                type="number" className="form-control"
                value={filtros.id_periodo}
                onChange={(e) => setF("id_periodo", e.target.value)}
                placeholder="Ej. 1"
                min={1}
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button className="btn btn-primary" onClick={() => buscar(1)} disabled={loading}>
            {loading ? "Buscando…" : "🔍 Generar reporte"}
          </button>
        </div>
      </div>

      {/* ── Resultados ── */}
      {buscado && (
        <div className="card">
          {resultado && (
            <div className="card-header">
              <span className="card-title">
                🏷️ {centros.find(c => String(c.id_centro_costo) === String(filtros.id_centro_costo))?.nombre || "Centro de Costo"}
              </span>
              <span style={{ fontSize: 13, color: "var(--txt2)" }}>
                {total} movimiento{total !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-wrap"><div className="spinner" /></div>
            ) : rows.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📈</div>
                <div className="empty-state-title">Sin resultados</div>
                <div className="empty-state-desc">No hay movimientos para los filtros aplicados.</div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Asiento</th>
                    <th>Fecha</th>
                    <th>Cuenta</th>
                    <th>Tipo Mov.</th>
                    <th style={{ textAlign: "right" }}>Monto Prorrateo</th>
                    <th>Estado</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 13 }}>
                        {r.consecutivo || r.codigo_asiento || "—"}
                      </td>
                      <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                        {r.fecha ? String(r.fecha).substring(0, 10) : "—"}
                      </td>
                      <td style={{ fontSize: 13 }}>{r.cuenta || "—"}</td>
                      <td>
                        <span className={`badge ${
                          String(r.tipo_movimiento).toLowerCase().includes("deb")
                            ? "badge-warning" : "badge-info"
                        }`}>
                          {r.tipo_movimiento || "—"}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--mono)", textAlign: "right", fontWeight: 500 }}>
                        {formatMonto(r.monto_prorrateo)}
                      </td>
                      <td>
                        <span className="badge badge-gray">{r.estado_asiento || "—"}</span>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--txt2)" }}>
                        {r.descripcion_linea || r.referencia || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {rows.length > 0 && (
            <div className="total-row">
              <span className="total-label">Suma prorrateo:</span>
              <span className="total-amount">{formatMonto(suma)}</span>
            </div>
          )}

          <Pagination
            pagina={filtros.pagina}
            total={total}
            porPagina={10}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </Layout>
  );
}