import { request } from './apiClient';

async function getTrainingDashboard() {
  const response = await request('/capacitacion/dashboard');
  return response.data;
}

async function getLessons() {
  const response = await request('/capacitacion/lecciones');
  return response.data || [];
}

async function startLesson(id) {
  const response = await request(`/capacitacion/lecciones/${id}/iniciar`, { method: 'POST' });
  return response.data;
}

async function updateLessonProgress(id, data) {
  const response = await request(`/capacitacion/lecciones/${id}/progreso`, { method: 'PATCH', body: data });
  return response.data;
}

async function getLessonContent(id) {
  const response = await request(`/capacitacion/lecciones/${id}/contenido`);
  return response.data;
}

async function getLessonQuiz(id) {
  const response = await request(`/capacitacion/lecciones/${id}/quiz`);
  return response.data;
}

async function answerQuiz(id, respuestas) {
  const response = await request(`/capacitacion/quizzes/${id}/responder`, { method: 'POST', body: { respuestas } });
  return response.data;
}

export { answerQuiz, getLessonContent, getLessonQuiz, getLessons, getTrainingDashboard, startLesson, updateLessonProgress };
