const formatUrl = (url) => {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${url}`;
};

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  async get(url) {
    const res = await fetch(formatUrl(url), {
      headers: {
        ...getAuthHeader()
      }
    });
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Request failed');
    }
    return await res.json();
  },

  async post(url, body, isJson = true) {
    const headers = { ...getAuthHeader() };
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(formatUrl(url), {
      method: 'POST',
      headers,
      body: isJson ? JSON.stringify(body) : body
    });
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Request failed');
    }
    return await res.json();
  },

  async put(url, body) {
    const res = await fetch(formatUrl(url), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(body)
    });
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Request failed');
    }
    return await res.json();
  },

  async delete(url) {
    const res = await fetch(formatUrl(url), {
      method: 'DELETE',
      headers: {
        ...getAuthHeader()
      }
    });
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Request failed');
    }
    return await res.json();
  }
};
