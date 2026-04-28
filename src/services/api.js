// ============================================================
// api.js — Cliente HTTP centralizado
// Base URL apunta al backend en Render
// ============================================================

const BASE_URL = "https://backend-sistema-contable.onrender.com";

const getToken = () => localStorage.getItem("token");

async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || "Error en la solicitud");
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  get:    (path)        => request("GET",    path),
  post:   (path, body)  => request("POST",   path, body),
  put:    (path, body)  => request("PUT",    path, body),
  delete: (path)        => request("DELETE", path),
};