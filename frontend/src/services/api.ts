import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const contactsAPI = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/contacts', { params }),
  getOne: (id: string) => api.get(`/contacts/${id}`),
  create: (data: FormData) =>
    api.post('/contacts', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/contacts/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/contacts/${id}`),
  toggleFavorite: (id: string) => api.patch(`/contacts/${id}/favorite`),
  export: () =>
    api.get('/contacts/export', { responseType: 'blob' }),
  import: (data: FormData) =>
    api.post('/contacts/import', data, { headers: { 'Content-Type': 'multipart/form-data' } })
};

export const groupsAPI = {
  getAll: () => api.get('/groups'),
  create: (data: { name: string; color: string }) => api.post('/groups', data),
  update: (id: string, data: { name?: string; color?: string }) => api.put(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`)
};

export default api;
