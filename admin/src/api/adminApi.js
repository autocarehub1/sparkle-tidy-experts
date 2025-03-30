import axios from 'axios';

// Create an axios instance with base URL
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.sparkletidy.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/admin/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUser');
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/admin/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Client services
export const clientService = {
  getClients: async (params) => {
    try {
      const response = await api.get('/admin/clients', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getClientById: async (id) => {
    try {
      const response = await api.get(`/admin/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Contractor services
export const contractorService = {
  getContractors: async (params) => {
    try {
      const response = await api.get('/admin/contractors', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getContractorById: async (id) => {
    try {
      const response = await api.get(`/admin/contractors/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Appointment services
export const appointmentService = {
  getAppointments: async (params) => {
    try {
      const response = await api.get('/admin/appointments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getAppointmentById: async (id) => {
    try {
      const response = await api.get(`/admin/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateAppointmentStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/appointments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Service management
export const serviceManagementService = {
  getServices: async () => {
    try {
      const response = await api.get('/admin/services');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateService: async (id, serviceData) => {
    try {
      const response = await api.put(`/admin/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  createService: async (serviceData) => {
    try {
      const response = await api.post('/admin/services', serviceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api; 