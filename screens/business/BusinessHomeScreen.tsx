import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
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
  runOnJS,
} from 'react-native-reanimated';
import { SessionContext } from '../../lib/SessionContext';
import { supabase } from '../../lib/supabase';

import { ObsidianHeader } from '../../components/ObsidianHeader';
import { ObsidianModal } from '../../components/ObsidianModal';
import { ObsidianDetailModal } from '../../components/ObsidianDetailModal';
import { calculateMatchScore } from '../../lib/matchingEngine';

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
  phone?: string;
  bio?: string;
  experienceLevel?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  birthDate?: string;
  industryInterests?: string[];
  candidateTags?: string[];
  matchScore?: number;
}


const CATEGORIES = ['Todos', 'Programador', 'Vendedor', 'Tienda'];


export const BusinessHomeScreen = ({ route, navigation }: any) => {
  const session = React.useContext(SessionContext);
  const { job } = route.params || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = React.useCallback(async () => {
    if (!session?.user?.id || !job?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(
          `
          id,
          status,
          jobs!inner(company_id),
          profiles!applications_candidate_id_fkey(
            id, full_name, avatar_url, location, phone, bio, professional_title,
            candidate_tags, industry_interests, experience_level, portfolio_url, linkedin_url, birth_date
          )
        `
        )
        .eq('job_id', job.id)
        .eq('status', 'pending');

      if (error) throw error;

      const mapped: CandidateData[] = (data || []).map((app) => {
        const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
        let candTags: string[] = [];
        let indInterests: string[] = [];
        try {
          if (profile?.candidate_tags) {
            if (typeof profile.candidate_tags === 'string') {
              if (profile.candidate_tags.trim().startsWith('[')) {
                candTags = JSON.parse(profile.candidate_tags);
              } else {
                candTags = profile.candidate_tags
                  .split(',')
                  .map((t: string) => t.trim())
                  .filter(Boolean);
              }
            } else if (Array.isArray(profile.candidate_tags)) {
              candTags = profile.candidate_tags;
            }
          }
          if (profile?.industry_interests) {
            if (typeof profile.industry_interests === 'string') {
              if (profile.industry_interests.trim().startsWith('[')) {
                indInterests = JSON.parse(profile.industry_interests);
              } else {
                indInterests = profile.industry_interests
                  .split(',')
                  .map((t: string) => t.trim())
                  .filter(Boolean);
              }
            } else if (Array.isArray(profile.industry_interests)) {
              indInterests = profile.industry_interests;
            }
          }
        } catch (e) {
          console.warn('Error parsing candidate fields:', e);
        }

        let jobTagsArray: string[] = [];
        if (job?.tags) {
          if (typeof job.tags === 'string') {
            jobTagsArray = job.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
          } else if (Array.isArray(job.tags)) {
            jobTagsArray = job.tags;
          }
        }

        const score = calculateMatchScore({
          tags: candTags,
          professionalTitle: profile?.professional_title || '',
          location: profile?.location || '',
          experienceLevel: profile?.experience_level || '',
          industryInterests: indInterests
        }, {
          tags: jobTagsArray,
          title: job?.title || '',
          location: job?.location || '',
          modality: job?.modality || '',
          description: job?.description || '',
          requirements: job?.requirements || ''
        });

        return {
          applicationId: app.id,
          id: profile?.id || Math.random().toString(),
          name: profile?.full_name || 'Candidato',
          age: 26,
          location: profile?.location || 'Colombia',
          availability: 'Tiempo Completo',
          role: profile?.professional_title || 'Aplicante General',
          tags: candTags.length > 0 ? candTags : ['Entusiasta', 'Proactivo'],
          imageUrl: profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
          phone: profile?.phone || '',
          bio: profile?.bio || '',
          experienceLevel: profile?.experience_level || '',
          portfolioUrl: profile?.portfolio_url || '',
          linkedinUrl: profile?.linkedin_url || '',
          birthDate: profile?.birth_date || '',
          industryInterests: indInterests,
          candidateTags: candTags,
          matchScore: score
        };
      });

      mapped.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      setCandidates(mapped);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, job?.id]);

  useEffect(() => {
    fetchCandidates();
  }, [session?.user?.id, job?.id]);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'star',
    type: 'info' as 'info' | 'success',
  });

  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Ya no filtramos localmente, usamos todos los candidatos de la base de datos para este puesto
  const filteredCandidates = candidates;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleAction = async (type: 'reject' | 'match' | 'superlike') => {
    const currentCandidate = filteredCandidates[currentIndex];
    if (!currentCandidate || !currentCandidate.applicationId) {
      console.warn('No candidate or applicationId found for index:', currentIndex);
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
        console.error('DB Error updating application status:', updateError);
        Alert.alert(
          'Error al procesar',
          'Hubo un problema al actualizar el estado del candidato. Por favor intenta de nuevo.'
        );
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
              candidate_id: currentCandidate.id,
            },
          ]);
          if (roomError) console.error('Error creating chat room:', roomError);
        }
      }
    } catch (e) {
      console.error('Unexpected error during swipe action:', e);
      Alert.alert(
        'Error Inesperado',
        'Algo salió mal. Si el problema persiste, reinicia la aplicación.'
      );
      return;
    }

    if (type === 'match') {
      setModalConfig({
        visible: true,
        title: '¡Candidato Preseleccionado!',
        message: `Excelente, hemos guardado el perfil de ${currentCandidate.name}. En breve notificaremos al candidato para iniciar el proceso de selección y los contactaremos con ustedes.`,
        icon: 'heart',
        type: 'success',
      });
    } else if (type === 'superlike') {
      setModalConfig({
        visible: true,
        title: '¡Evaluación Prioritaria!',
        message: `Hemos notificado a ${currentCandidate.name} sobre tu alto interés en su perfil para acelerar la comunicación.`,
        icon: 'zap',
        type: 'success',
      });
    } else if (type === 'reject') {
      setModalConfig({
        visible: true,
        title: 'Perfil Descartado',
        message:
          'Hemos registrado tu decisión. Buscaremos candidatos que se alineen mejor con los requerimientos de la empresa.',
        icon: 'x-circle',
        type: 'info',
      });
    }

    translateX.value = 0;
    translateY.value = 0;
    setCurrentIndex((prev) => prev + 1);
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
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, () =>
          runOnJS(onSwipeComplete)('right')
        );
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () =>
          runOnJS(onSwipeComplete)('left')
        );
      } else if (translateY.value < -SWIPE_THRESHOLD) {
        translateY.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () =>
          runOnJS(onSwipeComplete)('up')
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-8, 0, 8],
      Extrapolate.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.92, 1],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.6, 1],
      Extrapolate.CLAMP
    );
    return { transform: [{ scale }], opacity };
  });

  const likeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0, 0.4, 1],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.6, 1.1],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }, { rotate: '-12deg' }],
    };
  });

  const nopeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      [1, 0.4, 0],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1.1, 0.6],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }, { rotate: '12deg' }],
    };
  });

  const currentCandidate = filteredCandidates[currentIndex];
  const nextCandidate = filteredCandidates[currentIndex + 1];

  const CandidateCard = ({ candidate }: { candidate: CandidateData }) => {
    let jobTagsArray: string[] = [];
    if (job?.tags) {
      if (typeof job.tags === 'string') {
        jobTagsArray = job.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      } else if (Array.isArray(job.tags)) {
        jobTagsArray = job.tags;
      }
    }
    const normalizedJobTags = jobTagsArray.map(jt => jt.toLowerCase().trim());

    return (
      <View style={styles.candidateCard}>
        <Image source={{ uri: candidate.imageUrl }} style={styles.candidateImage} resizeMode="cover" />
        
        {/* Glowing Premium Match Score Badge for Recruiters */}
        {candidate.matchScore !== undefined && (
          <View style={styles.matchScoreBadge}>
             <Ionicons name="sparkles" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
             <Text style={styles.matchScoreBadgeText}>{candidate.matchScore}% APTO</Text>
          </View>
        )}

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
              {candidate.tags.map((tag, idx) => {
                  const isMatch = normalizedJobTags.includes(tag.toLowerCase().trim()) ||
                                  normalizedJobTags.some(jt => jt.includes(tag.toLowerCase().trim()) || tag.toLowerCase().trim().includes(jt));
                  return (
                      <View key={idx} style={[styles.candidateTag, isMatch && styles.candidateMatchingTag]}>
                          <Text style={[styles.tagLabel, isMatch && styles.candidateMatchingTagLabel]}>{tag}</Text>
                      </View>
                  );
              })}
          </View>
        </View>
      </View>
    );
  };

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

                  {/* LIKE / APTO Stamp */}
                  <Animated.View style={[styles.stampContainer, styles.likeStamp, likeStampStyle]}>
                    <Ionicons name="checkmark-circle" size={26} color="#00E676" />
                    <Text style={styles.likeStampText}>APTO</Text>
                  </Animated.View>

                  {/* NOPE / NO APTO Stamp */}
                  <Animated.View style={[styles.stampContainer, styles.nopeStamp, nopeStampStyle]}>
                    <Ionicons name="close-circle" size={26} color="#FF3B30" />
                    <Text style={styles.nopeStampText}>NO APTO</Text>
                  </Animated.View>
                </Animated.View>
              </GestureDetector>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  onPress={() => handleAction('reject')}
                  style={[styles.actionBtn, styles.rejectBtn]}>
                  <Ionicons name="close" size={30} color="#FF3B30" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleAction('superlike')}
                  style={[styles.actionBtn, styles.superBtn]}>
                  <Ionicons name="star" size={24} color="#FFCC00" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleAction('match')}
                  style={[styles.actionBtn, styles.matchBtn]}>
                  <Ionicons name="thumbs-up" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="sparkles" size={60} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyTitle}>¡Eso es todo!</Text>
              <Text style={styles.emptyText}>
                Has visto a todos los candidatos disponibles para esta categoría.
              </Text>
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
            // Rich Candidate Detail Props
            isCandidateDetail={true}
            candidateBio={currentCandidate.bio}
            candidatePhone={currentCandidate.phone}
            candidateExperienceLevel={currentCandidate.experienceLevel}
            candidatePortfolioUrl={currentCandidate.portfolioUrl}
            candidateLinkedinUrl={currentCandidate.linkedinUrl}
            candidateBirthDate={currentCandidate.birthDate}
            candidateIndustryInterests={currentCandidate.industryInterests}
            candidateTags={currentCandidate.candidateTags}
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
  candidateMatchingTag: {
    backgroundColor: 'rgba(255, 0, 92, 0.15)',
    borderColor: 'rgba(255, 0, 92, 0.45)',
    borderWidth: 1.2,
  },
  candidateMatchingTagLabel: {
    color: '#FF005C',
    fontWeight: '800',
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: 'rgba(255, 0, 92, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF005C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#FF005C',
  },
  matchScoreBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
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
  },
  // STAMP styles
  stampContainer: {
    position: 'absolute',
    top: 40,
    zIndex: 100,
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(5, 5, 5, 0.95)',
  },
  likeStamp: {
    left: 30,
    borderColor: '#00E676',
    shadowColor: '#00E676',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  likeStampText: {
    color: '#00E676',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  nopeStamp: {
    right: 30,
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  nopeStampText: {
    color: '#FF3B30',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
