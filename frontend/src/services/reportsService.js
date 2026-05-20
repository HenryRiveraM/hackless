import { request } from './apiClient';

async function getReports({ idEmpresa, periodo = '', page = 1, pageSize = 10 }) {
  const response = await request('/reportes', { params: { idEmpresa, periodo, page, pageSize } });
  return response.data;
}

async function createReport(data) {
  const response = await request('/reportes', { method: 'POST', body: data });
  return response.data;
}

async function updateReport(id, data) {
  const response = await request(`/reportes/${id}`, { method: 'PUT', body: data });
  return response.data;
}

async function deleteReport(id) {
  const response = await request(`/reportes/${id}`, { method: 'DELETE' });
  return response.data;
}

export { createReport, deleteReport, getReports, updateReport };
