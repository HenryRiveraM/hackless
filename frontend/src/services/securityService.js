import { request } from './apiClient';

async function getEmployees({ idEmpresa, page = 1, pageSize = 8, busqueda = '' }) {
  const response = await request('/empleados', {
    params: { idEmpresa, page, pageSize, busqueda },
  });
  return response.data;
}

async function createEmployee(data) {
  const response = await request('/empleados', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

async function updateEmployee(id, data) {
  const response = await request(`/empleados/${id}`, {
    method: 'PUT',
    body: data,
  });
  return response.data;
}

async function deleteEmployee(id) {
  const response = await request(`/empleados/${id}`, { method: 'DELETE' });
  return response.data;
}

async function getAlerts(params = {}) {
  const response = await request('/alertas', { params });
  return response.data;
}

async function createAlert(data) {
  const response = await request('/alertas', { method: 'POST', body: data });
  return response.data;
}

async function updateAlert(id, data) {
  const response = await request(`/alertas/${id}`, { method: 'PUT', body: data });
  return response.data;
}

async function deleteAlert(id) {
  const response = await request(`/alertas/${id}`, { method: 'DELETE' });
  return response.data;
}

async function getAlertsSummary() {
  const response = await request('/alertas/resumen');
  return response.data;
}

async function getIncidents(params = {}) {
  const response = await request('/incidencias', { params });
  return response.data;
}

async function createIncident(data) {
  const response = await request('/incidencias', { method: 'POST', body: data });
  return response.data;
}

async function updateIncident(id, data) {
  const response = await request(`/incidencias/${id}`, { method: 'PUT', body: data });
  return response.data;
}

async function deleteIncident(id) {
  const response = await request(`/incidencias/${id}`, { method: 'DELETE' });
  return response.data;
}

async function getIncidentsSummary() {
  const response = await request('/incidencias/resumen');
  return response.data;
}

export {
  createEmployee,
  createAlert,
  createIncident,
  deleteAlert,
  deleteEmployee,
  deleteIncident,
  getAlerts,
  getAlertsSummary,
  getEmployees,
  getIncidents,
  getIncidentsSummary,
  updateAlert,
  updateEmployee,
  updateIncident,
};
