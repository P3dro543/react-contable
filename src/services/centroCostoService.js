// ============================================================
// centroCostoService.js — Servicio para AUX6 + AUX10
// Ruta base: /centrocostos
// Respuesta listar:  { data: [...], total }
// Respuesta reporte: { data: [...], total, suma }
// ============================================================

import { api } from "./api";

export const centroCostoService = {
  // AUX6 — CRUD
  // query param es porPagina (camelCase), igual que el controller
  listar: (pagina = 1, porPagina = 10) =>
    api.get(`/centrocostos?pagina=${pagina}&porPagina=${porPagina}`),

  obtenerPorId: (id) =>
    api.get(`/centrocostos/${id}`),

  crear: (data) =>
    api.post("/centrocostos", data),

  actualizar: (id, data) =>
    api.put(`/centrocostos/${id}`, data),

  eliminar: (id) =>
    api.delete(`/centrocostos/${id}`),

  // AUX10 — Reporte: GET /centrocostos/reporte
  // params: { id_centro_costo, fecha_inicio?, fecha_fin?, id_periodo?, id_estado?, pagina, porPagina }
  reporte: (filtros) => {
    const params = new URLSearchParams(filtros).toString();
    return api.get(`/centrocostos/reporte?${params}`);
  },
};