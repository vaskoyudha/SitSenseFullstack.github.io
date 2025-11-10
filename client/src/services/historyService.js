import api from './api';

export const historyService = {
  getHistory: async (params = {}) => {
    const response = await api.get('/history', { params });
    return response.data;
  },

  getDailyStats: async (date) => {
    const response = await api.get('/history/stats/daily', { params: { date } });
    return response.data;
  },
};

export default historyService;

