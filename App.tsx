import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './screens/LoginScreen';
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <LoginScreen />
    </SafeAreaProvider>
  );
}