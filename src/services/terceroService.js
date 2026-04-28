// ============================================================
// terceroService.js — Servicio para AUX5
// Endpoints: GET/POST/PUT/DELETE /terceros
// ============================================================

import { api } from "./api";

export const terceroService = {
  listar: (pagina = 1, por_pagina = 10) =>
    api.get(`/terceros?pagina=${pagina}&por_pagina=${por_pagina}`),

  obtenerPorId: (id) => api.get(`/terceros/${id}`),

  crear: (data) => api.post("/terceros", data),

  actualizar: (id, data) => api.put(`/terceros/${id}`, data),

  eliminar: (id) => api.delete(`/terceros/${id}`),
};