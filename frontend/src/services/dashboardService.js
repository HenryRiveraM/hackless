import { request } from './apiClient';

async function getSummary() {
  const response = await request('/dashboard/resumen');
  return response.data;
}

async function getRecommendations(filters = {}) {
  const response = await request('/dashboard/recomendaciones', { params: filters });
  return response.data || [];
}

async function completeRecommendation(id) {
  const response = await request(`/dashboard/recomendaciones/${id}/estado`, {
    method: 'PATCH',
    body: { estadoRecomendacion: 'completada' },
  });
  return response.data;
}

export { getSummary, getRecommendations, completeRecommendation };
