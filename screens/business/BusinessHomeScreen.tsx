import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Image, 
  StatusBar, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate, 
  Extrapolate, 
  runOnJS 
} from 'react-native-reanimated';
import { SessionContext } from '../../lib/SessionContext';
import { supabase } from '../../lib/supabase';

import { ObsidianHeader } from '../../components/ObsidianHeader';
import { ObsidianModal } from '../../components/ObsidianModal';
import { ObsidianDetailModal } from '../../components/ObsidianDetailModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface CandidateData {
  applicationId: string;
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
    applicationId: 'mock-app-1',
    id: '1',
    name: 'Pepito',
    age: 28,
    location: 'Cali, Colombia',
    availability: 'Tiempo completo',
    role: 'Programador',
    tags: ['React Native', 'UI/UX', 'Inglés B2'],
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },
  {
    applicationId: 'mock-app-2',
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
    applicationId: 'mock-app-3',
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

const CATEGORIES = ['Todos', 'Programador', 'Vendedor', 'Tienda'];

export const BusinessHomeScreen = ({ route, navigation }: any) => {
  const session = React.useContext(SessionContext);
  const { job } = route.params || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    if (!session?.user?.id || !job?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          jobs!inner(company_id),
          profiles!applications_candidate_id_fkey(id, full_name, avatar_url)
        `)
        .eq('job_id', job.id)
        .eq('status', 'pending');

      if (error) throw error;

      const mapped: CandidateData[] = (data || []).map(app => {
         const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
         return {
            applicationId: app.id,
            id: profile?.id || Math.random().toString(),
            name: profile?.full_name || 'Candidato',
            age: 26,
            location: 'Colombia',
            availability: 'Tiempo Completo',
            role: 'Aplicante General',
            tags: ['Entusiasta', 'Proactivo'],
            imageUrl: profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'
         };
      });

      setCandidates(mapped);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [session?.user?.id, job?.id]);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'star',
    type: 'info' as 'info' | 'success'
  });
 
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Ya no filtramos localmente, usamos todos los candidatos de la base de datos para este puesto
  const filteredCandidates = candidates;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleAction = async (type: 'reject' | 'match' | 'superlike') => {
    const currentCandidate = filteredCandidates[currentIndex];
    if (!currentCandidate || !currentCandidate.applicationId) {
      console.warn("No candidate or applicationId found for index:", currentIndex);
      return;
    }

    // Actualizar Base de datos
    try {
       const isMatch = type === 'match' || type === 'superlike';
       const status = isMatch ? 'interview' : 'rejected';
       
       const { error: updateError } = await supabase
         .from('applications')
         .update({ status })
         .eq('id', currentCandidate.applicationId);

       if (updateError) {
         console.error("DB Error updating application status:", updateError);
         Alert.alert("Error al procesar", "Hubo un problema al actualizar el estado del candidato. Por favor intenta de nuevo.");
         return; // No avanzar el índice si falló la DB
       }

       if (isMatch) {
         // Asegurar que exista sala de chat
         const { data: existingRoom } = await supabase
           .from('chat_rooms')
           .select('id')
           .eq('application_id', currentCandidate.applicationId)
           .maybeSingle();

         if (!existingRoom) {
           const { error: roomError } = await supabase.from('chat_rooms').insert([
             {
               application_id: currentCandidate.applicationId,
               company_id: session?.user?.id,
               candidate_id: currentCandidate.id
             }
           ]);
           if (roomError) console.error("Error creating chat room:", roomError);
         }
       }
    } catch (e) {
       console.error("Unexpected error during swipe action:", e);
       Alert.alert("Error Inesperado", "Algo salió mal. Si el problema persiste, reinicia la aplicación.");
       return;
    }

    if (type === 'match') {
      setModalConfig({
        visible: true,
        title: '¡Candidato Preseleccionado!',
        message: `Excelente, hemos guardado el perfil de ${currentCandidate.name}. En breve notificaremos al candidato para iniciar el proceso de selección y los contactaremos con ustedes.`,
        icon: 'heart',
        type: 'success'
      });
    } else if (type === 'superlike') {
      setModalConfig({
        visible: true,
        title: '¡Evaluación Prioritaria!',
        message: `Hemos notificado a ${currentCandidate.name} sobre tu alto interés en su perfil para acelerar la comunicación.`,
        icon: 'zap',
        type: 'success'
      });
    } else if (type === 'reject') {
      setModalConfig({
        visible: true,
        title: 'Perfil Descartado',
        message: 'Hemos registrado tu decisión. Buscaremos candidatos que se alineen mejor con los requerimientos de la empresa.',
        icon: 'x-circle',
        type: 'info'
      });
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

  const currentCandidate = filteredCandidates[currentIndex];
  const nextCandidate = filteredCandidates[currentIndex + 1];

  const CandidateCard = ({ candidate }: { candidate: CandidateData }) => (
    <View style={styles.candidateCard}>
      <Image source={{ uri: candidate.imageUrl }} style={styles.candidateImage} resizeMode="cover" />
      <View style={styles.candidateOverlay}>
        <View style={styles.availabilityRow}>
            <View style={styles.availabilityBadge}>
                <Text style={styles.availabilityText}>DISPONIBLE</Text>
            </View>
            <Text style={styles.infoText}>{candidate.availability}</Text>
        </View>

        <View style={styles.nameRow}>
            <Text style={styles.candidateName}>{candidate.name}, {candidate.age}</Text>
            <TouchableOpacity 
              onPress={() => setDetailModalVisible(true)}
              style={styles.infoBtn}
            >
                <Ionicons name="information-circle-outline" size={24} color="#FF005C" />
            </TouchableOpacity>
        </View>

        <View style={styles.candidateLocation}>
            <Ionicons name="location" size={14} color="#FF005C" />
            <Text style={styles.locationLabel}>{candidate.location}</Text>
        </View>

        <View style={styles.candidateTags}>
            {candidate.tags.map((tag, idx) => (
                <View key={idx} style={styles.candidateTag}>
                    <Text style={styles.tagLabel}>{tag}</Text>
                </View>
            ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        
        <ObsidianHeader 
          title="Vacantes" 
          subtitle="MATCH FINDER"
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
          rightIcon="menu"
          onRightPress={() => navigation.navigate('JobDetail', { job })}
        />

        <View style={styles.cardArea}>
          {currentCandidate ? (
            <View style={styles.cardWrapper}>
              {nextCandidate && (
                <Animated.View style={[styles.nextCard, nextCardStyle]}>
                  <CandidateCard candidate={nextCandidate} />
                </Animated.View>
              )}

              <GestureDetector gesture={gesture}>
                <Animated.View style={[{ flex: 1 }, cardStyle]}>
                  <CandidateCard candidate={currentCandidate} />
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
               <Text style={styles.emptyTitle}>¡Eso es todo!</Text>
               <Text style={styles.emptyText}>Has visto a todos los candidatos disponibles para esta categoría.</Text>
            </View>
          )}
        </View>

        <ObsidianModal
          isVisible={modalConfig.visible}
          onClose={() => setModalConfig({ ...modalConfig, visible: false })}
          title={modalConfig.title}
          message={modalConfig.message}
          iconName={modalConfig.icon as any}
          type={modalConfig.type}
          confirmText="Continuar"
        />

        {currentCandidate && (
          <ObsidianDetailModal
            isVisible={detailModalVisible}
            onClose={() => setDetailModalVisible(false)}
            title={currentCandidate.name}
            subtitle={currentCandidate.role}
            imageUrl={currentCandidate.imageUrl}
            location={currentCandidate.location}
            tags={currentCandidate.tags}
            content={`Experto en el sector de ${currentCandidate.role}. Con amplia disponibilidad (${currentCandidate.availability}) para incorporarse a equipos dinámicos.`}
            accentColor="#FF005C"
          />
        )}
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
  candidateCard: {
    flex: 1,
    backgroundColor: '#121214',
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  candidateImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  candidateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    padding: 24,
    paddingBottom: 70, // Safe zone for buttons
    justifyContent: 'flex-end',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  availabilityBadge: {
    backgroundColor: '#FF005C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availabilityText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  candidateName: {
    flex: 1, // Allow name to take available space
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 10,
  },
  infoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 15, // Pushing it further in so it doesn't look 'salido'
  },
  candidateLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  candidateTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  candidateTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tagLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
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
    backgroundColor: '#FF005C',
    borderColor: 'rgba(255, 0, 92, 0.3)',
    shadowColor: '#FF005C',
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
