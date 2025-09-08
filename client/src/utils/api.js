// src/utils/api.js
export const API_BASE = "https://car-invoicing.vercel.app";

export async function authFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  return res;
}

export async function authFetchJSON(path, options) {
  const res = await authFetch(path, options);
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text ? JSON.parse(text) : {};
}
