import { request } from './apiClient';

async function getCampaigns() {
  const response = await request('/phishing/campanas');
  return response.data || [];
}

async function getTemplates() {
  const response = await request('/phishing/plantillas');
  return response.data || [];
}

async function createCampaign(data) {
  const response = await request('/phishing/campanas', { method: 'POST', body: data });
  return response.data;
}

async function updateCampaign(id, data) {
  const response = await request(`/phishing/campanas/${id}`, { method: 'PUT', body: data });
  return response.data;
}

async function deleteCampaign(id) {
  const response = await request(`/phishing/campanas/${id}`, { method: 'DELETE' });
  return response.data;
}

async function simulateCampaign(id) {
  const response = await request(`/phishing/campanas/${id}/simular`, { method: 'POST' });
  return response.data;
}

async function getCampaignDashboard(id) {
  const response = await request(`/phishing/dashboard/${id}`);
  return response.data;
}

export { createCampaign, deleteCampaign, getCampaignDashboard, getCampaigns, getTemplates, simulateCampaign, updateCampaign };
