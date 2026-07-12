import api from './api';

export const uploadDocument = async (formData: FormData) => {
  const res = await api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getDocuments = async (params?: any) => {
  const res = await api.get('/documents', { params });
  return res.data;
};

export const getDocumentMetadata = async (id: string) => {
  const res = await api.get(`/documents/${id}`);
  return res.data;
};

export const getDocumentPreviewUrl = (id: string) => {
  // Return absolute URL to use in iframe/img directly, but append token manually or rely on cookies.
  // Wait, if it relies on Bearer token, we cannot just put it in an iframe's src.
  // We can fetch it as a blob and create object URL.
  return `/api/documents/${id}/file`;
};

export const fetchDocumentBlob = async (id: string) => {
  const res = await api.get(`/documents/${id}/file`, { responseType: 'blob' });
  return res.data;
};

export const updateDocumentStatus = async (id: string, status: string) => {
  const res = await api.patch(`/documents/${id}/status`, { status });
  return res.data;
};

export const deleteDocument = async (id: string) => {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
};

export const uploadSignature = async (id: string, formData: FormData) => {
  const res = await api.post(`/documents/${id}/signatures`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};
