import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { OnboardingCandidate } from './profiles/OnboardingCandidate';

export const HomeScreen = ({ 
  session, 
  onLogout 
}: { 
  session: Session | null;
  onLogout: () => void;
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const checkProfile = React.useCallback(async () => {
    if (!session?.user?.id) return;
    
    setCheckingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
         console.error('Error checking profile:', error);
      }
      
      if (!data) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    } catch (err) {
      console.error('Check profile catch:', err);
    } finally {
      setCheckingProfile(false);
    }
  }, [session]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  if (checkingProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-950">
        <Text className="text-slate-500 italic">Cargando...</Text>
      </View>
    );
  }

  if (showOnboarding && session?.user?.id) {
    return (
      <OnboardingCandidate 
        userId={session.user.id} 
        session={session}
        onComplete={() => setShowOnboarding(false)} 
      />
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      {/* Contenedor Principal para las Tarjetas de Empleo */}
      <SafeAreaView className="flex-1 px-4 items-center justify-center" edges={['top']}>
        {/* Placeholder provisorio simulando una tarjeta principal */}
        <View className="w-full h-[65%] bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 items-center justify-center z-10">
          <Text className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">
            Desliza un Empleo
          </Text>
          <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center">
            Próximamente conectaremos las tarjetas reales.
          </Text>
        </View>
      </SafeAreaView>

      {/* Botones Flotantes de Swipe estilo Tinder */}
      <View className="absolute bottom-6 left-0 right-0 flex-row justify-center items-center gap-6 px-4 z-20" style={{ elevation: 15 }}>
        
        {/* Rechazar (X) */}
        <TouchableOpacity 
          className="w-[65px] h-[65px] rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-xl shadow-slate-300 dark:shadow-black border border-slate-100 dark:border-slate-700"
          style={{ elevation: 8 }}
        >
          <Ionicons name="close" size={36} color="#ef4444" />
        </TouchableOpacity>

        {/* Match / Like (Corazón) */}
        <TouchableOpacity 
          className="w-[85px] h-[85px] rounded-full bg-blue-500 items-center justify-center shadow-xl shadow-blue-400 dark:shadow-black"
          style={{ elevation: 10 }}
        >
          <Ionicons name="heart" size={44} color="#ffffff" />
        </TouchableOpacity>

        {/* Super Like (Estrella) */}
        <TouchableOpacity 
          className="w-[65px] h-[65px] rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-xl shadow-slate-300 dark:shadow-black border border-slate-100 dark:border-slate-700"
          style={{ elevation: 8 }}
        >
          <Ionicons name="star" size={32} color="#3b82f6" />
        </TouchableOpacity>

      </View>
    </View>
  );
};
