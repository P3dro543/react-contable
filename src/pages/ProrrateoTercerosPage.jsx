import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { Layout } from '../components/Layout';
import { ProrrateoModal } from '../components/ProrrateoModal.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { Toast } from '../components/Toast.jsx';

export function ProrrateoTercerosPage() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [asientos, setAsientos] = useState([]);
  const [terceros, setTerceros] = useState([]);
  const [expandedAsiento, setExpandedAsiento] = useState(null);
  const [asientoDetails, setAsientoDetails] = useState({});
  const [modalConfig, setModalConfig] = useState({ isOpen: false, lineData: null, initialData: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchPeriods();
    fetchTerceros();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchAsientos(selectedPeriod);
    }
  }, [selectedPeriod]);

  const fetchPeriods = async () => {
    try {
      const response = await axiosInstance.get('/api/periodos/prorrateo');
      const periodList = response.data.data || response.data;
      if (Array.isArray(periodList)) {
        setPeriods(periodList);
      } else {
        setPeriods([]);
      }
    } catch (err) {
      console.error("Error al cargar periodos", err);
    }
  };

  const fetchTerceros = async () => {
    try {
      const response = await axiosInstance.get('/terceros');
      // Pedro devuelve { rows: [...], total: ... } para terceros
      const tList = response.data.rows || response.data.data || response.data;
      if (Array.isArray(tList)) {
        const formatted = tList.map(t => ({
          id: t.id_tercero,
          label: `${t.identificacion || 'S/I'} - ${t.nombre || 'Sin Nombre'}`
        }));
        setTerceros(formatted);
      } else {
        setTerceros([]);
      }
    } catch (err) {
      console.error("Error al cargar terceros", err);
    }
  };

  const fetchAsientos = async (periodId) => {
    try {
      const response = await axiosInstance.get(`/api/asientos/${periodId}`);
      const asList = response.data.data || response.data;
      if (Array.isArray(asList)) {
        setAsientos(asList);
      } else {
        setAsientos([]);
      }
    } catch (err) {
      console.error("Error al cargar asientos", err);
    }
  };

  const toggleAsiento = async (asientoId) => {
    if (expandedAsiento === asientoId) {
      setExpandedAsiento(null);
      return;
    }
    setExpandedAsiento(asientoId);
    if (!asientoDetails[asientoId]) {
      try {
        const response = await axiosInstance.get(`/api/asientos/detalle/${asientoId}`);
        const details = response.data.data || response.data;
        if (Array.isArray(details)) {
          setAsientoDetails({ ...asientoDetails, [asientoId]: details });
        }
      } catch (err) {
        console.error("Error al cargar detalle", err);
      }
    }
  };

  const openProrrateoModal = async (line) => {
    try {
      const response = await axiosInstance.get(`/api/prorrateo/terceros/${line.id_detalle}`);
      const initialData = response.data.data || response.data || [];
      setModalConfig({ isOpen: true, lineData: line, initialData: Array.isArray(initialData) ? initialData : [] });
    } catch (err) {
      setModalConfig({ isOpen: true, lineData: line, initialData: [] });
    }
  };

  const handleSaveProrrateo = async (distribution) => {
    try {
      const payload = {
        id_detalle: modalConfig.lineData.id_detalle,
        distribucion: distribution,
        tipo: 'TERCERO'
      };
      const response = await axiosInstance.post('/api/prorrateo', payload);
      if (response.status === 200) {
        setToast({ message: "Tercero asignado correctamente", type: "success" });
        setModalConfig({ isOpen: false, lineData: null, initialData: [] });
      }
    } catch (err) {
      setToast({ message: "Error al asignar tercero", type: "error" });
    }
  };

  const getStatusBadge = (statusId) => {
    const statuses = {
      1: { label: 'Borrador', class: 'badge-gray' },
      2: { label: 'Pendiente', class: 'badge-warning' },
      3: { label: 'Aprobado', class: 'badge-success' },
      4: { label: 'Rechazado', class: 'badge-danger' },
      5: { label: 'Anulado', class: 'badge-danger' }
    };
    const s = statuses[statusId] || { label: 'Desconocido', class: 'badge-gray' };
    return <span className={`badge ${s.class}`}>{s.label}</span>;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAsientos = asientos.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Layout title="Asignación de Terceros">
      <div className="prorrateo-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Asignación de Terceros</h1>
            <p className="page-subtitle">Vincule cada línea de asiento a un tercero específico.</p>
          </div>
        </div>

        <div className="filters-card">
          <div className="form-group" style={{ maxWidth: '400px', marginBottom: 0 }}>
            <label className="form-label">Periodo Contable</label>
            <select 
              className="form-control" 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="">-- Seleccione un periodo --</option>
              {periods.map(p => (
                <option key={p.id_periodo} value={p.id_periodo}>
                  {p.anio} - Mes {p.mes}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Código/Ref</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {asientos.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <div className="empty-state-icon">📂</div>
                      <p className="empty-state-title">No hay asientos seleccionados</p>
                      <p className="empty-state-desc">Seleccione un periodo para ver los asientos disponibles.</p>
                    </td>
                  </tr>
                )}
                {currentAsientos.map(asiento => {
                  const id = asiento.id_asiento || asiento.ID_Asiento || asiento.id || asiento.ID;
                  const codigo = asiento.codigo || asiento.Codigo || asiento.Consecutivo || (asiento.consecutivo ? `CON-${asiento.consecutivo}` : `ID-${id}`);
                  const fecha = asiento.fecha || asiento.Fecha;

                  return (
                    <React.Fragment key={id}>
                      <tr onClick={() => toggleAsiento(id)} style={{ cursor: 'pointer' }}>
                        <td>{expandedAsiento === id ? '▼' : '▶'}</td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{codigo}</div>
                          <div style={{ fontSize: '11px', color: 'var(--txt3)' }}>{asiento.referencia || asiento.Referencia || asiento.descripcion || asiento.Descripcion || asiento.glosa || asiento.Glosa || asiento.Detalle || 'Sin descripción'}</div>
                        </td>
                        <td>{fecha ? new Date(fecha).toLocaleDateString() : 'N/A'}</td>
                        <td>{getStatusBadge(asiento.id_estado || asiento.id_Estado || asiento.Estado || asiento.ID_Estado || 1)}</td>
                      </tr>
                      {expandedAsiento === id && (
                      <tr>
                        <td colSpan="5" style={{ padding: '0', background: 'var(--bg2)' }}>
                          <div style={{ padding: '15px 30px' }}>
                            <table className="table" style={{ background: 'var(--surface)' }}>
                              <thead>
                                <tr>
                                  <th>Cuenta</th>
                                  <th>Descripción</th>
                                  <th style={{ textAlign: 'right' }}>Monto</th>
                                  <th style={{ textAlign: 'center' }}>Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(asientoDetails[id] || []).map(line => (
                                  <tr key={line.id_detalle}>
                                    <td>{line.codigo_cuenta}</td>
                                    <td>{line.descripcion}</td>
                                    <td style={{ textAlign: 'right' }}>${parseFloat(line.monto).toFixed(2)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                      {(asiento.id_estado === 1 || asiento.id_estado === 2 || asiento.Estado === 1 || asiento.Estado === 2) ? (
                                        <button 
                                          className="btn btn-primary btn-sm"
                                          onClick={(e) => { e.stopPropagation(); openProrrateoModal(line); }}
                                        >
                                          Asignar Tercero
                                        </button>
                                      ) : (
                                        <span style={{ fontSize: '12px', color: 'var(--txt3)' }}>🔒 Bloqueado</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination 
            pagina={currentPage} 
            total={asientos.length} 
            onPageChange={setCurrentPage} 
          />
        </div>

        {modalConfig.isOpen && (
          <ProrrateoModal
            isOpen={modalConfig.isOpen}
            onClose={() => setModalConfig({ isOpen: false, lineData: null, initialData: [] })}
            onSave={handleSaveProrrateo}
            title={`Distribución Terceros - ${modalConfig.lineData.descripcion}`}
            totalAmount={parseFloat(modalConfig.lineData.monto)}
            options={terceros}
            initialData={modalConfig.initialData}
            type="Tercero"
          />
        )}
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </Layout>
  );
}
