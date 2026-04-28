import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Alert,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolateColor,
  withDelay
} from 'react-native-reanimated';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { supabase } from '../lib/supabase';
import { useApp } from '../lib/AppContext';
import { ObsidianModal } from '../components/ObsidianModal';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#050505',
  card: '#121214',
  candidate: '#00A3FF',
  company: '#FF005C',
  text: '#FFFFFF',
  textSecondary: '#94a3b8',
  border: 'rgba(255, 255, 255, 0.05)',
};

const SECTORS = ['Tecnología', 'Salud', 'Finanzas', 'Construcción', 'Comercio', 'Manufactura', 'Servicios', 'Marketing', 'Educación', 'Otro'];

export const RegisterScreen = ({ navigation, route }: any) => {
  const { setIsBusiness } = useApp();
  const initialRole = route?.params?.initialRole || 'candidate';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [legalRepresentative, setLegalRepresentative] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [companyStep, setCompanyStep] = useState(1);
  
  const [candidateStep, setCandidateStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profession, setProfession] = useState('');
  const [candidateSectors, setCandidateSectors] = useState<string[]>([]);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (selectedDate) {
      setDateObj(selectedDate);
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formatted = `${day}/${month}/${year}`;
      
      if (localRole === 'company') {
        setCreationDate(formatted);
      } else {
        setBirthDate(formatted);
      }
    }
  };
  
  const [loading, setLoading] = useState(false);
  
  const [localRole, setLocalRole] = useState<'candidate' | 'company'>(initialRole);
  
  const switchAnim = useSharedValue(initialRole === 'company' ? 1 : 0);
  const contentFade = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);
  const [containerWidth, setContainerWidth] = useState(0);
  const [alertConfig, setAlertConfig] = useState({ 
    visible: false, 
    title: '', 
    message: '', 
    icon: 'info' as any, 
    type: 'info' as any, 
    onOk: () => {} 
  });

  useEffect(() => {
    contentFade.value = withTiming(1, { duration: 800 });
    cardTranslateY.value = withSpring(0, { damping: 15 });
  }, []);

  const handleRoleChange = (role: 'candidate' | 'company') => {
    setLocalRole(role);
    if (role === 'company') setCompanyStep(1);
    if (role === 'candidate') setCandidateStep(1);
    switchAnim.value = withSpring(role === 'candidate' ? 0 : 1, { damping: 20 });
  };

  const animatedSwitchStyle = useAnimatedStyle(() => {
    const isMoving = switchAnim.value > 0.1 && switchAnim.value < 0.9;
    const stretch = withSpring(isMoving ? 1.1 : 1, { damping: 10 });
    const travelDistance = (containerWidth - 12) / 2;

    return {
      transform: [
        { translateX: withSpring(switchAnim.value * travelDistance) },
        { scaleX: stretch }
      ],
      backgroundColor: interpolateColor(
        switchAnim.value,
        [0, 1],
        [COLORS.candidate, COLORS.company]
      ),
      shadowColor: interpolateColor(
        switchAnim.value,
        [0, 1],
        [COLORS.candidate, COLORS.company]
      ),
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
    };
  });

  const animatedAccentStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        switchAnim.value,
        [0, 1],
        [COLORS.candidate, COLORS.company]
      ),
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      opacity: contentFade.value,
      transform: [{ translateY: cardTranslateY.value }],
    };
  });

  const handleRegister = async () => {
    const isCompanyIncomplete = localRole === 'company' && (!companyName || !taxId || !legalRepresentative || !creationDate || selectedSectors.length === 0);
    const isCandidateIncomplete = localRole === 'candidate' && (!fullName || !birthDate || !profession || candidateSectors.length === 0);

    if (!email || !password || isCompanyIncomplete || isCandidateIncomplete) {
      setAlertConfig({
        visible: true,
        title: 'Datos Incompletos',
        message: 'Por favor completa todos los campos para continuar.',
        icon: 'edit-3',
        type: 'info',
        onOk: () => {}
      });
      return;
    }
    if (password !== confirmPassword) {
      setAlertConfig({
        visible: true,
        title: 'Error de Seguridad',
        message: 'Las contraseñas no coinciden. Por favor verifica.',
        icon: 'shield-off',
        type: 'destructive',
        onOk: () => {}
      });
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: localRole === 'company' ? { 
          full_name: companyName,
          role: 'company',
          tax_id: taxId,
          legal_representative: legalRepresentative,
          creation_date: creationDate,
          industry: selectedSectors.join(', '),
          avatar_url: avatarUrl
        } : { 
          full_name: fullName,
          role: 'candidate',
          birth_date: birthDate,
          profession: profession,
          industry_interests: candidateSectors.join(', '),
          avatar_url: avatarUrl
        }
      }
    });
    setLoading(false);

    if (error) {
      setAlertConfig({
        visible: true,
        title: 'Error de Registro',
        message: error.message,
        icon: 'alert-circle',
        type: 'destructive',
        onOk: () => {}
      });
    } else {
      setAlertConfig({
        visible: true,
        title: '¡Bienvenido!',
        message: 'Cuenta creada con éxito. Hemos enviado un correo de verificación.',
        icon: 'mail',
        type: 'success',
        onOk: () => navigation.navigate('Login')
      });
    }
  };

  const totalSteps = localRole === 'company' ? 4 : 3;
  const currentStep = localRole === 'company' ? companyStep : candidateStep;
  const accentColor = localRole === 'company' ? COLORS.company : COLORS.candidate;

  const showAlert = (msg: string) => {
    setAlertConfig({ visible: true, title: 'Datos Incompletos', message: msg, icon: 'edit-3', type: 'info', onOk: () => {} });
  };

  const handleNext = () => {
    setShowDatePicker(false);
    if (localRole === 'company') {
      if (companyStep === 1) {
        if (!companyName || !taxId) return showAlert('Por favor, ingresa el nombre de la empresa y NIT.');
        setCompanyStep(2);
      } else if (companyStep === 2) {
        if (!legalRepresentative || !creationDate) return showAlert('Por favor, ingresa el representante y la fecha.');
        setCompanyStep(3);
      } else if (companyStep === 3) {
        if (selectedSectors.length === 0) return showAlert('Selecciona al menos un sector.');
        setCompanyStep(4);
      } else {
        handleRegister();
      }
    } else {
      if (candidateStep === 1) {
        if (!fullName || !birthDate) return showAlert('Por favor, ingresa tu nombre y fecha de nacimiento.');
        setCandidateStep(2);
      } else if (candidateStep === 2) {
        if (!profession || candidateSectors.length === 0) return showAlert('Ingresa tu profesión y al menos un sector de interés.');
        setCandidateStep(3);
      } else {
        handleRegister();
      }
    }
  };

  const handleBack = () => {
    setShowDatePicker(false);
    if (localRole === 'company') {
      if (companyStep > 1) setCompanyStep(companyStep - 1);
      else navigation.goBack();
    } else {
      if (candidateStep > 1) setCandidateStep(candidateStep - 1);
      else navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.safeArea}>
          
          {/* Top Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBarFill, { 
               width: `${(currentStep / totalSteps) * 100}%`,
               backgroundColor: accentColor
            }]} />
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Animated.View style={[animatedCardStyle, { flex: 1 }]}>
                
                {localRole === 'candidate' && (
                  <>
                    {candidateStep === 1 && (
                      <View style={styles.stepContainer}>
                        <Text style={styles.questionTitle}>Para empezar, ¿cuál es tu nombre y fecha de nacimiento?</Text>
                        
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                          <TouchableOpacity onPress={pickImage} style={styles.avatarPicker}>
                            {avatarUrl ? (
                              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                            ) : (
                              <View style={styles.avatarPlaceholder}>
                                <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.candidate} />
                                <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>Añadir foto</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        </View>

                        <CustomInput placeholder="Nombre Completo" value={fullName} onChangeText={setFullName} iconName="account-outline" />
                        
                        <TouchableOpacity 
                          activeOpacity={0.8} 
                          onPress={() => setShowDatePicker(true)}
                          style={styles.dateSelector}
                        >
                          <MaterialCommunityIcons name="calendar" size={20} color={birthDate ? COLORS.candidate : "#64748b"} />
                          <Text style={[styles.dateText, !birthDate && styles.datePlaceholder]}>
                            {birthDate || 'Fecha de Nacimiento (DD/MM/AAAA)'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {candidateStep === 2 && (
                      <View style={styles.stepContainer}>
                        <Text style={styles.questionTitle}>¿A qué te dedicas y cuáles son tus sectores de interés?</Text>
                        <CustomInput placeholder="Profesión u Ocupación Principal" value={profession} onChangeText={setProfession} iconName="briefcase-outline" />
                        
                        <View style={styles.sectorsContainer}>
                          <Text style={styles.sectorsLabel}>Selecciona tus industrias preferidas:</Text>
                          <View style={styles.sectorsGrid}>
                            {SECTORS.map(sector => {
                              const isSelected = candidateSectors.includes(sector);
                              return (
                                <TouchableOpacity 
                                  key={sector}
                                  style={[styles.sectorTag, isSelected && { borderColor: COLORS.candidate, backgroundColor: 'rgba(0,163,255,0.1)' }]}
                                  onPress={() => {
                                    if (isSelected) setCandidateSectors(prev => prev.filter(s => s !== sector));
                                    else setCandidateSectors(prev => [...prev, sector]);
                                  }}
                                >
                                  <Text style={[styles.sectorTagText, isSelected && styles.sectorTagTextActive]}>{sector}</Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      </View>
                    )}

                    {candidateStep === 3 && (
                      <View style={styles.stepContainer}>
                        <Text style={styles.questionTitle}>Por último, crea tus credenciales de acceso</Text>
                        <Text style={styles.questionSubtitle}>Usarás estos datos para iniciar sesión en Aptly.</Text>
                        <CustomInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} iconName="email-outline" />
                        <CustomInput placeholder="Contraseña" value={password} onChangeText={setPassword} iconName="lock-outline" isPassword />
                        <CustomInput placeholder="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} iconName="lock-check-outline" isPassword />
                      </View>
                    )}
                  </>
                )}

                {localRole === 'company' && (
                  <>
                    {companyStep === 1 && (
                      <View style={styles.stepContainer}>
                        <Text style={styles.questionTitle}>¡Hagamos crecer tu equipo! ¿Cuál es el nombre de tu empresa y el NIT?</Text>
                        
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                          <TouchableOpacity onPress={pickImage} style={[styles.avatarPicker, { borderColor: COLORS.company, backgroundColor: 'rgba(255,0,92,0.05)' }]}>
                            {avatarUrl ? (
                              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                            ) : (
                              <View style={styles.avatarPlaceholder}>
                                <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.company} />
                                <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>Logo empresa</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        </View>

                        <CustomInput placeholder="Nombre de la empresa / Razón Social" value={companyName} onChangeText={setCompanyName} iconName="office-building" />
                        <CustomInput placeholder="NIT / ID Fiscal" value={taxId} onChangeText={setTaxId} iconName="card-account-details-outline" />
                      </View>
                    )}

                    {companyStep === 2 && (
                      <View style={styles.stepContainer}>
                        <Text style={styles.questionTitle}>¿Quién representa legalmente a la empresa y cuándo se creó?</Text>
                        <CustomInput placeholder="Nombre del Representante Legal" value={legalRepresentative} onChangeText={setLegalRepresentative} iconName="account-tie" />
                        
                        <TouchableOpacity 
                          activeOpacity={0.8} 
                          onPress={() => setShowDatePicker(true)}
                          style={styles.dateSelector}
                        >
                          <MaterialCommunityIcons name="calendar" size={20} color={creationDate ? COLORS.company : "#64748b"} />
                          <Text style={[styles.dateText, !creationDate && styles.datePlaceholder]}>
                            {creationDate || 'Fecha de Creación (DD/MM/AAAA)'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {companyStep === 3 && (
                      <View style={styles.stepContainer}>
                        <Text style={styles.questionTitle}>¿En qué sector o industria opera tu empresa?</Text>
                        <View style={styles.sectorsContainer}>
                          <Text style={styles.sectorsLabel}>Puedes elegir una o varias opciones:</Text>
                          <View style={styles.sectorsGrid}>
                            {SECTORS.map(sector => {
                              const isSelected = selectedSectors.includes(sector);
                              return (
                                <TouchableOpacity 
                                  key={sector}
                                  style={[styles.sectorTag, isSelected && styles.sectorTagActive]}
                                  onPress={() => {
                                    if (isSelected) setSelectedSectors(prev => prev.filter(s => s !== sector));
                                    else setSelectedSectors(prev => [...prev, sector]);
                                  }}
                                >
                                  <Text style={[styles.sectorTagText, isSelected && styles.sectorTagTextActive]}>{sector}</Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      </View>
                    )}

                    {companyStep === 4 && (
                      <View style={styles.stepContainer}>
                        <Text style={styles.questionTitle}>Por último, crea tus credenciales empresariales</Text>
                        <Text style={styles.questionSubtitle}>Con estos datos gestionarás tu perfil y vacantes.</Text>
                        <CustomInput placeholder="Correo institucional" value={email} onChangeText={setEmail} iconName="email-outline" />
                        <CustomInput placeholder="Contraseña segura" value={password} onChangeText={setPassword} iconName="lock-outline" isPassword />
                        <CustomInput placeholder="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} iconName="lock-check-outline" isPassword />
                      </View>
                    )}
                  </>
                )}

              </Animated.View>
            </ScrollView>

            {/* Bottom Actions Row */}
            <View style={styles.bottomNav}>
              <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
                <MaterialCommunityIcons name="arrow-left" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.nextBtn, { backgroundColor: accentColor }]} 
                onPress={handleNext}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.nextBtnText}>
                  {loading ? 'Creando...' : (currentStep === totalSteps ? 'Finalizar' : 'Continuar')}
                </Text>
                {!loading && currentStep !== totalSteps && (
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            </View>

            <ObsidianModal
              isVisible={alertConfig.visible}
              onClose={() => {
                setAlertConfig({ ...alertConfig, visible: false });
                alertConfig.onOk();
              }}
              title={alertConfig.title}
              message={alertConfig.message}
              iconName={alertConfig.icon}
              type={alertConfig.type}
              confirmText="Entendido"
            />

            {showDatePicker && Platform.OS === 'ios' ? (
              <View style={styles.iosDatePickerContainer}>
                <View style={styles.iosDatePickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={{color: accentColor, fontWeight: 'bold', fontSize: 16}}>Listo</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={dateObj}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  textColor="#FFFFFF"
                />
              </View>
            ) : showDatePicker && Platform.OS === 'android' ? (
              <DateTimePicker
                value={dateObj}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            ) : null}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: 24, 
    paddingTop: 40,
    paddingBottom: 100,
  },
  stepContainer: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 36,
  },
  questionSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  sectorsContainer: { marginTop: 20 },
  sectorsLabel: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 12, fontWeight: '600' },
  sectorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sectorTag: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.02)' },
  sectorTagActive: { borderColor: COLORS.company, backgroundColor: 'rgba(255,0,92,0.1)' },
  sectorTagText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  sectorTagTextActive: { color: '#FFF', fontWeight: '800' },
  
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    height: 56,
    borderRadius: 28,
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  avatarPicker: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,163,255,0.05)', borderWidth: 1, borderColor: COLORS.candidate, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: '100%', height: '100%' },
  dateSelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 22, paddingHorizontal: 20, paddingVertical: 14, marginBottom: 16, borderColor: 'rgba(255, 255, 255, 0.05)', backgroundColor: '#1A1A1C' },
  dateText: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 12 },
  datePlaceholder: { color: '#64748b' },
  iosDatePickerContainer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: COLORS.card, zIndex: 999, paddingBottom: 30, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  iosDatePickerHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
});
