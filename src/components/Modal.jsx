// ============================================================
// Modal.jsx — Modal reutilizable para formularios y confirmaciones
// ============================================================

import { useEffect } from "react";

export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = { sm: "modal-sm", md: "modal-md", lg: "modal-lg" }[size] || "modal-md";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-box ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar acción" size="sm">
      <p className="confirm-msg">{message || "¿Realmente desea eliminar el elemento seleccionado?"}</p>
      <div className="confirm-actions">
        <button className="btn btn-outline" onClick={onClose} disabled={loading}>No</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Eliminando…" : "Sí, eliminar"}
        </button>
      </div>
    </Modal>
  );
}