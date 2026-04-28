// ============================================================
// direccionService.js — Servicio para AUX11
// Endpoints: /terceros/:id_tercero/direcciones
// ============================================================

import { api } from "./api";

export const direccionService = {
  listar: (idTercero) =>
    api.get(`/terceros/${idTercero}/direcciones`),

  crear: (idTercero, data) =>
    api.post(`/terceros/${idTercero}/direcciones`, data),

  actualizar: (idTercero, idDireccion, data) =>
    api.put(`/terceros/${idTercero}/direcciones/${idDireccion}`, data),

  eliminar: (idTercero, idDireccion) =>
    api.delete(`/terceros/${idTercero}/direcciones/${idDireccion}`),
};