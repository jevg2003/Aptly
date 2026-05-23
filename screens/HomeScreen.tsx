import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { SessionContext } from '../lib/SessionContext';
import { useMatches } from '../lib/MatchContext';
import { JobCard, JobData } from '../components/JobCard';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';

import { ObsidianHeader } from '../components/ObsidianHeader';
import { ObsidianSwitcher } from '../components/ObsidianSwitcher';
import { ObsidianModal } from '../components/ObsidianModal';
import { ObsidianDetailModal } from '../components/ObsidianDetailModal';
import { OnboardingCandidate } from './profiles/OnboardingCandidate';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export const HomeScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const { addMatch } = useMatches();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Database Jobs
  const [allJobs, setAllJobs] = useState<JobData[]>([]);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Swipe State
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter State
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    modality: '', // 'Remoto', 'Presencial', 'Híbrido'
    type: '', // 'Tiempo Completo', 'Medio Tiempo', 'Práctica', 'Freelance'
    location: '', // search query
  });

  // Animation Shared Values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Filter Sheet Gesture State
  const sheetTranslateY = useSharedValue(0);

  const sheetGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        sheetTranslateY.value = event.translationY;
      } else {
        // Dragging up has stiff resistance
        sheetTranslateY.value = event.translationY * 0.15;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 400) {
        sheetTranslateY.value = withSpring(800, { damping: 20, stiffness: 200 }, () => {
          runOnJS(setFilterModalVisible)(false);
        });
      } else {
        sheetTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: sheetTranslateY.value }],
    };
  });

  // Hide bottom tab bar when filter modal is open
  useEffect(() => {
    if (navigation) {
      navigation.setOptions({
        tabBarStyle: filterModalVisible ? { display: 'none' } : undefined,
      });
    }
  }, [filterModalVisible, navigation]);

  // Reset vertical translation when filter is opened
  useEffect(() => {
    if (filterModalVisible) {
      sheetTranslateY.value = 0;
    }
  }, [filterModalVisible]);

  const dismissFilterSheet = useCallback(() => {
    sheetTranslateY.value = withSpring(800, { damping: 20, stiffness: 200 }, (finished) => {
      if (finished) {
        runOnJS(setFilterModalVisible)(false);
      }
    });
  }, [sheetTranslateY]);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'star',
    type: 'info' as 'success' | 'info',
  });

  const [detailModalVisible, setDetailModalVisible] = useState(false);

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

  const fetchJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      // Fetch active jobs and include company info by joining the profiles table
      const { data, error } = await supabase
        .from('jobs')
        .select(
          '*, profiles(full_name, bio, avatar_url, industry, business_area, company_tags, creation_date, phone)'
        )
        .eq('status', 'active');

      if (error) throw error;

      const mappedJobs: JobData[] = (data || []).map((job) => {
        let comTags: string[] = [];
        try {
          if (job.profiles?.company_tags) {
            if (typeof job.profiles.company_tags === 'string') {
              if (job.profiles.company_tags.trim().startsWith('[')) {
                comTags = JSON.parse(job.profiles.company_tags);
              } else {
                comTags = job.profiles.company_tags
                  .split(',')
                  .map((t: string) => t.trim())
                  .filter(Boolean);
              }
            } else if (Array.isArray(job.profiles.company_tags)) {
              comTags = job.profiles.company_tags;
            }
          }
        } catch (e) {
          console.warn('Error parsing company tags:', e);
        }

        return {
          id: job.id,
          title: job.title,
          company: job.profiles?.full_name || 'Empresa Privada',
          companyDescription: job.profiles?.bio || '',
          location: job.location,
          salary: job.salary,
          type: job.type,
          modality: job.modality,
          postedAt: 'Reciente',
          imageUrl: job.profiles?.avatar_url || '',
          tags: job.tags || [],
          // Rich details from database
          description: job.description || '',
          requirements: job.requirements || '',
          benefits: job.benefits || '',
          companyIndustry: job.profiles?.industry || '',
          companyBusinessArea: job.profiles?.business_area || '',
          companyPhone: job.profiles?.phone || '',
          companyTags: comTags,
          companyCreationDate: job.profiles?.creation_date || '',
        };
      });

      // Randomize the order a bit for a better swipe experience
      const shuffled = mappedJobs.sort(() => 0.5 - Math.random());
      setAllJobs(shuffled);
      setJobs(shuffled);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const applyFilters = (newFilters = activeFilters) => {
    let filtered = [...allJobs];

    if (newFilters.modality) {
      filtered = filtered.filter((job) =>
        job.modality?.toLowerCase().includes(newFilters.modality.toLowerCase())
      );
    }

    if (newFilters.type) {
      filtered = filtered.filter((job) =>
        job.type?.toLowerCase().includes(newFilters.type.toLowerCase())
      );
    }

    if (newFilters.location) {
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(newFilters.location.toLowerCase())
      );
    }

    setJobs(filtered);
    setCurrentIndex(0); // Reset swipe card index to 0
    setFilterModalVisible(false);
  };

  const clearFilters = () => {
    const defaultFilters = { modality: '', type: '', location: '' };
    setActiveFilters(defaultFilters);
    setJobs(allJobs);
    setCurrentIndex(0);
    setFilterModalVisible(false);
  };

  useEffect(() => {
    checkProfile();
    if (session?.user?.id) {
      fetchJobs();
    }
  }, [checkProfile, fetchJobs, session?.user?.id]);

  const handleAction = async (type: 'reject' | 'match' | 'superlike') => {
    const currentJob = jobs[currentIndex];
    if (!currentJob) return;

    if (type === 'match' || type === 'superlike') {
      addMatch(currentJob);
      // Guardar la postulación real en Supabase
      try {
        await supabase.from('applications').insert({
          candidate_id: session?.user?.id,
          job_id: currentJob.id,
          status: 'pending',
        });
      } catch (err) {
        console.error('Error guardando aplicacion:', err);
      }

      setModalConfig({
        visible: true,
        title: '¡Es un Match!',
        message:
          '¡Excelente elección! La empresa evaluará tu perfil para determinar si eres el candidato apto. Se comunicarán contigo en un plazo estimado de 3 a 5 días hábiles. ¡Mantente atento!',
        icon: 'heart',
        type: 'success',
      });
    } else if (type === 'reject') {
      setModalConfig({
        visible: true,
        title: 'Preferencia Guardada',
        message:
          'Entendido. Hemos filtrado esta vacante; tu tiempo es valioso y buscaremos algo que se ajuste mejor a lo que deseas.',
        icon: 'x-circle',
        type: 'info',
      });
      translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
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

  if (checkingProfile) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#050505',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ color: '#94a3b8', fontStyle: 'italic' }}>Iniciando Obsidian...</Text>
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

  const currentJob = jobs[currentIndex];
  const nextJob = jobs[currentIndex + 1];

  return (
    <View style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ObsidianHeader
          title="Exploration"
          subtitle="Top Matches"
          rightIcon="options"
          onRightPress={() => setFilterModalVisible(true)}
        />

        <View style={styles.cardArea}>
          {currentJob ? (
            <View style={styles.cardWrapper}>
              {nextJob && (
                <Animated.View style={[styles.nextCard, nextCardStyle]}>
                  <JobCard job={nextJob} onInfoPress={() => setDetailModalVisible(true)} />
                </Animated.View>
              )}

              <GestureDetector gesture={gesture}>
                <Animated.View style={[{ flex: 1 }, cardStyle]}>
                  <JobCard job={currentJob} onInfoPress={() => setDetailModalVisible(true)} />

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
                  <Ionicons name="heart" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {loadingJobs ? (
                <ActivityIndicator size="large" color="#00A3FF" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={80}
                    color="#00A3FF"
                    style={{ marginBottom: 20 }}
                  />
                  <Text
                    style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginBottom: 10 }}>
                    Has visto todo
                  </Text>
                  <Text
                    style={{
                      color: '#94a3b8',
                      textAlign: 'center',
                      paddingHorizontal: 40,
                      lineHeight: 22,
                    }}>
                    Has deslizado por todas las vacantes por ahora. Las empresas subirán nuevas
                    opciones pronto.
                  </Text>
                </>
              )}
            </View>
          )}
        </View>

        <ObsidianModal
          isVisible={modalConfig.visible}
          onClose={() => setModalConfig({ ...modalConfig, visible: false })}
          title={modalConfig.title}
          message={modalConfig.message}
          iconName={modalConfig.icon as any}
          type={modalConfig.type === 'success' ? 'success' : 'info'}
          confirmText="Continuar"
        />

        {currentJob && (
          <ObsidianDetailModal
            isVisible={detailModalVisible}
            onClose={() => setDetailModalVisible(false)}
            title={currentJob.title}
            subtitle={currentJob.company}
            imageUrl={currentJob.imageUrl}
            location={currentJob.location}
            salary={currentJob.salary}
            tags={currentJob.tags}
            content={
              currentJob.companyDescription ||
              'Forma parte de una de las empresas más innovadoras del sector.'
            }
            accentColor="#00A3FF"
            // Rich Job Detail Props
            isJobDetail={true}
            jobDescription={currentJob.description}
            jobRequirements={currentJob.requirements}
            jobBenefits={currentJob.benefits}
            jobType={currentJob.type}
            jobModality={currentJob.modality}
            // Rich Company Profile Props
            companyBio={currentJob.companyDescription}
            companyIndustry={currentJob.companyIndustry}
            companyBusinessArea={currentJob.companyBusinessArea}
            companyPhone={currentJob.companyPhone}
            companyTags={currentJob.companyTags}
            companyCreationDate={currentJob.companyCreationDate}
          />
        )}
      </SafeAreaView>

      {/* Obsidian-themed Functional Filter Modal - Positioned outside SafeAreaView to cover entire screen including bottom tab bar */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={dismissFilterSheet}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={dismissFilterSheet}>
            <View style={styles.filterOverlay}>
              <TouchableWithoutFeedback>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  style={styles.filterKeyboardContainer}>
                  <Animated.View style={[styles.filterContainer, sheetAnimatedStyle]}>
                    <GestureDetector gesture={sheetGesture}>
                      <View style={styles.dragHandleArea}>
                        <View style={styles.dragIndicator} />

                        <View style={styles.filterHeader}>
                          <Text style={styles.filterTitle}>Filtrar Empleos</Text>
                          <TouchableOpacity onPress={dismissFilterSheet} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </GestureDetector>

                    <ScrollView
                      contentContainerStyle={styles.filterScroll}
                      showsVerticalScrollIndicator={false}>
                      <Text style={styles.filterSectionTitle}>Modalidad</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalChipsScroll}
                        style={styles.horizontalScrollWrapper}>
                        {['', 'Remoto', 'Presencial', 'Híbrido'].map((mod) => (
                          <TouchableOpacity
                            key={mod}
                            onPress={() => setActiveFilters({ ...activeFilters, modality: mod })}
                            style={[
                              styles.filterChip,
                              activeFilters.modality === mod && styles.activeFilterChip,
                            ]}>
                            <Text
                              style={[
                                styles.filterChipText,
                                activeFilters.modality === mod && styles.activeFilterChipText,
                              ]}>
                              {mod === '' ? 'Todos' : mod}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      <Text style={styles.filterSectionTitle}>Tipo de Empleo</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalChipsScroll}
                        style={styles.horizontalScrollWrapper}>
                        {['', 'Tiempo Completo', 'Medio Tiempo', 'Práctica', 'Freelance'].map(
                          (t) => (
                            <TouchableOpacity
                              key={t}
                              onPress={() => setActiveFilters({ ...activeFilters, type: t })}
                              style={[
                                styles.filterChip,
                                activeFilters.type === t && styles.activeFilterChip,
                              ]}>
                              <Text
                                style={[
                                  styles.filterChipText,
                                  activeFilters.type === t && styles.activeFilterChipText,
                                ]}>
                                {t === '' ? 'Todos' : t}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </ScrollView>

                      <Text style={styles.filterSectionTitle}>Ubicación (Ciudad o País)</Text>
                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="location-outline"
                          size={20}
                          color="#64748B"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.filterInput}
                          placeholder="Ej. Bogotá, Cali, Colombia..."
                          placeholderTextColor="#475569"
                          value={activeFilters.location}
                          onChangeText={(text) =>
                            setActiveFilters({ ...activeFilters, location: text })
                          }
                        />
                        {activeFilters.location !== '' && (
                          <TouchableOpacity
                            onPress={() => setActiveFilters({ ...activeFilters, location: '' })}>
                            <Ionicons name="close-circle" size={18} color="#64748B" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </ScrollView>

                    <View style={styles.filterActions}>
                      <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
                        <Text style={styles.clearBtnText}>Limpiar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => applyFilters()} style={styles.applyBtn}>
                        <Text style={styles.applyBtnText}>Aplicar Filtros</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </GestureHandlerRootView>
      </Modal>
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
  // FILTER MODAL styles
  filterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  filterKeyboardContainer: {
    width: '100%',
  },
  filterContainer: {
    backgroundColor: '#121214',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 24,
    maxHeight: Dimensions.get('window').height * 0.85,
  },
  dragHandleArea: {
    width: '100%',
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  dragIndicator: {
    width: 48,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterScroll: {
    paddingBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  horizontalScrollWrapper: {
    marginBottom: 16,
  },
  horizontalChipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 24,
    paddingBottom: 8,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  activeFilterChip: {
    backgroundColor: '#00A3FF',
    borderColor: '#00A3FF',
    shadowColor: '#00A3FF',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginTop: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  filterInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 20,
  },
  clearBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  clearBtnText: {
    color: '#94A3B8',
    fontWeight: '800',
    fontSize: 15,
  },
  applyBtn: {
    flex: 2,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A3FF',
    shadowColor: '#00A3FF',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
