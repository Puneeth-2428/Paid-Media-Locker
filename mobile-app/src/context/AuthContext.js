import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore token on launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      let token;
      try {
        token = await AsyncStorage.getItem('jwtToken');
      } catch (e) {
        console.error('Restoring token failed', e);
      }
      setUserToken(token);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (email, password) => {
        try {
          const data = await login(email, password);
          await AsyncStorage.setItem('jwtToken', data.token);
          setUserToken(data.token);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.error || error.message };
        }
      },
      signUp: async (name, email, password) => {
        try {
          const data = await register(name, email, password);
          await AsyncStorage.setItem('jwtToken', data.token);
          setUserToken(data.token);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.error || error.message };
        }
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem('jwtToken');
          setUserToken(null);
        } catch (e) {
          console.error(e);
        }
      },
      userToken,
    }),
    [userToken]
  );

  return (
    <AuthContext.Provider value={{ ...authContext, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
