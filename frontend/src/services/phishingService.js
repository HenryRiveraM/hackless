import { request } from './apiClient';

async function getCampaigns() {
  const response = await request('/phishing/campanas');
  const campaigns = response.data || [];
  // Normalize field names from snake_case to camelCase
  return campaigns.map(campaign => ({
    ...campaign,
    idCampana: campaign.idCampana || campaign.id_campana || campaign.id
  }));
}

async function getTemplates() {
  const response = await request('/phishing/plantillas');
  const templates = response.data || [];
  // Normalize field names from snake_case to camelCase
  return templates.map(template => ({
    ...template,
    idPlantilla: template.idPlantilla || template.id_plantilla
  }));
}

async function getEmployees() {
  try {
    const response = await request('/empleados?idEmpresa=46&pageSize=999');
    // Handle different response formats
    let empList = [];
    if (Array.isArray(response.data)) {
      empList = response.data;
    } else if (response.data && Array.isArray(response.data.items)) {
      empList = response.data.items;
    } else if (response.data && Array.isArray(response.data.datos)) {
      empList = response.data.datos;
    }
    
    // Ensure each employee has id_empleado
    empList = empList.map(emp => ({
      ...emp,
      id_empleado: emp.id_empleado || emp.id || emp.idEmpleado
    }));
    
    console.log('Employees loaded:', empList);
    return empList;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
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

export { createCampaign, deleteCampaign, getCampaignDashboard, getCampaigns, getEmployees, getTemplates, simulateCampaign, updateCampaign };
