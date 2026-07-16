import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

// Screens
import LoginRegisterScreen from '../screens/LoginRegisterScreen';
import MediaFeedScreen from '../screens/MediaFeedScreen';
import UploadMediaScreen from '../screens/UploadMediaScreen';
import MediaDetailsScreen from '../screens/MediaDetailsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1e1e1e' },
          headerTintColor: '#fff',
        }}
      >
        {userToken == null ? (
          // No token found, user isn't signed in
          <Stack.Screen 
            name="Auth" 
            component={LoginRegisterScreen} 
            options={{ headerShown: false }} 
          />
        ) : (
          // User is signed in
          <>
            <Stack.Screen name="Feed" component={MediaFeedScreen} options={{ title: 'Discover' }} />
            <Stack.Screen name="Upload" component={UploadMediaScreen} options={{ title: 'Publish Media' }} />
            <Stack.Screen name="Details" component={MediaDetailsScreen} options={{ title: 'Media Details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
