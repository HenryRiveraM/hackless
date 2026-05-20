import { request } from './apiClient';

async function getAudits(params = {}) {
  const response = await request('/auditorias', { params });
  return response.data;
}

async function runAudit(data) {
  const response = await request('/auditorias/ejecutar', { method: 'POST', body: data });
  return response.data;
}

async function runEmailCheck(target) {
  const response = await request('/auditorias/email-check', { method: 'POST', body: { email: target } });
  return response.data;
}

async function runPortScan(target) {
  const response = await request('/auditorias/port-scan', { method: 'POST', body: { target } });
  return response.data;
}

async function deleteAudit(id) {
  const response = await request(`/auditorias/${id}`, { method: 'DELETE' });
  return response.data;
}

async function generateAuditResults(id) {
  const response = await request(`/auditorias/${id}/generar-resultados`, { method: 'POST' });
  return response.data;
}

export { deleteAudit, generateAuditResults, getAudits, runAudit, runEmailCheck, runPortScan };
