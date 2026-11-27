import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// In-memory cache for static model evaluation metrics & dataset summary
let cachedMetrics = null;
let cachedAnalytics = null;
let cachedHealth = null;

export const getHealth = async () => {
  const response = await apiClient.get('/health');
  cachedHealth = response.data;
  return response.data;
};

export const predictCharges = async (payload) => {
  const response = await apiClient.post('/predict', payload);
  return response.data;
};

export const getMetrics = async (forceRefresh = false) => {
  if (cachedMetrics && !forceRefresh) {
    return cachedMetrics;
  }
  const response = await apiClient.get('/metrics');
  cachedMetrics = response.data;
  return cachedMetrics;
};

export const getAnalytics = async (forceRefresh = false) => {
  if (cachedAnalytics && !forceRefresh) {
    return cachedAnalytics;
  }
  const response = await apiClient.get('/analytics');
  cachedAnalytics = response.data;
  return cachedAnalytics;
};

export const getHistory = async (params = {}) => {
  const response = await apiClient.get('/history', { params });
  return response.data;
};

export const deleteHistory = async (recordId) => {
  const response = await apiClient.delete(`/history/${recordId}`);
  return response.data;
};

export const downloadPredictionPdf = async (recordId) => {
  const response = await apiClient.get(`/reports/prediction/${recordId}/pdf`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `MedCost_Report_REF-${String(recordId).padStart(6, '0')}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportPredictionPdf = async (predictionResult) => {
  const response = await apiClient.post('/reports/prediction/pdf', predictionResult, {
    responseType: 'blob',
  });
  const recId = predictionResult.record_id || predictionResult.id || 'custom';
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `MedCost_Report_REF-${String(recId).padStart(6, '0')}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default apiClient;
