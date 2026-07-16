import client from './client';

export const getWallet = async () => {
  const { data } = await client.get('/wallet');
  return data; // returns { balance, history }
};
