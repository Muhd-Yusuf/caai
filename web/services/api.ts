const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || 'Request failed') as Error & {
      status: number;
      resetInHours?: number;
    };
    error.status = res.status;
    if (data.resetInHours) error.resetInHours = data.resetInHours;
    throw error;
  }

  return data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
