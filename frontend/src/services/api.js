const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function apiRequest(endpoint, options = {}) {
  const { headers, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401 && endpoint !== '/auth/login') {
      localStorage.removeItem('access_token');
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' &&
        !window.location.pathname.startsWith('/register') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }

    let errorMessage = 'Something went wrong';
    let errorPayload = null;
    if (data && typeof data === 'object') {
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((err) => (typeof err === 'object' && err.msg ? err.msg : JSON.stringify(err))).join(', ');
      } else if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (data.detail && typeof data.detail === 'object') {
        errorMessage = data.detail.message || JSON.stringify(data.detail);
        errorPayload = data.detail;
      }
    } else if (typeof data === 'string' && data.trim()) {
      errorMessage = data;
    }
    const err = new Error(errorMessage);
    if (errorPayload) {
      err.payload = errorPayload;
    }
    throw err;
  }

  return data;
}

async function apiRequestWithToken(endpoint, token, options = {}) {
  const { headers, ...restOptions } = options;
  return apiRequest(endpoint, {
    ...restOptions,
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export { apiRequest, apiRequestWithToken, API_BASE_URL };