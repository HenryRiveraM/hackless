import { request } from './apiClient';

async function getProfile() {
  const response = await request('/configuracion/perfil');
  return response.data;
}

async function updateProfile(data) {
  const response = await request('/configuracion/perfil', { method: 'PUT', body: data });
  return response.data;
}

async function getSecurity() {
  const response = await request('/configuracion/seguridad');
  return response.data;
}

async function updateSecurity(data) {
  const response = await request('/configuracion/seguridad', { method: 'PUT', body: data });
  return response.data;
}

async function getSessions() {
  const response = await request('/configuracion/sesiones');
  return response.data || [];
}

async function getSubscription() {
  const response = await request('/configuracion/suscripcion');
  return response.data;
}

export { getProfile, getSecurity, getSessions, getSubscription, updateProfile, updateSecurity };
