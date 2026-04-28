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

  let data: any;
  try {
    data = await res.json();
  } catch {
    // Server returned non-JSON (e.g. Render 502 HTML page)
    const error = new Error('Server error. Please try again.') as Error & { status: number };
    error.status = res.status;
    throw error;
  }

  if (!res.ok) {
    const errorMessage = typeof data.error === 'string' ? data.error : 'Request failed';
    const error = new Error(errorMessage) as Error & {
      status: number;
      resetInMinutes?: number;
    };
    error.status = res.status;
    if (data.resetInMinutes) error.resetInMinutes = data.resetInMinutes;
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
