import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bbms_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
};

export const donationService = {
  create: async (payload) => {
    const { data } = await api.post('/donations', payload);
    return data;
  },
  getMyDonations: async () => {
    const { data } = await api.get('/donations/my');
    return data;
  },
};

export const donorService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/donors', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/donors/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/donors', payload);
    return data;
  },
  updateStatus: async (id, status, reason) => {
    const { data } = await api.put(`/donors/${id}/status`, { status, reason });
    return data;
  },
};

export const requestService = {
  create: async (payload) => {
    const { data } = await api.post('/requests', payload);
    return data;
  },
  getMyRequests: async () => {
    const { data } = await api.get('/requests/my');
    return data;
  },
  cancel: async (id) => {
    const { data } = await api.put(`/requests/${id}/cancel`);
    return data;
  },
  getAll: async () => {
    const { data } = await api.get('/requests');
    return data;
  },
  updateStatus: async (id, status) => {
    const { data } = await api.put(`/requests/${id}/status`, { status });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/requests/${id}`);
    return data;
  },
};

export const inventoryService = {
  get: async () => {
    const { data } = await api.get('/inventory');
    return data;
  },
};

export const bloodbankService = {
  getInfo: async () => {
    const { data } = await api.get('/bloodbank/info');
    return data;
  },
  getStats: async () => {
    const { data } = await api.get('/bloodbank/stats');
    return data;
  },
};

export const adminService = {
  getStats: async () => {
    const { data } = await api.get('/admin/stats');
    return data;
  },
};

export default api;
