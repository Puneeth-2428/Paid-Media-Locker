import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 10.24.8.121 is the computer's actual Wi-Fi IP address
export const API_BASE_URL = 'http://10.24.8.121:4000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;
