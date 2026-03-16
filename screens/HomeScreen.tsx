import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, useColorScheme, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '../components/CustomButton';
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
    <View className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926' }}
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ opacity: isDarkMode ? 0.2 : 0.4 }}
      >
        <SafeAreaView className="flex-1 px-8 items-center justify-center">
          
          <View className="bg-white/80 dark:bg-slate-900/80 p-8 rounded-[40px] shadow-xl w-full max-w-sm items-center border border-white/40 dark:border-slate-800/40">
            <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-6">
              <Text className="text-3xl">🎉</Text>
            </View>

            <Text className="text-slate-900 dark:text-slate-50 text-2xl font-bold text-center mb-2">
              ¡Has iniciado sesión!
            </Text>
            
            <Text className="text-slate-500 dark:text-slate-400 text-center mb-8">
              Autenticado como: {session?.user?.email}
            </Text>

            <CustomButton 
              title="Cerrar Sesión" 
              onPress={handleLogout} 
              variant="outline" 
              className="w-full"
            />
          </View>

        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};
