import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  Dimensions, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { SessionContext } from '../lib/SessionContext';
import { useMatches } from '../lib/MatchContext';
import { JobCard } from '../components/JobCard';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';

import { ObsidianHeader } from '../components/ObsidianHeader';
import { ObsidianSwitcher } from '../components/ObsidianSwitcher';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const MOCK_JOBS: JobData[] = [
  {
    id: '1',
    title: 'Gerente de Tienda',
    company: 'D1 S.A.S.',
    companyDescription: 'Líder en retail de descuento',
    salary: '$3.5M - $4.5M COP',
    location: 'Bogotá, Colombia',
    type: 'Full-time',
    modality: 'Presencial',
    postedAt: '2 horas',
    tags: ['Liderazgo', 'Ventas', 'Inventarios'],
    imageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80',
  },
  {
    id: '2',
    title: 'Supervisor de Zona',
    company: 'Tiendas ARA',
    companyDescription: 'Expansión nacional',
    salary: '$3.0M - $3.8M COP',
    location: 'Medellín, Colombia',
    type: 'Full-time',
    modality: 'Híbrido',
    postedAt: '1 día',
    tags: ['Operaciones', 'Logística'],
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-f4129e93f429?w=800&q=80',
  },
  {
    id: '3',
    title: 'Asesor Comercial',
    company: 'Homecenter',
    companyDescription: 'Mejoramiento del hogar',
    salary: '$1.8M - $2.2M COP',
    location: 'Cali, Colombia',
    type: 'Contract',
    modality: 'Presencial',
    postedAt: '3 días',
    tags: ['Servicio al cliente', 'Ventas'],
    imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80',
  }
];

export const HomeScreen = () => {
  const session = React.useContext(SessionContext);
  const { addMatch } = useMatches();
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
      if (!data && !error) setShowOnboarding(true);
    } catch (err) {
      console.error(err);
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
      addMatch(currentJob);
      Alert.alert('¡Es un Match! 🎉', `Has mostrado gran interés en ${currentJob.company}`);
    } else if (type === 'superlike') {
      Alert.alert('¡Super Like! ⭐', `Tu perfil destacará en ${currentJob.company}`);
    } else {
      translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
    }

    translateX.value = 0;
    translateY.value = 0;
    setCurrentIndex(prev => prev + 1);
  };

  const onSwipeComplete = (direction: 'right' | 'left' | 'up') => {
    if (direction === 'right') handleAction('match');
    else if (direction === 'left') handleAction('reject');
    else if (direction === 'up') handleAction('superlike');
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, () => runOnJS(onSwipeComplete)('right'));
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () => runOnJS(onSwipeComplete)('left'));
      } else if (translateY.value < -SWIPE_THRESHOLD) {
        translateY.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () => runOnJS(onSwipeComplete)('up'));
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-8, 0, 8], Extrapolate.CLAMP);
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: `${rotate}deg` }]
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(Math.abs(translateX.value), [0, SWIPE_THRESHOLD], [0.92, 1], Extrapolate.CLAMP);
    const opacity = interpolate(Math.abs(translateX.value), [0, SWIPE_THRESHOLD], [0.6, 1], Extrapolate.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  if (checkingProfile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#94a3b8', fontStyle: 'italic' }}>Iniciando Obsidian...</Text>
      </View>
    );
  }

  if (showOnboarding && session?.user?.id) {
    return <OnboardingCandidate userId={session.user.id} session={session} onComplete={() => setShowOnboarding(false)} />;
  }

  const currentJob = MOCK_JOBS[currentIndex];
  const nextJob = MOCK_JOBS[currentIndex + 1];

  return (
    <View style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        
        <ObsidianHeader 
          title="Exploration" 
          subtitle="Top Matches"
          leftIcon="menu"
          rightIcon="options"
        />

        <View style={styles.cardArea}>
          {currentJob ? (
            <View style={styles.cardWrapper}>
              {nextJob && (
                <Animated.View style={[styles.nextCard, nextCardStyle]}>
                  <JobCard job={nextJob} />
                </Animated.View>
              )}

              <GestureDetector gesture={gesture}>
                <Animated.View style={[{ flex: 1 }, cardStyle]}>
                  <JobCard job={currentJob} />
                </Animated.View>
              </GestureDetector>

              <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={() => handleAction('reject')} style={[styles.actionBtn, styles.rejectBtn]}>
                  <Ionicons name="close" size={30} color="#FF3B30" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleAction('superlike')} style={[styles.actionBtn, styles.superBtn]}>
                  <Ionicons name="star" size={24} color="#FFCC00" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleAction('match')} style={[styles.actionBtn, styles.matchBtn]}>
                  <Ionicons name="heart" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
               <Ionicons name="sparkles" size={60} color="rgba(255,255,255,0.1)" />
               <Text style={styles.emptyTitle}>¡Eso es todo por hoy!</Text>
               <Text style={styles.emptyText}>Vuelve más tarde para descubrir nuevas oportunidades en el universo Aptly.</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingTop: 10,
  },
  cardWrapper: {
    width: '100%',
    flex: 1,
    marginBottom: 40,
    position: 'relative',
  },
  nextCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    zIndex: 20,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  rejectBtn: {
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  superBtn: {
    width: 50,
    height: 50,
    borderColor: 'rgba(255, 204, 0, 0.2)',
  },
  matchBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#00A3FF',
    borderColor: 'rgba(0, 163, 255, 0.3)',
    shadowColor: '#00A3FF',
    shadowOpacity: 0.4,
  },
  emptyContainer: {
    backgroundColor: '#121214',
    padding: 40,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  }
});
