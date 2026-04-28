// ============================================================
// Toast.jsx — Notificaciones toast (éxito / error)
// ============================================================

import { useEffect } from "react";

export function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{type === "success" ? "✓" : "✕"}</span>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

// Hook simple para manejar toasts
import { useState, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast({ message: "", type: "success" });
  }, []);

  return { toast, showToast, clearToast };
}