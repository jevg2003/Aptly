import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, useColorScheme, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { OnboardingCandidate } from './profiles/OnboardingCandidate';
import { JobCard, JobData } from '../components/JobCard';
import { 
  GestureHandlerRootView, 
  Gesture,
  GestureDetector
} from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const MOCK_JOBS: JobData[] = [
  {
    id: '1',
    title: 'Senior UX Designer',
    company: 'TechCorp Inc.',
    companyDescription: 'Fintech Solutions',
    salary: '$120k - $150k',
    location: 'San Francisco, CA',
    type: 'Full-time',
    modality: 'Hybrid',
    postedAt: '2 horas',
    tags: ['Figma', 'Prototyping', 'User Research'],
    imageUrl: 'https://images.unsplash.com/photo-1593642532744-d377ab507dc8?w=800&q=80',
  },
  {
    id: '2',
    title: 'React Native Developer',
    company: 'Spotify',
    companyDescription: 'Music Streaming',
    salary: '$100k - $130k',
    location: 'Estocolmo',
    type: 'Full-time',
    modality: 'Remoto',
    postedAt: '1 día',
    tags: ['React Native', 'TypeScript', 'Mobile'],
    imageUrl: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&q=80',
  },
  {
    id: '3',
    title: 'Backend Node.js',
    company: 'Netflix',
    companyDescription: 'Entertainment',
    salary: '$140k - $180k',
    location: 'Los Gatos, CA',
    type: 'Contract',
    modality: 'Remoto',
    postedAt: '3 días',
    tags: ['Node.js', 'AWS', 'Microservices'],
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  }
];

import { SessionContext } from '../navigation/AppNavigator';

export const HomeScreen = () => {
  const session = React.useContext(SessionContext);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  
  // Swipe State
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Animation Shared Values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

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

  const handleAction = (type: 'reject' | 'match' | 'superlike') => {
    const currentJob = MOCK_JOBS[currentIndex];
    if (!currentJob) return;

    if (type === 'match') {
      Alert.alert('¡Es un Match! 🎉', `Has mostrado gran interés en ${currentJob.company}`);
    } else if (type === 'superlike') {
      Alert.alert('¡Super Like! ⭐', `Tu perfil destacará en ${currentJob.company}`);
    } else {
      Alert.alert('Empleo rechazado 👎', `Has rechazado la vacante en ${currentJob.company}`);
    }

    // Reset position and advance index
    translateX.value = 0;
    translateY.value = 0;
    setCurrentIndex(prev => prev + 1);
  };

  const onSwipeComplete = (direction: 'right' | 'left' | 'up') => {
    if (direction === 'right') handleAction('match');
    else if (direction === 'left') handleAction('reject');
    else if (direction === 'up') handleAction('superlike');
  };

  // 1. New Gesture API (Reanimated 3 style)
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, () => {
          runOnJS(onSwipeComplete)('right');
        });
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () => {
          runOnJS(onSwipeComplete)('left');
        });
      } else if (translateY.value < -SWIPE_THRESHOLD) {
        translateY.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () => {
          runOnJS(onSwipeComplete)('up');
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // 2. Animated Style for the Front Card
  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value, 
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], 
      [-10, 0, 10], 
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` }
      ]
    };
  });

  // 3. Next Card Style (Scale up as the top card moves)
  const nextCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.9, 1],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale }]
    };
  });

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

  const currentJob = MOCK_JOBS[currentIndex];
  const nextJob = MOCK_JOBS[currentIndex + 1];

  return (
    <GestureHandlerRootView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* HEADER TOP BAR */}
        <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
            <TouchableOpacity className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 items-center justify-center">
               <Ionicons name="menu" size={24} color="#3b82f6" />
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-slate-800 dark:text-white">Exploration</Text>
            
            <TouchableOpacity className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 items-center justify-center">
               <Ionicons name="options" size={24} color="#3b82f6" />
            </TouchableOpacity>
        </View>

        {/* AREA DE TARJETAS */}
        <View className="flex-1 px-4 justify-center">
          {currentJob ? (
            <View className="w-full flex-1 mb-16 z-10 relative">
              
              {/* Next Card (Background) */}
              {nextJob && (
                <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', zIndex: -1 }, nextCardStyle]}>
                  <JobCard job={nextJob} />
                </Animated.View>
              )}

              {/* Current Card (Draggable) */}
              <GestureDetector gesture={gesture}>
                <Animated.View style={[{ flex: 1 }, cardStyle]}>
                  <JobCard job={currentJob} />
                </Animated.View>
              </GestureDetector>

              {/* Botones Flotantes Sobre la Tarjeta */}
              <View 
                className="absolute -bottom-8 left-0 right-0 flex-row justify-center items-center gap-6 px-4 z-20"
              >
                {/* Rechazar (X) */}
                <TouchableOpacity 
                  onPress={() => currentJob && handleAction('reject')}
                  className="w-[70px] h-[70px] rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-xl shadow-red-200/50 dark:shadow-black border border-slate-100 dark:border-slate-700"
                  style={{ elevation: 8 }}
                >
                  <Ionicons name="close" size={32} color="#ef4444" />
                </TouchableOpacity>

                {/* Super Like (Estrella) - Más pequeño */}
                <TouchableOpacity 
                  onPress={() => currentJob && handleAction('superlike')}
                  className="w-[55px] h-[55px] rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-lg shadow-orange-200/50 dark:shadow-black border border-slate-100 dark:border-slate-700"
                  style={{ elevation: 6 }}
                >
                  <Ionicons name="star" size={24} color="#f59e0b" />
                </TouchableOpacity>

                {/* Match / Like (Corazón) - Principal azul */}
                <TouchableOpacity 
                  onPress={() => currentJob && handleAction('match')}
                  className="w-[85px] h-[85px] rounded-full bg-[#2563eb] items-center justify-center shadow-xl shadow-[#2563eb]/40 dark:shadow-black"
                  style={{ elevation: 10 }}
                >
                  <Ionicons name="heart" size={38} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="w-full h-80 bg-white dark:bg-slate-900 rounded-3xl items-center justify-center p-6 border border-slate-200 dark:border-slate-800 z-10">
              <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-2 text-center">
                ¡Eso es todo por hoy!
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
                Vuelve más tarde para descubrir nuevas oportunidades.
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};
