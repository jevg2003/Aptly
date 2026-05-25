import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Image, Text, ActivityIndicator, useColorScheme as useRNColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

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
    const { data } = await supabase
      .from('profiles')
      .select('deleted_at')
      .eq('id', userSession.user.id)
      .single();
    if (data?.deleted_at) {
      setIsDeleted(true);
    } else {
      setIsDeleted(false);
    }
    setLoadingSession(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Stale session or invalid token detected, signing out to clear storage:', error.message);
        supabase.auth.signOut().then(() => {
          setSession(null);
          setIsDeleted(false);
          setLoadingSession(false);
        });
      } else {
        setSession(session);
        checkDeletionStatus(session);
      }
    }).catch((err) => {
      console.error('Unhandled getSession error:', err);
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsDeleted(false);
        setLoadingSession(false);
      } else {
        setSession(session);
        checkDeletionStatus(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loadingSession) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#050505',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}>
        <Image
          source={require('./assets/favicon.png')}
          style={{ width: 80, height: 80, borderRadius: 22 }}
          resizeMode="contain"
        />
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 28,
            fontWeight: '900',
            letterSpacing: -0.5,
          }}>
          Aptly
        </Text>
        <ActivityIndicator color="#00A3FF" size="small" style={{ marginTop: 8 }} />
      </View>
    );
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
