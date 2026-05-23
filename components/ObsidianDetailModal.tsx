import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Platform,
  PanResponder,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ObsidianDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string; // Job Title or Candidate Name
  subtitle?: string; // Company Name or Candidate Role
  content: string; // Fallback bio/description
  imageUrl?: string;
  tags?: string[];
  salary?: string;
  location?: string;
  accentColor?: string;

  // EXTRA RICH DATA FOR JOB/COMPANY
  isJobDetail?: boolean;
  jobDescription?: string;
  jobRequirements?: string;
  jobBenefits?: string;
  jobType?: string;
  jobModality?: string;

  companyBio?: string;
  companyIndustry?: string;
  companyBusinessArea?: string;
  companyPhone?: string;
  companyTags?: string[];
  companyCreationDate?: string;

  // EXTRA RICH DATA FOR CANDIDATE
  isCandidateDetail?: boolean;
  candidateBio?: string;
  candidatePhone?: string;
  candidateExperienceLevel?: string;
  candidatePortfolioUrl?: string;
  candidateLinkedinUrl?: string;
  candidateBirthDate?: string;
  candidateIndustryInterests?: string[];
  candidateTags?: string[];
}

export const ObsidianDetailModal: React.FC<ObsidianDetailModalProps> = ({
  isVisible,
  onClose,
  title,
  subtitle,
  content,
  imageUrl,
  tags,
  salary,
  location,
  accentColor = '#FF005C',

  // Job specifics
  isJobDetail = false,
  jobDescription,
  jobRequirements,
  jobBenefits,
  jobType,
  jobModality,

  // Company specifics
  companyBio,
  companyIndustry,
  companyBusinessArea,
  companyPhone,
  companyTags,
  companyCreationDate,

  // Candidate specifics
  isCandidateDetail = false,
  candidateBio,
  candidatePhone,
  candidateExperienceLevel,
  candidatePortfolioUrl,
  candidateLinkedinUrl,
  candidateBirthDate,
  candidateIndustryInterests,
  candidateTags,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<'job' | 'company'>('job');

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 1.2) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleOpenLink = (url?: string) => {
    if (!url) return;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.canOpenURL(cleanUrl).then((supported) => {
      if (supported) {
        Linking.openURL(cleanUrl);
      } else {
        Alert.alert('Enlace inválido', 'No se puede abrir la dirección proporcionada: ' + url);
      }
    });
  };

  return (
    <RNModal transparent visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)' }]} />
          )}
        </TouchableOpacity>

        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
          {/* Header Drag Handle */}
          <View {...panResponder.panHandlers} style={styles.handleZone}>
            <View style={styles.handle} />
          </View>

          {/* Job vs Company Tab Switcher (Only if it's a job detail modal) */}
          {isJobDetail && (
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'job' && { borderBottomColor: accentColor },
                ]}
                onPress={() => setActiveTab('job')}>
                <Ionicons
                  name="briefcase"
                  size={18}
                  color={activeTab === 'job' ? accentColor : '#64748b'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'job'
                      ? { color: '#FFFFFF', fontWeight: '800' }
                      : { color: '#64748b' },
                  ]}>
                  El Puesto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'company' && { borderBottomColor: accentColor },
                ]}
                onPress={() => setActiveTab('company')}>
                <Ionicons
                  name="business"
                  size={18}
                  color={activeTab === 'company' ? accentColor : '#64748b'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'company'
                      ? { color: '#FFFFFF', fontWeight: '800' }
                      : { color: '#64748b' },
                  ]}>
                  La Empresa
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {imageUrl && (
              <Image source={{ uri: imageUrl }} style={styles.coverImage} resizeMode="cover" />
            )}

            {/* General Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && (
                <Text style={[styles.subtitle, { color: accentColor }]}>{subtitle}</Text>
              )}
            </View>

            {/* ========================================================
                JOB SPECIFIC - TAB 1: JOB DETAILS
                ======================================================== */}
            {isJobDetail && activeTab === 'job' && (
              <View>
                {/* Meta Rows */}
                <View style={styles.metaRow}>
                  {location && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="location-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>{location}</Text>
                    </View>
                  )}
                  {jobModality && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="home-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>{jobModality}</Text>
                    </View>
                  )}
                  {jobType && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="time-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>{jobType}</Text>
                    </View>
                  )}
                  {salary && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="cash-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>{salary}</Text>
                    </View>
                  )}
                </View>

                {/* Job Tags */}
                {tags && tags.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Requisitos clave</Text>
                    <View style={styles.tagsContainer}>
                      {tags.map((tag, i) => (
                        <View
                          key={i}
                          style={[
                            styles.tag,
                            {
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              borderColor: 'rgba(255,255,255,0.08)',
                            },
                          ]}>
                          <Text style={[styles.tagText, { color: '#cbd5e1' }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Job Description */}
                <View style={styles.contentSection}>
                  <Text style={styles.sectionTitle}>Descripción del Puesto</Text>
                  <Text style={styles.contentText}>
                    {jobDescription || content || 'No se especificó descripción para esta vacante.'}
                  </Text>
                </View>

                {/* Job Requirements */}
                {jobRequirements && (
                  <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>Requisitos Detallados</Text>
                    <Text style={styles.contentText}>{jobRequirements}</Text>
                  </View>
                )}

                {/* Job Benefits */}
                {jobBenefits && (
                  <View style={[styles.contentSection, { marginBottom: 50 }]}>
                    <Text style={styles.sectionTitle}>Beneficios & Compensación</Text>
                    <Text style={styles.contentText}>{jobBenefits}</Text>
                  </View>
                )}
              </View>
            )}

            {/* ========================================================
                JOB SPECIFIC - TAB 2: COMPANY DETAILS
                ======================================================== */}
            {isJobDetail && activeTab === 'company' && (
              <View>
                {/* Meta Rows for Company */}
                <View style={styles.metaRow}>
                  {companyIndustry && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="prism-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>{companyIndustry}</Text>
                    </View>
                  )}
                  {companyBusinessArea && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="options-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>{companyBusinessArea}</Text>
                    </View>
                  )}
                  {companyCreationDate && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="calendar-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>Fundación: {companyCreationDate}</Text>
                    </View>
                  )}
                  {companyPhone && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="call-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>{companyPhone}</Text>
                    </View>
                  )}
                </View>

                {/* Company Bio */}
                <View style={styles.contentSection}>
                  <Text style={styles.sectionTitle}>Sobre la Empresa</Text>
                  <Text style={styles.contentText}>
                    {companyBio ||
                      'Esta empresa destaca en su sector impulsando el talento local con altos estándares.'}
                  </Text>
                </View>

                {/* Company Tags */}
                {companyTags && companyTags.length > 0 && (
                  <View style={[styles.sectionContainer, { marginBottom: 50 }]}>
                    <Text style={styles.sectionTitle}>Cultura & Valores</Text>
                    <View style={styles.tagsContainer}>
                      {companyTags.map((tag, i) => (
                        <View
                          key={i}
                          style={[
                            styles.tag,
                            {
                              backgroundColor: `${accentColor}10`,
                              borderColor: `${accentColor}25`,
                            },
                          ]}>
                          <Text style={[styles.tagText, { color: accentColor }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ========================================================
                CANDIDATE SPECIFIC
                ======================================================== */}
            {isCandidateDetail && (
              <View>
                {/* Meta Rows for Candidate */}
                <View style={styles.metaRow}>
                  {location && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="location-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>{location}</Text>
                    </View>
                  )}
                  {candidateExperienceLevel && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="trending-up-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>{candidateExperienceLevel}</Text>
                    </View>
                  )}
                  {candidateBirthDate && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="calendar-clear-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>Nacimiento: {candidateBirthDate}</Text>
                    </View>
                  )}
                  {candidatePhone && (
                    <View
                      style={[
                        styles.metaItem,
                        { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` },
                      ]}>
                      <Ionicons name="call-outline" size={16} color={accentColor} />
                      <Text style={styles.metaText}>{candidatePhone}</Text>
                    </View>
                  )}
                </View>

                {/* Candidate Links (Portfolio / LinkedIn) */}
                {(candidateLinkedinUrl || candidatePortfolioUrl) && (
                  <View style={styles.linksContainer}>
                    {candidateLinkedinUrl && (
                      <TouchableOpacity
                        style={[styles.linkButton, { backgroundColor: '#0077B5' }]}
                        onPress={() => handleOpenLink(candidateLinkedinUrl)}>
                        <Ionicons
                          name="logo-linkedin"
                          size={18}
                          color="white"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.linkButtonText}>Ver LinkedIn</Text>
                      </TouchableOpacity>
                    )}
                    {candidatePortfolioUrl && (
                      <TouchableOpacity
                        style={[
                          styles.linkButton,
                          { backgroundColor: '#1A1A1C', borderWidth: 1, borderColor: '#334155' },
                        ]}
                        onPress={() => handleOpenLink(candidatePortfolioUrl)}>
                        <Ionicons
                          name="globe-outline"
                          size={18}
                          color="white"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.linkButtonText}>Ver Portafolio</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Candidate Bio */}
                <View style={styles.contentSection}>
                  <Text style={styles.sectionTitle}>Biografía / Presentación</Text>
                  <Text style={styles.contentText}>
                    {candidateBio ||
                      content ||
                      'El candidato no ha proporcionado una presentación detallada aún.'}
                  </Text>
                </View>

                {/* Candidate Tags */}
                {candidateTags && candidateTags.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Habilidades / Habilidades Técnicas</Text>
                    <View style={styles.tagsContainer}>
                      {candidateTags.map((tag, i) => (
                        <View
                          key={i}
                          style={[
                            styles.tag,
                            {
                              backgroundColor: `${accentColor}12`,
                              borderColor: `${accentColor}25`,
                            },
                          ]}>
                          <Text style={[styles.tagText, { color: accentColor }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Candidate Industry Interests */}
                {candidateIndustryInterests && candidateIndustryInterests.length > 0 && (
                  <View style={[styles.sectionContainer, { marginBottom: 50 }]}>
                    <Text style={styles.sectionTitle}>Sectores de Interés</Text>
                    <View style={styles.tagsContainer}>
                      {candidateIndustryInterests.map((tag, i) => (
                        <View
                          key={i}
                          style={[
                            styles.tag,
                            {
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              borderColor: 'rgba(255,255,255,0.08)',
                            },
                          ]}>
                          <Text style={[styles.tagText, { color: '#cbd5e1' }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.closeBtn,
              { backgroundColor: `${accentColor}26`, borderColor: `${accentColor}4d` },
            ]}
            onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#050505',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  handleZone: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF005C',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 92, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 92, 0.12)',
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  contentText: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 24,
    fontWeight: '400',
  },
  linksContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  linkButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    position: 'absolute',
    top: 15,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 20,
  },
});
