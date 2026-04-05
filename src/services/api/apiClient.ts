const BASE_URL = '/api/v1';

let authToken: string | null = null;
let refreshTokenStr: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('medsmart_token', token);
  } else {
    localStorage.removeItem('medsmart_token');
  }
}

export function setRefreshToken(token: string | null) {
  refreshTokenStr = token;
  if (token) {
    localStorage.setItem('medsmart_refresh_token', token);
  } else {
    localStorage.removeItem('medsmart_refresh_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('medsmart_token');
  }
  return authToken;
}

export function getRefreshToken(): string | null {
  if (!refreshTokenStr) {
    refreshTokenStr = localStorage.getItem('medsmart_refresh_token');
  }
  return refreshTokenStr;
}

export function clearTokens() {
  authToken = null;
  refreshTokenStr = null;
  localStorage.removeItem('medsmart_token');
  localStorage.removeItem('medsmart_refresh_token');
}

async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    setAuthToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Token muddati tugagan bo'lsa, refresh qilish
  if (response.status === 401 && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefresh().then((success) => {
        isRefreshing = false;
        if (!success) {
          // Login sahifasiga yo'naltirish
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      });
    }

    await refreshPromise;

    // Yangi token bilan qayta urinish
    const newToken = getAuthToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Server xatosi' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: any) => request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data?: any) => request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(path: string, data?: any) => request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Content-Type ni qo'ymaslik kerak — browser o'zi multipart/form-data qo'yadi
    return request<T>(path, { method: 'POST', body: formData, headers });
  },
};
