import api from './api';

export const aiService = {
  getAdvice: async (data) => {
    const response = await api.post('/ai/advice', data);
    return response.data;
  },
};

export default aiService;

