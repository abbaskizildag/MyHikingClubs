import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getEvents = async () => {
  const response = await api.get('/events');
  return response.data;
};

export const getEventById = async (id: string) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const joinEvent = async (id: string) => {
  const response = await api.post(`/events/${id}/join`);
  return response.data;
};

export const leaveEvent = async (id: string) => {
  const response = await api.delete(`/events/${id}/leave`);
  return response.data;
};

export const createEvent = async (data: any) => {
  const response = await api.post('/events', data);
  return response.data;
};

// Clubs
export const getClubs = async () => {
  const response = await api.get('/clubs');
  return response.data;
};

export const getClubById = async (id: string) => {
  const response = await api.get(`/clubs/${id}`);
  return response.data;
};

export const createClub = async (data: { name: string; description: string }) => {
  const response = await api.post('/clubs', data);
  return response.data;
};

export const joinClub = async (clubId: string) => {
  const response = await api.post(`/clubs/${clubId}/join`);
  return response.data;
};

export const getClubMembers = async (clubId: string) => {
  const response = await api.get(`/clubs/${clubId}/members`);
  return response.data;
};

export const getCountries = async () => {
  const response = await api.get('/locations/countries');
  return response.data;
};

export const getCities = async (countryId?: string) => {
  const response = await api.get('/locations/cities', { params: { countryId } });
  return response.data;
};

export const updateMemberRole = async (clubId: string, targetUserId: string, newRole: string) => {
  const response = await api.patch(`/clubs/${clubId}/members/role`, { targetUserId, newRole });
  return response.data;
};

export const updateClub = async (id: string, data: any) => {
  const response = await api.patch(`/clubs/update/${id}`, data);
  return response.data;
};

export const updateEvent = async (eventId: string, data: any) => {
  const response = await api.patch(`/events/${eventId}`, data);
  return response.data;
};
