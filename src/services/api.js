import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  updateBMI: (bmiData) => api.put('/users/bmi', bmiData),
  getBMIHistory: () => api.get('/users/bmi-history'),
  calculateBMI: (data) => api.post('/users/calculate-bmi', data),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params = {}) => api.get('/tasks', { params }),
  createTask: (taskData) => api.post('/tasks', taskData),
  getTask: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  toggleTask: (id) => api.patch(`/tasks/${id}/toggle`),
  getTaskStats: () => api.get('/tasks/stats/summary'),
};

// AI API
export const aiAPI = {
  generateMealPlan: (preferences) => api.post('/ai/meal-plan', preferences),
  generateWorkoutPlan: (preferences) => api.post('/ai/workout-plan', preferences),
  getHealthRecommendations: (focus) => api.post('/ai/recommendations', focus),
};

export default api;
