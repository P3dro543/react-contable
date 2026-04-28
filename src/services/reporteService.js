// ============================================================
// reporteService.js — Servicio para AUX9
// AUX10 usa centroCostoService.reporte() directamente
// ============================================================

import { api } from "./api";

export const reporteService = {
  // AUX9 — Reporte por Tercero
  // GET /reportes/terceros
  // params requeridos: id_tercero + (id_periodo | fecha_inicio + fecha_fin)
  // params opcionales: id_estado, pagina, por_pagina
  // respuesta: { tercero: { id, nombre }, data: [...], total, pagina, por_pagina }
  reporteTercero: (filtros) => {
    // Eliminar claves vacías antes de enviar
    const limpio = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== "" && v != null)
    );
    const params = new URLSearchParams(limpio).toString();
    return api.get(`/reportes/terceros?${params}`);
  },
};