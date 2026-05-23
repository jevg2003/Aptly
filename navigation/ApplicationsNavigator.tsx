import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApplicationsScreen } from '../screens/applications/ApplicationsScreen';
import { ApplicationStatusScreen } from '../screens/applications/ApplicationStatusScreen';

const Stack = createNativeStackNavigator();

export const ApplicationsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ApplicationsList" component={ApplicationsScreen} />
      <Stack.Screen name="ApplicationStatus" component={ApplicationStatusScreen} />
    </Stack.Navigator>
  );
};
