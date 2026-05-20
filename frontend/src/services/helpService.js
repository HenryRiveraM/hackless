import { request } from './apiClient';

async function getFaq() {
  const response = await request('/ayuda/faq', { auth: false });
  return response.data || [];
}

async function getSystemStatus() {
  const response = await request('/ayuda/estado-sistema', { auth: false });
  return response.data;
}

async function getTickets() {
  const response = await request('/ayuda/tickets');
  return response.data || [];
}

async function createTicket(data) {
  const response = await request('/ayuda/tickets', { method: 'POST', body: data });
  return response.data;
}

async function getChats() {
  const response = await request('/ayuda/chat');
  return response.data || [];
}

async function createChat(data) {
  const response = await request('/ayuda/chat', { method: 'POST', body: data });
  return response.data;
}

async function getChat(id) {
  const response = await request(`/ayuda/chat/${id}`);
  return response.data;
}

async function sendChatMessage(id, mensaje) {
  const response = await request(`/ayuda/chat/${id}/mensajes`, { method: 'POST', body: { mensaje } });
  return response.data;
}

export { createChat, createTicket, getChat, getChats, getFaq, getSystemStatus, getTickets, sendChatMessage };
