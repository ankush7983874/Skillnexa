import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('skillnexa_token') || localStorage.getItem('token');

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- GET PORTFOLIOS ---

export const getMyPortfolio = async () => {
  const response = await axios.get(`${API_URL}/portfolio`, { headers: getAuthHeaders() });
  return response.data;
};

export const getPublicPortfolio = async (studentId: string) => {
  const response = await axios.get(`${API_URL}/portfolio/${studentId}`, { headers: getAuthHeaders() });
  return response.data;
};

export const updatePrivacySettings = async (privacySettings: any) => {
  const response = await axios.put(`${API_URL}/portfolio/privacy`, { privacySettings }, { headers: getAuthHeaders() });
  return response.data;
};

// --- PROJECTS ---

export const addProject = async (projectData: any) => {
  const response = await axios.post(`${API_URL}/portfolio/projects`, projectData, { headers: getAuthHeaders() });
  return response.data;
};

export const updateProject = async (id: string, projectData: any) => {
  const response = await axios.put(`${API_URL}/portfolio/projects/${id}`, projectData, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteProject = async (id: string) => {
  const response = await axios.delete(`${API_URL}/portfolio/projects/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

// --- CERTIFICATES ---

export const addCertificate = async (formData: FormData) => {
  const token = getToken();
  const response = await axios.post(`${API_URL}/portfolio/certificates`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateCertificate = async (id: string, formData: FormData) => {
  const token = getToken();
  const response = await axios.put(`${API_URL}/portfolio/certificates/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteCertificate = async (id: string) => {
  const response = await axios.delete(`${API_URL}/portfolio/certificates/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

// --- ACHIEVEMENTS ---

export const addAchievement = async (achievementData: any) => {
  const response = await axios.post(`${API_URL}/portfolio/achievements`, achievementData, { headers: getAuthHeaders() });
  return response.data;
};

export const updateAchievement = async (id: string, achievementData: any) => {
  const response = await axios.put(`${API_URL}/portfolio/achievements/${id}`, achievementData, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteAchievement = async (id: string) => {
  const response = await axios.delete(`${API_URL}/portfolio/achievements/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

// --- INTERNSHIPS ---

export const addInternship = async (internshipData: any) => {
  const response = await axios.post(`${API_URL}/portfolio/internships`, internshipData, { headers: getAuthHeaders() });
  return response.data;
};

export const updateInternship = async (id: string, internshipData: any) => {
  const response = await axios.put(`${API_URL}/portfolio/internships/${id}`, internshipData, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteInternship = async (id: string) => {
  const response = await axios.delete(`${API_URL}/portfolio/internships/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

// --- RESUME ---

export const uploadResume = async (formData: FormData) => {
  const token = getToken();
  const response = await axios.post(`${API_URL}/portfolio/resume`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteResume = async () => {
  const response = await axios.delete(`${API_URL}/portfolio/resume`, { headers: getAuthHeaders() });
  return response.data;
};
