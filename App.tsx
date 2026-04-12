import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { RootNavigator } from './navigation/index';

import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import './global.css';

import { AppProvider, useApp } from './lib/AppContext';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const { setColorScheme } = useColorScheme();
  const systemColorScheme = useRNColorScheme();

  useEffect(() => {
    if (systemColorScheme) {
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme, setColorScheme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => {
      subscription.unsubscribe();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <RootNavigator session={session} />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}