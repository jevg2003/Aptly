import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, useColorScheme as useRNColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootNavigator } from './navigation/index';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { AppProvider } from './lib/AppContext';
import './global.css';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  const checkDeletionStatus = async (userSession: Session | null) => {
    if (!userSession) {
      setIsDeleted(false);
      setLoadingSession(false);
      return;
    }
    const { data } = await supabase.from('profiles').select('deleted_at').eq('id', userSession.user.id).single();
    if (data?.deleted_at) {
      setIsDeleted(true);
    } else {
      setIsDeleted(false);
    }
    setLoadingSession(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkDeletionStatus(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkDeletionStatus(session);
    });
    
    return () => {
      subscription.unsubscribe();
    }
  }, []);

  if (loadingSession) {
    return <View style={{ flex: 1, backgroundColor: '#050505' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <SafeAreaProvider>
          {/* Forcing Dark Theme for the entire app context */}
          <NavigationContainer theme={DarkTheme}>
            <RootNavigator session={session} isDeleted={isDeleted} />
          </NavigationContainer>
        </SafeAreaProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}