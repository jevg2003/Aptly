import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { MainTabNavigator } from './navigation/AppNavigator';

import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import './global.css';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'register' | 'home'>('welcome');
  const [isBusinessMode, setIsBusinessMode] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const { setColorScheme } = useColorScheme();
  const systemColorScheme = useRNColorScheme();

  // Handle System Theme
  useEffect(() => {
    if (systemColorScheme) {
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme, setColorScheme]);

  // Auth Subscription
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && currentScreen !== 'welcome') {
        setCurrentScreen('home');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && currentScreen !== 'welcome') {
        setCurrentScreen('home');
      } else if (!session && currentScreen === 'home') {
        setCurrentScreen('login');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    }
  }, [currentScreen]);

  const handleWelcomeFinish = () => {
    setCurrentScreen(session ? 'home' : 'login');
  };

  const renderScreen = () => {
    if (session && currentScreen === 'home') {
      return (
        <NavigationContainer>
          <MainTabNavigator 
            session={session} 
            onLogout={() => {
              setCurrentScreen('login');
              supabase.auth.signOut();
            }} 
          />
        </NavigationContainer>
      );
    }

    if (currentScreen === 'welcome') {
      return <WelcomeScreen onFinish={handleWelcomeFinish} />;
    }
    if (currentScreen === 'register') {
      return <RegisterScreen onNavigate={setCurrentScreen} isBusiness={isBusinessMode} setIsBusiness={setIsBusinessMode} />;
    }
    return <LoginScreen onNavigate={setCurrentScreen} isBusiness={isBusinessMode} setIsBusiness={setIsBusinessMode} />;
  };

  return (
    <SafeAreaProvider>
      {renderScreen()}
    </SafeAreaProvider>
  );
}