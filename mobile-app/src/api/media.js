import client from './client';

export const getFeed = async () => {
  const { data } = await client.get(`/media?t=${Date.now()}`);
  return data;
};

export const unlockMedia = async (id) => {
  const { data } = await client.post(`/media/${id}/unlock`);
  return data;
};

export const getAccessUrl = async (id) => {
  const { data } = await client.get(`/media/${id}/access`);
  return data;
};

export const uploadMedia = async (formData) => {
  const { data } = await client.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
