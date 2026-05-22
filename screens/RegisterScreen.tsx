import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
} from 'react-native-reanimated';
import { CustomInput } from '../components/CustomInput';
import { supabase } from '../lib/supabase';
import { uploadAvatar, uploadDocument } from '../lib/storageUtils';
import { ObsidianModal } from '../components/ObsidianModal';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';


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

const TAG_CATEGORIES = {
  'Modalidad': ['Remoto', 'Híbrido', 'Presencial', 'Horario Flexible'],
  'Horarios': ['Tiempo Completo', 'Medio Tiempo', 'Fines de Semana'],
  'Beneficios': ['Seguro Médico', 'Bonos', 'Crecimiento', 'Snacks', 'Gimnasio'],
  'Valores': ['Innovación', 'Diversidad', 'Sostenibilidad', 'Trabajo en Equipo'],
  'Tamaño': ['Startup', 'Pequeña (1-50)', 'Mediana (51-200)', 'Corporativo (200+)']
};

export const RegisterScreen = ({ navigation, route }: any) => {
  const initialRole = route?.params?.initialRole || 'candidate';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [businessArea, setBusinessArea] = useState('');
  const [customSector, setCustomSector] = useState('');
  const [isOtherSector, setIsOtherSector] = useState(false);
  const [companyStep, setCompanyStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  // New business fields
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyCulture, setCompanyCulture] = useState('');
  
  const [candidateStep, setCandidateStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profession, setProfession] = useState('');
  const [candidateSectors, setCandidateSectors] = useState<string[]>([]);
  // New candidate fields
  const [candidateLocation, setCandidateLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [candidateTags, setCandidateTags] = useState<string[]>([]);
  const [customCandidateTagInput, setCustomCandidateTagInput] = useState('');
  const [customCandidateTags, setCustomCandidateTags] = useState<string[]>([]);
  const [candidateBio, setCandidateBio] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidatePortfolio, setCandidatePortfolio] = useState('');
  const [candidateLinkedIn, setCandidateLinkedIn] = useState('');
  
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

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPdfName(result.assets[0].name);
        setPdfUri(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Error picking document', err);
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
  
  const localRole: 'candidate' | 'company' = initialRole;
  
  const contentFade = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      opacity: contentFade.value,
      transform: [{ translateY: cardTranslateY.value }],
    };
  });

  const handleRegister = async () => {
    const finalSector = isOtherSector ? customSector : selectedSectors[0];
    const isCompanyIncomplete = localRole === 'company' && (!companyName || !taxId || !creationDate || !businessArea || !finalSector);
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: localRole === 'company' ? { 
          full_name: companyName,
          role: 'company',
          tax_id: taxId,
          creation_date: creationDate,
          business_area: businessArea,
          industry: finalSector,
          company_tags: [...selectedTags, ...customTags].join(', '),
          pdf_name: pdfName,
          avatar_url: avatarUrl,
          website: companyWebsite || undefined,
          phone: companyPhone || undefined,
          location: companyLocation || undefined,
          bio: companyCulture || undefined,
        } : { 
          full_name: fullName,
          role: 'candidate',
          birth_date: birthDate,
          profession: profession,
          industry_interests: candidateSectors.join(', '),
          avatar_url: avatarUrl,
          location: candidateLocation || undefined,
          experience_level: experienceLevel || undefined,
          candidate_tags: [...candidateTags, ...customCandidateTags].join(', '),
          bio: candidateBio || undefined,
          phone: candidatePhone || undefined,
          portfolio_url: candidatePortfolio || undefined,
          linkedin_url: candidateLinkedIn || undefined,
          resume_name: pdfName || undefined,
        }
      }
    });

    if (error) {
      setLoading(false);
      setAlertConfig({
        visible: true,
        title: 'Error de Registro',
        message: error.message,
        icon: 'alert-circle',
        type: 'destructive',
        onOk: () => {}
      });
      return;
    }

    // Post-signup Storage Uploading
    if (data?.user) {
      const userId = data.user.id;
      let finalAvatarUrl = avatarUrl;
      let finalResumeUrl = null;

      // 1. Upload Avatar if selected and it is local
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        try {
          const publicAvatar = await uploadAvatar(avatarUrl, userId);
          if (publicAvatar) {
            finalAvatarUrl = publicAvatar;
          }
        } catch (uploadErr) {
          console.log('Error uploading avatar post-signup:', uploadErr);
        }
      }

      // 2. Upload Document (PDF Resume or brochure) if selected
      if (pdfUri) {
        try {
          const publicDoc = await uploadDocument(pdfUri, userId, pdfName || 'CV.pdf');
          if (publicDoc) {
            finalResumeUrl = publicDoc;
          }
        } catch (uploadErr) {
          console.log('Error uploading document post-signup:', uploadErr);
        }
      }

      // 3. Update Profiles table with correct URLs and map candidate fields directly
      try {
        const updateData: any = {};
        if (finalAvatarUrl) updateData.avatar_url = finalAvatarUrl;
        if (finalResumeUrl) {
          updateData.resume_url = finalResumeUrl;
          updateData.pdf_name = pdfName;
        }

        // Also save candidate specific details to profiles directly in case trigger doesn't copy some metadata
        if (localRole === 'candidate') {
          updateData.experience_level = experienceLevel || undefined;
          updateData.portfolio_url = candidatePortfolio || undefined;
          updateData.linkedin_url = candidateLinkedIn || undefined;
          updateData.birth_date = birthDate || undefined;
          updateData.candidate_tags = [...candidateTags, ...customCandidateTags].join(', ') || undefined;
          updateData.industry_interests = candidateSectors.join(', ') || undefined;
        }

        if (Object.keys(updateData).length > 0) {
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);
          if (profileUpdateError) {
            console.log('Error updating profile with storage URLs:', profileUpdateError.message);
          }
        }
      } catch (updateErr) {
        console.log('Exception in profile update:', updateErr);
      }
    }

    setLoading(false);
    setAlertConfig({
      visible: true,
      title: '¡Bienvenido!',
      message: 'Cuenta creada con éxito. Hemos enviado un correo de verificación.',
      icon: 'mail',
      type: 'success',
      onOk: () => navigation.navigate('Login')
    });
  };

  const totalSteps = 11;
  const currentStep = localRole === 'company' ? companyStep : candidateStep;
  const accentColor = localRole === 'company' ? COLORS.company : COLORS.candidate;

  const showAlert = (msg: string) => {
    setAlertConfig({ visible: true, title: 'Datos Incompletos', message: msg, icon: 'edit-3', type: 'info', onOk: () => {} });
  };

  const handleNext = () => {
    setShowDatePicker(false);
    if (localRole === 'company') {
      if (companyStep === 1) {
        if (!email) return showAlert('Por favor, ingresa tu correo.');
        setCompanyStep(2);
      } else if (companyStep === 2) {
        if (!password || password.length < 6) return showAlert('La contraseña debe tener al menos 6 caracteres para ser segura.');
        if (password !== confirmPassword) return showAlert('Las contraseñas no coinciden. Por favor verifica.');
        setCompanyStep(3);
      } else if (companyStep === 3) {
        if (!companyName) return showAlert('Por favor, ingresa el nombre de la empresa.');
        setCompanyStep(4);
      } else if (companyStep === 4) {
        if (!taxId || !creationDate) return showAlert('Por favor, ingresa NIT y año de creación.');
        setCompanyStep(5);
      } else if (companyStep === 5) {
        if (!businessArea) return showAlert('Selecciona el área de la empresa.');
        setCompanyStep(6);
      } else if (companyStep === 6) {
        const finalSector = isOtherSector ? customSector : selectedSectors[0];
        if (!finalSector) return showAlert('Selecciona o escribe un sector.');
        if (isOtherSector) supabase.from('business_sectors').insert({ name: finalSector }).then();
        setCompanyStep(7);
      } else if (companyStep === 7) {
        // Tags step - can continue without selecting any
        setCompanyStep(8);
      } else if (companyStep === 8) {
        // Culture step - optional, skip or fill
        setCompanyStep(9);
      } else if (companyStep === 9) {
        // Contact step - optional, skip or fill
        setCompanyStep(10);
      } else if (companyStep === 10) {
        setCompanyStep(11);
      } else {
        handleRegister();
      }
    } else {
      if (candidateStep === 1) {
        if (!email) return showAlert('Por favor, ingresa tu correo.');
        setCandidateStep(2);
      } else if (candidateStep === 2) {
        if (!password || password.length < 6) return showAlert('La contraseña debe tener al menos 6 caracteres para ser segura.');
        if (password !== confirmPassword) return showAlert('Las contraseñas no coinciden. Por favor verifica.');
        setCandidateStep(3);
      } else if (candidateStep === 3) {
        if (!fullName) return showAlert('Por favor, ingresa tu nombre completo.');
        setCandidateStep(4);
      } else if (candidateStep === 4) {
        if (!birthDate) return showAlert('Por favor, ingresa tu fecha de nacimiento.');
        setCandidateStep(5);
      } else if (candidateStep === 5) {
        if (!profession) return showAlert('Por favor, ingresa tu profesión u ocupación.');
        if (!experienceLevel) return showAlert('Por favor, selecciona tu nivel de experiencia.');
        setCandidateStep(6);
      } else if (candidateStep === 6) {
        if (candidateSectors.length === 0) return showAlert('Selecciona al menos un sector de interés.');
        setCandidateStep(7);
      } else if (candidateStep === 7) {
        setCandidateStep(8);
      } else if (candidateStep === 8) {
        setCandidateStep(9);
      } else if (candidateStep === 9) {
        setCandidateStep(10);
      } else if (candidateStep === 10) {
        setCandidateStep(11);
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
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Crea tu cuenta de candidato</Text>
                        <Text style={styles.questionSubtitle}>Ingresa con tu correo u opciones sociales.</Text>
                        
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                           <TouchableOpacity style={styles.socialBtn} onPress={() => showAlert('Autenticación con Google próximamente')}>
                              <Image source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} style={{ width: 18, height: 18, marginRight: 8 }} />
                              <Text style={styles.socialText}>Google</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.socialBtn} onPress={() => showAlert('Autenticación con GitHub próximamente')}>
                              <MaterialCommunityIcons name="github" size={20} color="white" />
                              <Text style={styles.socialText}>GitHub</Text>
                           </TouchableOpacity>
                        </View>
                        
                        <View style={styles.divider}>
                           <View style={styles.dividerLine} />
                           <Text style={styles.dividerText}>o con tu correo electrónico</Text>
                           <View style={styles.dividerLine} />
                        </View>

                        <CustomInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} iconName="email-outline" />
                      </View>
                    )}

                    {candidateStep === 2 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Seguridad de la cuenta</Text>
                        <Text style={styles.questionSubtitle}>Crea una contraseña segura para tu perfil.</Text>
                        <CustomInput placeholder="Contraseña segura" value={password} onChangeText={setPassword} iconName="lock-outline" isPassword />
                        {password.length > 0 && password.length < 6 && (
                          <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -15, marginBottom: 15, marginLeft: 5 }}>La contraseña debe tener al menos 6 caracteres.</Text>
                        )}
                        <CustomInput placeholder="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} iconName="lock-check-outline" isPassword />
                        {confirmPassword.length > 0 && password !== confirmPassword && (
                          <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -15, marginBottom: 15, marginLeft: 5 }}>Las contraseñas no coinciden.</Text>
                        )}
                      </View>
                    )}

                    {candidateStep === 3 && (
                      <View style={styles.stepContainer}>
                        <Text style={styles.questionTitle}>¿Cómo te llamas y cómo te verán las empresas?</Text>
                        
                        <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 20 }}>
                          <TouchableOpacity onPress={pickImage} style={[styles.avatarPicker, { borderColor: COLORS.candidate, backgroundColor: 'rgba(0,163,255,0.05)' }]}>
                            {avatarUrl ? (
                              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                            ) : (
                              <View style={styles.avatarPlaceholder}>
                                <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.candidate} />
                                <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>Tu foto</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        </View>

                        <CustomInput placeholder="Nombre y Apellidos" value={fullName} onChangeText={setFullName} iconName="account-outline" />
                      </View>
                    )}

                    {candidateStep === 4 && (
                      <View style={styles.stepContainer}>
                        <Text style={styles.questionTitle}>Datos básicos</Text>
                        <Text style={styles.questionSubtitle}>Cuéntanos un poco más sobre ti.</Text>
                        
                        <CustomInput placeholder="Ciudad, País" value={candidateLocation} onChangeText={setCandidateLocation} iconName="map-marker-outline" />
                        
                        <TouchableOpacity 
                          activeOpacity={0.8} 
                          onPress={() => {
                            Keyboard.dismiss();
                            setShowDatePicker(true);
                          }}
                          style={styles.dateSelector}
                        >
                          <MaterialCommunityIcons name="calendar" size={20} color={birthDate ? COLORS.candidate : "#64748b"} />
                          <Text style={[styles.dateText, !birthDate && styles.datePlaceholder]}>
                            {birthDate || 'Fecha de Nacimiento (DD/MM/AAAA)'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {candidateStep === 5 && (
                      <View style={styles.stepContainer}>
                        <Text style={styles.questionTitle}>Perfil Profesional</Text>
                        <Text style={styles.questionSubtitle}>¿A qué te dedicas y cuál es tu nivel?</Text>
                        <CustomInput placeholder="Profesión u Ocupación Principal" value={profession} onChangeText={setProfession} iconName="briefcase-outline" />
                        
                        <View style={{ gap: 12, marginTop: 10 }}>
                          {['Junior', 'Mid-Level', 'Senior', 'Lead/Manager'].map(lvl => (
                            <TouchableOpacity 
                               key={lvl}
                               style={[styles.areaCard, experienceLevel === lvl && { borderColor: COLORS.candidate, backgroundColor: 'rgba(0,163,255,0.05)' }]}
                               onPress={() => setExperienceLevel(lvl)}
                            >
                               <View style={[styles.radioCircle, { borderColor: experienceLevel === lvl ? COLORS.candidate : COLORS.textSecondary }]}>
                                  {experienceLevel === lvl && <View style={[styles.radioInner, { backgroundColor: COLORS.candidate }]} />}
                               </View>
                               <Text style={[styles.areaText, experienceLevel === lvl && { color: COLORS.candidate }]}>{lvl}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    {candidateStep === 6 && (
                      <View style={styles.stepContainer}>
                        <Text style={styles.questionTitle}>¿Qué sectores te interesan?</Text>
                        <Text style={styles.questionSubtitle}>Selecciona las industrias en las que te gustaría trabajar.</Text>
                        <View style={styles.sectorsContainer}>
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

                    {candidateStep === 7 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Tus Habilidades (Opcional)</Text>
                        <Text style={styles.questionSubtitle}>Añade habilidades clave, idiomas o herramientas que dominas.</Text>
                        
                        <View style={{ marginTop: 10 }}>
                          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                              <CustomInput 
                                placeholder="Ej: React, Inglés C1, Liderazgo..." 
                                value={customCandidateTagInput} 
                                onChangeText={setCustomCandidateTagInput} 
                                iconName="tag-plus-outline" 
                              />
                            </View>
                            <TouchableOpacity 
                              style={{ backgroundColor: COLORS.candidate, height: 50, width: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: -15 }}
                              onPress={() => {
                                if (customCandidateTagInput.trim() && !customCandidateTags.includes(customCandidateTagInput.trim())) {
                                  setCustomCandidateTags(prev => [...prev, customCandidateTagInput.trim()]);
                                  setCustomCandidateTagInput('');
                                }
                              }}
                            >
                              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                          
                          {customCandidateTags.length > 0 && (
                            <View style={[styles.sectorsGrid, { marginTop: 10 }]}>
                              {customCandidateTags.map(tag => (
                                <TouchableOpacity 
                                  key={tag}
                                  style={[styles.sectorTag, { borderColor: COLORS.candidate, backgroundColor: 'rgba(0,163,255,0.1)' }]}
                                  onPress={() => setCustomCandidateTags(prev => prev.filter(t => t !== tag))}
                                >
                                  <Text style={{ color: COLORS.candidate, fontSize: 13, fontWeight: '600' }}>{tag} ✕</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                        <TouchableOpacity onPress={() => setCandidateStep(8)} style={{ alignSelf: 'center', marginTop: 32, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                          <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>Omitir este paso</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {candidateStep === 8 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Sobre ti (Opcional)</Text>
                        <Text style={styles.questionSubtitle}>Escribe un breve resumen profesional que las empresas verán en tu perfil.</Text>

                        <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(0,163,255,0.2)', borderRadius: 20, padding: 16, minHeight: 160, marginBottom: 20 }}>
                          <TextInput
                            multiline
                            numberOfLines={7}
                            style={{ color: '#FFF', fontSize: 15, lineHeight: 24, textAlignVertical: 'top' }}
                            value={candidateBio}
                            onChangeText={setCandidateBio}
                            placeholder="Ej. Soy un profesional apasionado por el desarrollo web con 3 años de experiencia..."
                            placeholderTextColor="#475569"
                          />
                        </View>

                        <TouchableOpacity onPress={() => setCandidateStep(9)} style={{ alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                          <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>Omitir este paso</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {candidateStep === 9 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Enlaces y Contacto (Opcional)</Text>
                        <Text style={styles.questionSubtitle}>Añade tus enlaces para que las empresas puedan conocer más sobre tu trabajo.</Text>

                        <View style={{ gap: 16 }}>
                          <View>
                            <Text style={styles.sectorsLabel}>Teléfono</Text>
                            <CustomInput placeholder="+57 300 000 0000" value={candidatePhone} onChangeText={setCandidatePhone} iconName="phone-outline" />
                          </View>
                          <View>
                            <Text style={styles.sectorsLabel}>LinkedIn</Text>
                            <CustomInput placeholder="https://linkedin.com/in/tu-perfil" value={candidateLinkedIn} onChangeText={setCandidateLinkedIn} iconName="linkedin" />
                          </View>
                          <View>
                            <Text style={styles.sectorsLabel}>Portafolio / GitHub / Sitio Web</Text>
                            <CustomInput placeholder="https://tu-portafolio.com" value={candidatePortfolio} onChangeText={setCandidatePortfolio} iconName="web" />
                          </View>
                        </View>

                        <TouchableOpacity onPress={() => setCandidateStep(10)} style={{ alignSelf: 'center', marginTop: 32, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                          <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>Omitir este paso</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {candidateStep === 10 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Vista Previa y Currículum</Text>
                        <Text style={styles.questionSubtitle}>Así se verá tu perfil principal.</Text>
                        
                        <View style={[styles.previewCard, { borderColor: 'rgba(0,163,255,0.1)' }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            {avatarUrl ? (
                              <Image source={{ uri: avatarUrl }} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 16 }} />
                            ) : (
                              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,163,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                <MaterialCommunityIcons name="account" size={30} color={COLORS.candidate} />
                              </View>
                            )}
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }} numberOfLines={1}>{fullName || 'Nombre Completo'}</Text>
                              <Text style={{ color: COLORS.textSecondary }} numberOfLines={1}>{profession || 'Profesión'} • {experienceLevel || 'Nivel'}</Text>
                            </View>
                          </View>
                          
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                            {candidateLocation ? (
                              <View>
                                <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>Ubicación</Text>
                                <Text style={{ color: '#FFF', fontSize: 13 }}>{candidateLocation}</Text>
                              </View>
                            ) : null}
                          </View>

                          <View style={{ marginTop: 8 }}>
                            <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8 }}>Habilidades</Text>
                            <View style={styles.sectorsGrid}>
                              {customCandidateTags.length > 0 ? (
                                customCandidateTags.map(tag => (
                                  <View key={tag} style={[styles.sectorTag, { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(0,163,255,0.1)' }]}>
                                    <Text style={{ color: '#FFF', fontSize: 11 }}>{tag}</Text>
                                  </View>
                                ))
                              ) : (
                                <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontStyle: 'italic' }}>Sin habilidades aún</Text>
                              )}
                            </View>
                          </View>
                        </View>

                        <Text style={[styles.questionSubtitle, { marginTop: 24, marginBottom: 12 }]}>Añadir Currículum (Opcional)</Text>
                        <TouchableOpacity style={[styles.pdfButton, { borderColor: pdfName ? COLORS.candidate : COLORS.border }]} onPress={pickDocument}>
                          <MaterialCommunityIcons name={pdfName ? "file-pdf-box" : "file-upload-outline"} size={24} color={pdfName ? COLORS.candidate : COLORS.textSecondary} />
                          <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={{ color: pdfName ? '#FFF' : COLORS.textSecondary, fontWeight: 'bold' }}>
                              {pdfName ? pdfName : 'Subir tu CV (PDF)'}
                            </Text>
                            <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                              {pdfName ? 'Toca para cambiar el archivo' : 'Las empresas podrán descargarlo'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}

                    {candidateStep === 11 && (
                      <View style={[styles.stepContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,163,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
                          <MaterialCommunityIcons name="account-check" size={60} color={COLORS.candidate} />
                        </View>
                        <Text style={[styles.questionTitle, { textAlign: 'center' }]}>¡Todo listo!</Text>
                        <Text style={[styles.questionSubtitle, { textAlign: 'center', fontSize: 16, lineHeight: 24 }]}>
                          Tu perfil está configurado.
                        </Text>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginTop: 10 }}>
                          <Text style={{ color: '#FFF', textAlign: 'center', lineHeight: 22 }}>
                            Al crear tu cuenta, podrás empezar a buscar oportunidades y hacer match con las mejores empresas.
                          </Text>
                        </View>
                      </View>
                    )}
                  </>
                )}

                {localRole === 'company' && (
                  <>
                    {companyStep === 1 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Crea tu cuenta empresarial</Text>
                        <Text style={styles.questionSubtitle}>Ingresa con tu correo u opciones sociales.</Text>
                        
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                           <TouchableOpacity style={styles.socialBtn} onPress={() => showAlert('Autenticación con Google próximamente')}>
                              <Image source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} style={{ width: 18, height: 18, marginRight: 8 }} />
                              <Text style={styles.socialText}>Google</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.socialBtn} onPress={() => showAlert('Autenticación con GitHub próximamente')}>
                              <MaterialCommunityIcons name="github" size={20} color="white" />
                              <Text style={styles.socialText}>GitHub</Text>
                           </TouchableOpacity>
                        </View>
                        
                        <View style={styles.divider}>
                           <View style={styles.dividerLine} />
                           <Text style={styles.dividerText}>o con tu correo electrónico</Text>
                           <View style={styles.dividerLine} />
                        </View>

                        <CustomInput placeholder="Correo institucional" value={email} onChangeText={setEmail} iconName="email-outline" />
                      </View>
                    )}

                    {companyStep === 2 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Seguridad de la cuenta</Text>
                        <Text style={styles.questionSubtitle}>Crea una contraseña segura para tu empresa.</Text>
                        <CustomInput placeholder="Contraseña segura" value={password} onChangeText={setPassword} iconName="lock-outline" isPassword />
                        {password.length > 0 && password.length < 6 && (
                          <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -15, marginBottom: 15, marginLeft: 5 }}>La contraseña debe tener al menos 6 caracteres.</Text>
                        )}
                        <CustomInput placeholder="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} iconName="lock-check-outline" isPassword />
                        {confirmPassword.length > 0 && password !== confirmPassword && (
                          <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -15, marginBottom: 15, marginLeft: 5 }}>Las contraseñas no coinciden.</Text>
                        )}
                      </View>
                    )}

                    {companyStep === 3 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>¡Hagamos crecer tu equipo! ¿Cuál es el nombre de tu empresa?</Text>
                        
                        <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 20 }}>
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

                        <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 16, marginBottom: 8, fontWeight: '600' }}>Datos opcionales (puedes completarlos después):</Text>

                        <CustomInput placeholder="Sitio web (https://tuempresa.com)" value={companyWebsite} onChangeText={setCompanyWebsite} iconName="earth" />
                        <CustomInput placeholder="Ciudad, País" value={companyLocation} onChangeText={setCompanyLocation} iconName="map-marker-outline" />
                        <CustomInput placeholder="Teléfono de contacto" value={companyPhone} onChangeText={setCompanyPhone} iconName="phone-outline" />
                      </View>
                    )}

                    {companyStep === 4 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Identidad corporativa</Text>
                        <Text style={styles.questionSubtitle}>Ingresa el ID fiscal y el año en que se fundó la empresa.</Text>
                        
                        <CustomInput placeholder="NIT / ID Fiscal" value={taxId} onChangeText={setTaxId} iconName="card-account-details-outline" />
                        
                        <TouchableOpacity 
                          activeOpacity={0.8} 
                          onPress={() => {
                            Keyboard.dismiss();
                            setShowDatePicker(true);
                          }}
                          style={styles.dateSelector}
                        >
                          <MaterialCommunityIcons name="calendar" size={20} color={creationDate ? COLORS.company : "#64748b"} />
                          <Text style={[styles.dateText, !creationDate && styles.datePlaceholder]}>
                            {creationDate || 'Fecha de creación (DD/MM/AAAA)'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {companyStep === 5 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>¿En qué área opera la empresa?</Text>
                        <Text style={styles.questionSubtitle}>Selecciona el área principal de negocio.</Text>
                        <View style={{ gap: 12, marginTop: 10 }}>
                          {['Industrial', 'Servicio', 'Comercial'].map(area => (
                            <TouchableOpacity 
                               key={area}
                               style={[styles.areaCard, businessArea === area && styles.areaCardActive]}
                               onPress={() => setBusinessArea(area)}
                            >
                               <View style={styles.radioCircle}>
                                  {businessArea === area && <View style={styles.radioInner} />}
                               </View>
                               <Text style={[styles.areaText, businessArea === area && styles.areaTextActive]}>{area}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    {companyStep === 6 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>¿Qué sector destaca más?</Text>
                        <Text style={styles.questionSubtitle}>Elige un sector o añade el tuyo.</Text>
                        <View style={styles.sectorsContainer}>
                          <View style={styles.sectorsGrid}>
                            {['Tecnología', 'Salud', 'Finanzas', 'Construcción', 'Comercio', 'Supermercados', 'Restaurantes', 'Firma de Abogados', 'Educación', 'Otro'].map(sector => {
                              const isSelected = selectedSectors.includes(sector) || (sector === 'Otro' && isOtherSector);
                              return (
                                <TouchableOpacity 
                                  key={sector}
                                  style={[styles.sectorTag, isSelected && styles.sectorTagActive]}
                                  onPress={() => {
                                    if (sector === 'Otro') {
                                      setIsOtherSector(true);
                                      setSelectedSectors([]);
                                    } else {
                                      setIsOtherSector(false);
                                      setSelectedSectors([sector]);
                                    }
                                  }}
                                >
                                  <Text style={[styles.sectorTagText, isSelected && styles.sectorTagTextActive]}>{sector}</Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>

                          {isOtherSector && (
                            <View style={{ marginTop: 20 }}>
                               <CustomInput placeholder="Escribe tu sector" value={customSector} onChangeText={setCustomSector} iconName="pencil" />
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {companyStep === 7 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Etiquetas de la Empresa</Text>
                        <Text style={styles.questionSubtitle}>Selecciona las características que mejor describen a tu empresa para atraer a los candidatos ideales.</Text>
                        
                        {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
                          <View key={category} style={{ marginBottom: 20 }}>
                            <Text style={styles.sectorsLabel}>{category}</Text>
                            <View style={styles.sectorsGrid}>
                              {tags.map(tag => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                  <TouchableOpacity 
                                    key={tag}
                                    style={[styles.sectorTag, isSelected && styles.sectorTagActive]}
                                    onPress={() => {
                                      if (isSelected) setSelectedTags(prev => prev.filter(t => t !== tag));
                                      else setSelectedTags(prev => [...prev, tag]);
                                    }}
                                  >
                                    <Text style={[styles.sectorTagText, isSelected && styles.sectorTagTextActive]}>{tag}</Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        ))}

                        <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 20 }}>
                          <Text style={styles.sectorsLabel}>¿No encontraste lo que buscabas? Créalo:</Text>
                          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                              <CustomInput 
                                placeholder="Escribe tu etiqueta" 
                                value={customTagInput} 
                                onChangeText={setCustomTagInput} 
                                iconName="tag-plus-outline" 
                              />
                            </View>
                            <TouchableOpacity 
                              style={{ backgroundColor: COLORS.company, height: 50, width: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: -15 }}
                              onPress={() => {
                                if (customTagInput.trim() && !customTags.includes(customTagInput.trim())) {
                                  setCustomTags(prev => [...prev, customTagInput.trim()]);
                                  setCustomTagInput('');
                                }
                              }}
                            >
                              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                          
                          {customTags.length > 0 && (
                            <View style={[styles.sectorsGrid, { marginTop: 10 }]}>
                              {customTags.map(tag => (
                                <TouchableOpacity 
                                  key={tag}
                                  style={[styles.sectorTag, styles.sectorTagActive]}
                                  onPress={() => setCustomTags(prev => prev.filter(t => t !== tag))}
                                >
                                  <Text style={styles.sectorTagTextActive}>{tag} ✕</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {companyStep === 8 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Cultura y Valores de la Empresa</Text>
                        <Text style={styles.questionSubtitle}>Opcional – Cuente a los candidatos qué hace especial a tu empresa. Puedes omitir este paso.</Text>

                        <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,0,92,0.2)', borderRadius: 20, padding: 16, minHeight: 160, marginBottom: 20 }}>
                          <TextInput
                            multiline
                            numberOfLines={7}
                            style={{ color: '#FFF', fontSize: 15, lineHeight: 24, textAlignVertical: 'top' }}
                            value={companyCulture}
                            onChangeText={setCompanyCulture}
                            placeholder="Ej. Somos una empresa ágil que apuesta por la innovación y el bienestar de nuestro equipo..."
                            placeholderTextColor="#475569"
                          />
                        </View>

                        <TouchableOpacity
                          onPress={() => setCompanyStep(9)}
                          style={{ alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                          <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>Omitir este paso</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {companyStep === 9 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Información de Contacto</Text>
                        <Text style={styles.questionSubtitle}>Opcional – Ayuda a los candidatos a encontrarte y contactarte más fácil. Puedes omitir este paso.</Text>

                        <View style={{ gap: 16 }}>
                          <View>
                            <Text style={styles.sectorsLabel}>Sitio Web</Text>
                            <CustomInput 
                              placeholder="https://tuempresa.com" 
                              value={companyWebsite} 
                              onChangeText={setCompanyWebsite} 
                              iconName="earth" 
                            />
                          </View>

                          <View>
                            <Text style={styles.sectorsLabel}>Teléfono de Contacto</Text>
                            <CustomInput 
                              placeholder="+57 300 000 0000" 
                              value={companyPhone} 
                              onChangeText={setCompanyPhone} 
                              iconName="phone-outline" 
                            />
                          </View>

                          <View>
                            <Text style={styles.sectorsLabel}>Ubicación Principal</Text>
                            <CustomInput 
                              placeholder="Ciudad, País" 
                              value={companyLocation} 
                              onChangeText={setCompanyLocation} 
                              iconName="map-marker-outline" 
                            />
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={() => setCompanyStep(10)}
                          style={{ alignSelf: 'center', marginTop: 32, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                          <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>Omitir este paso</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {companyStep === 10 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Vista Previa del Perfil</Text>
                        <Text style={styles.questionSubtitle}>Así es como los candidatos verán tu empresa.</Text>
                        
                        <View style={styles.previewCard}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            {avatarUrl ? (
                              <Image source={{ uri: avatarUrl }} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 16 }} />
                            ) : (
                              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,0,92,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                <MaterialCommunityIcons name="domain" size={30} color={COLORS.company} />
                              </View>
                            )}
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }} numberOfLines={1}>{companyName || 'Nombre Empresa'}</Text>
                              <Text style={{ color: COLORS.textSecondary }} numberOfLines={1}>{isOtherSector ? customSector : (selectedSectors[0] || 'Sector')} • {businessArea || 'Área'}</Text>
                            </View>
                          </View>
                          
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                            <View>
                              <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>NIT</Text>
                              <Text style={{ color: '#FFF', fontSize: 13 }}>{taxId}</Text>
                            </View>
                            {companyLocation ? (
                              <View>
                                <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>Ubicación</Text>
                                <Text style={{ color: '#FFF', fontSize: 13 }}>{companyLocation}</Text>
                              </View>
                            ) : null}
                            {companyPhone ? (
                              <View>
                                <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>Teléfono</Text>
                                <Text style={{ color: '#FFF', fontSize: 13 }}>{companyPhone}</Text>
                              </View>
                            ) : null}
                          </View>

                          <View style={{ marginTop: 8 }}>
                            <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8 }}>Etiquetas Seleccionadas</Text>
                            <View style={styles.sectorsGrid}>
                              {[...selectedTags, ...customTags].length > 0 ? (
                                [...selectedTags, ...customTags].map(tag => (
                                  <View key={tag} style={[styles.sectorTag, { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                                    <Text style={{ color: '#FFF', fontSize: 11 }}>{tag}</Text>
                                  </View>
                                ))
                              ) : (
                                <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontStyle: 'italic' }}>Sin etiquetas aún</Text>
                              )}
                            </View>
                          </View>
                        </View>

                        <Text style={[styles.questionSubtitle, { marginTop: 24, marginBottom: 12 }]}>Añadir más información (Opcional)</Text>
                        <TouchableOpacity style={styles.pdfButton} onPress={pickDocument}>
                          <MaterialCommunityIcons name={pdfName ? "file-pdf-box" : "file-upload-outline"} size={24} color={pdfName ? COLORS.company : COLORS.textSecondary} />
                          <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={{ color: pdfName ? '#FFF' : COLORS.textSecondary, fontWeight: 'bold' }}>
                              {pdfName ? pdfName : 'Subir presentación o brochure (PDF)'}
                            </Text>
                            <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                              {pdfName ? 'Toca para cambiar el archivo' : 'Los candidatos podrán descargarlo'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}

                    {companyStep === 11 && (
                      <View style={[styles.stepContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,0,92,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
                          <MaterialCommunityIcons name="rocket-launch" size={60} color={COLORS.company} />
                        </View>
                        <Text style={[styles.questionTitle, { textAlign: 'center' }]}>¡Todo listo!</Text>
                        <Text style={[styles.questionSubtitle, { textAlign: 'center', fontSize: 16, lineHeight: 24 }]}>
                          Tu perfil de empresa ha sido preparado exitosamente.
                        </Text>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginTop: 10 }}>
                          <Text style={{ color: '#FFF', textAlign: 'center', lineHeight: 22 }}>
                            Para comenzar a conocer a los candidatos ideales, tu primer paso será presionar el botón <Text style={{ fontWeight: 'bold', color: COLORS.company }}>+</Text> en la parte inferior de tu pantalla principal para crear un puesto vacante.
                          </Text>
                        </View>
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
  socialBtn: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  socialText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: COLORS.textSecondary, paddingHorizontal: 10, fontSize: 12 },
  areaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  areaCardActive: { borderColor: COLORS.company, backgroundColor: 'rgba(255,0,92,0.1)' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.textSecondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.company },
  areaText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  areaTextActive: { color: 'white', fontWeight: '800' },
  previewCard: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginTop: 10 },
  pdfButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
});
