const API_URL = import.meta.env.VITE_API_URL;

export async function apiClient(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {};

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error ?? `Request failed (${res.status})`);
  }

  return await res.json();
}