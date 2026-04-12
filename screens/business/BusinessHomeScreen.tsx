import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StatusBar, useColorScheme, TouchableOpacity, Alert, Dimensions, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
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
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface CandidateData {
  id: string;
  name: string;
  age: number;
  location: string;
  availability: string;
  tags: string[];
  imageUrl: string;
  role: string;
}

const MOCK_CANDIDATES: CandidateData[] = [
  {
    id: '1',
    name: 'Pepito',
    age: 28,
    location: 'Cali, Colombia',
    availability: 'Tiempo completo / Medio tiempo',
    role: 'Programador',
    tags: ['React Native', 'UI/UX', 'Inglés B2'],
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },
  {
    id: '2',
    name: 'Maria',
    age: 24,
    location: 'Bogotá, Colombia',
    availability: 'Tiempo completo',
    role: 'Vendedor',
    tags: ['Ventas', 'Negociación', 'Excel'],
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
  },
  {
    id: '3',
    name: 'Juan',
    age: 32,
    location: 'Medellín, Colombia',
    availability: 'Por horas',
    role: 'Aux. Tienda',
    tags: ['Logística', 'Inventarios'],
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
  }
];

const CATEGORIES = ['Todos', ...new Set(MOCK_CANDIDATES.map(c => c.role))];

export const BusinessHomeScreen = () => {
  const session = React.useContext(SessionContext);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Filter candidates based on selected role
  const filteredCandidates = selectedCategory === 'Todos' 
    ? MOCK_CANDIDATES 
    : MOCK_CANDIDATES.filter(candidate => candidate.role === selectedCategory);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  // Swipe State
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleAction = (type: 'reject' | 'match' | 'superlike') => {
    const currentCandidate = filteredCandidates[currentIndex];
    if (!currentCandidate) return;

    if (type === 'match') {
      Alert.alert('¡Match Sugerido! 🤝', `Has mostrado interés en ${currentCandidate.name}`);
    } else if (type === 'superlike') {
      Alert.alert('¡Super Contacto! ⭐', `Notificaremos prioritariamente a ${currentCandidate.name}`);
    } else {
      console.log('Candidato rechazado');
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

  const currentCandidate = filteredCandidates[currentIndex];
  const nextCandidate = filteredCandidates[currentIndex + 1];

  const CandidateCard = ({ candidate }: { candidate: CandidateData }) => (
    <View className="flex-1 bg-white dark:bg-slate-900 rounded-[45px] overflow-hidden shadow-2xl relative">
      <Image 
        source={{ uri: candidate.imageUrl }} 
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />
      {/* Gradient Overlay bottom to top */}
      <View className="absolute inset-x-0 bottom-0 h-1/2 bg-black/60 pt-10 px-6 justify-end pb-8">
        <View className="flex-row items-center space-x-2 mb-2">
            <View className="bg-blue-600 px-3 py-1 rounded-lg">
                <Text className="text-white text-[10px] font-black uppercase">Disponible</Text>
            </View>
            <Text className="text-white/90 text-xs font-bold">{candidate.availability}</Text>
        </View>

        <View className="flex-row items-baseline mb-1">
            <Text className="text-white text-3xl font-black">{candidate.name}, {candidate.age}</Text>
            <TouchableOpacity className="ml-auto w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/30">
                <Ionicons name="information" size={20} color="white" />
            </TouchableOpacity>
        </View>

        <View className="flex-row items-center mb-4">
            <Ionicons name="location" size={14} color="#3b82f6" />
            <Text className="text-white/80 text-sm ml-1 font-medium">{candidate.location}</Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
            {candidate.tags.map((tag, idx) => (
                <View key={idx} className="bg-white/20 px-4 py-1.5 rounded-full border border-white/20">
                    <Text className="text-white text-[10px] font-bold">{tag}</Text>
                </View>
            ))}
        </View>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* HEADER TOP BAR */}
        <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="menu" size={28} color={isDarkMode ? "white" : "#1e293b"} />
          </TouchableOpacity>

          <Text className="text-2xl font-black text-[#506FC0]">JobMatch</Text>

          <TouchableOpacity className="relative w-10 h-10 items-center justify-center">
            <Ionicons name="notifications-outline" size={28} color={isDarkMode ? "white" : "#1e293b"} />
            <View className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
          </TouchableOpacity>
        </View>

        {/* Categories Horizontal */}
        <View className="flex-row items-center px-6 mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                {CATEGORIES.map((cat, idx) => (
                    <TouchableOpacity 
                        key={idx}
                        onPress={() => setSelectedCategory(cat)}
                        className={`mr-3 px-6 py-2.5 rounded-2xl ${selectedCategory === cat ? 'bg-[#506FC0]' : 'bg-slate-100 dark:bg-slate-800'}`}
                    >
                        <Text className={`text-xs font-black ${selectedCategory === cat ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity className="ml-2 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl items-center justify-center">
                <Ionicons name="options-outline" size={20} color={isDarkMode ? "white" : "#64748b"} />
            </TouchableOpacity>
        </View>

        {/* CARD AREA */}
        <View className="flex-1 px-4 justify-center">
          {currentCandidate ? (
            <View className="w-full h-[550px] mb-20 z-10 relative">10 relative">
              {/* Next Card */}
              {nextCandidate && (
                <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', zIndex: -1 }, nextCardStyle]}>
                  <CandidateCard candidate={nextCandidate} />
                </Animated.View>
              )}

              {/* Current Card */}
              <GestureDetector gesture={gesture}>
                <Animated.View style={[{ flex: 1 }, cardStyle]}>
                  <CandidateCard candidate={currentCandidate} />
                </Animated.View>
              </GestureDetector>

              {/* Floating Buttons */}
              <View className="absolute -bottom-10 left-0 right-0 flex-row justify-center items-center gap-5 z-20">
                <TouchableOpacity
                  onPress={() => handleAction('reject')}
                  className="w-[65px] h-[65px] rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-lg border border-slate-50 dark:border-slate-800"
                >
                  <Ionicons name="close" size={32} color="#ef4444" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleAction('superlike')}
                  className="w-[55px] h-[55px] rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-lg border border-slate-50 dark:border-slate-800"
                >
                  <Ionicons name="star" size={26} color="#4c6ef5" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleAction('match')}
                  className="w-[75px] h-[75px] rounded-full bg-[#506FC0] items-center justify-center shadow-xl shadow-[#506FC0]/40"
                >
                  <Ionicons name="heart" size={36} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="w-full h-80 bg-white dark:bg-slate-900 rounded-[45px] items-center justify-center p-6 border border-slate-100 dark:border-slate-800">
              <Ionicons name="sparkles" size={50} color="#3b82f6" className="mb-4" />
              <Text className="text-2xl font-black text-slate-800 dark:text-white mb-2 text-center">
                ¡Búsqueda terminada!
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
                Has visto a todos los candidatos disponibles para {selectedCategory}.
              </Text>
            </View>
          )}
        </View>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
};
