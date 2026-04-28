// ============================================================
// contactoService.js — Servicio para AUX12
// Endpoints: /terceros/:id_tercero/contactos
// ============================================================

import { api } from "./api";

export const contactoService = {
  listar: (idTercero) =>
    api.get(`/terceros/${idTercero}/contactos`),

  crear: (idTercero, data) =>
    api.post(`/terceros/${idTercero}/contactos`, data),

  actualizar: (idTercero, idContacto, data) =>
    api.put(`/terceros/${idTercero}/contactos/${idContacto}`, data),

  eliminar: (idTercero, idContacto) =>
    api.delete(`/terceros/${idTercero}/contactos/${idContacto}`),
};