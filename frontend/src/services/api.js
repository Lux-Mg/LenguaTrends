import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
});

export const getStats = () => api.get('/api/trends/stats');
export const getTrends = (params) => api.get('/api/trends/', { params });
export const getSentimentByLanguage = (params) => api.get('/api/sentiment/by-language', { params });
export const getSentimentByMovie = (params) => api.get('/api/sentiment/by-movie', { params });
export const getLanguageDivergence = (params) => api.get('/api/sentiment/language-divergence', { params });
export const getWordCloud = (params) => api.get('/api/wordcloud/', { params });
export const getTopics = (params) => api.get('/api/topics/', { params });
export const getComments = (params) => api.get('/api/comments/', { params });

export default api;
