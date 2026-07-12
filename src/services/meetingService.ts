import api from './api';

export const createMeeting = async (data: any) => {
  const res = await api.post('/meetings', data);
  return res.data;
};

export const getMeetings = async (params?: any) => {
  const res = await api.get('/meetings', { params });
  return res.data;
};

export const getMeetingCalendar = async () => {
  const res = await api.get('/meetings/calendar');
  return res.data;
};

export const getMeetingById = async (id: string) => {
  const res = await api.get(`/meetings/${id}`);
  return res.data;
};

export const acceptMeeting = async (id: string) => {
  const res = await api.patch(`/meetings/${id}/accept`);
  return res.data;
};

export const rejectMeeting = async (id: string, reason?: string) => {
  const res = await api.patch(`/meetings/${id}/reject`, { reason });
  return res.data;
};

export const cancelMeeting = async (id: string) => {
  const res = await api.patch(`/meetings/${id}/cancel`);
  return res.data;
};

export const completeMeeting = async (id: string) => {
  const res = await api.patch(`/meetings/${id}/complete`);
  return res.data;
};
