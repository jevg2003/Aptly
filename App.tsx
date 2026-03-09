import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import './global.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <SafeAreaProvider>
      {isLoading ? (
        <WelcomeScreen onFinish={() => setIsLoading(false)} />
      ) : (
        <LoginScreen />
      )}
    </SafeAreaProvider>
  );
}