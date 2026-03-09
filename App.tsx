import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import './global.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { setColorScheme } = useColorScheme();
  const systemColorScheme = useRNColorScheme();

  // Sync NativeWind with System
  useEffect(() => {
    if (systemColorScheme) {
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme, setColorScheme]);

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