import api from './api';

export const sessionService = {
  getSessions: async (params = {}) => {
    const response = await api.get('/sessions', { params });
    return response.data;
  },

  getSession: async (id) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  createSession: async (deviceId) => {
    const response = await api.post('/sessions', { deviceId });
    return response.data;
  },

  endSession: async (id) => {
    const response = await api.put(`/sessions/${id}/end`);
    return response.data;
  },
};

export default sessionService;

