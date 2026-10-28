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

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const err = new Error(
      payload.error ?? payload.message ?? `Request failed (${res.status})`
    );
    err.status = res.status;
    throw err;
  }

  return await res.json();
}