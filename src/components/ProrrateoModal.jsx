import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

export function ProrrateoModal({ isOpen, onClose, onSave, title, totalAmount, options, initialData = [], type, singleSelection = false }) {
  const [distribution, setDistribution] = useState([{ _id: Math.random(), id: '', amount: 0 }]);
  const [remainingAmount, setRemainingAmount] = useState(totalAmount);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setDistribution(initialData.map(item => ({
        _id: Math.random(),
        id: type === 'CC' ? item.id_centro_costo : item.id_tercero,
        amount: parseFloat(item.monto)
      })));
    } else {
      setDistribution(singleSelection ? [{ _id: Math.random(), id: '', amount: totalAmount }] : [{ _id: Math.random(), id: '', amount: 0 }]);
    }
  }, [initialData, type, isOpen, singleSelection, totalAmount]);

  useEffect(() => {
    const currentTotal = distribution.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    setRemainingAmount(totalAmount - currentTotal);
  }, [distribution, totalAmount]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setDistribution([...distribution, { _id: Math.random(), id: '', amount: 0 }]);
  };

  const handleRemoveRow = (idToRemove) => {
    const newDist = distribution.filter(d => d._id !== idToRemove);
    setDistribution(newDist.length ? newDist : [{ _id: Math.random(), id: '', amount: 0 }]);
  };

  const handleChange = (idToChange, field, value) => {
    setDistribution(distribution.map(d => d._id === idToChange ? { ...d, [field]: value } : d));
  };

  const isComplete = Math.abs(remainingAmount) < 0.01 && distribution.every(d => d.id && d.amount > 0);

  const handleSave = () => {
    if (isComplete) {
      const dataToSave = distribution.map(d => ({
        [type === 'CC' ? 'id_centro_costo' : 'id_tercero']: parseInt(d.id),
        monto: parseFloat(d.amount)
      }));
      onSave(dataToSave);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>Total a distribuir: <strong>${totalAmount.toFixed(2)}</strong></div>
            <div className={remainingAmount === 0 ? 'badge badge-success' : 'badge badge-warning'}>
              Pendiente: ${remainingAmount.toFixed(2)}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            {distribution.map((item) => (
              <div key={item._id} className="form-grid" style={{ marginBottom: '12px', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Seleccione {type === 'CC' ? 'Centro de Costo' : 'Tercero'}</label>
                  <select 
                    className="form-control"
                    value={item.id} 
                    onChange={(e) => handleChange(item._id, 'id', e.target.value)}
                  >
                    <option value="">-- Seleccione --</option>
                    {options.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Monto</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      className="form-control"
                      type="number" 
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => handleChange(item._id, 'amount', e.target.value)}
                      placeholder="0.00"
                      disabled={singleSelection}
                    />
                    <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveRow(item._id)} title="Eliminar">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!singleSelection && (
            <button className="btn btn-outline btn-sm" onClick={handleAddRow} style={{ marginTop: '10px' }}>
              + Agregar Línea
            </button>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '15px 18px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button 
            className="btn btn-primary" 
            disabled={!isComplete}
            onClick={handleSave}
          >
            Guardar Prorrateo
          </button>
        </div>
      </div>
    </div>
  );
}
