import api from './api';

export const validateVideoRoomAccess = async (meetingId: string) => {
  const res = await api.get(`/video/rooms/${meetingId}`);
  return res.data;
};
