import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { supabase } from '../../../lib/supabase';
import { uploadAvatar, uploadDocument } from '../../../lib/storageUtils';
import { ObsidianModal } from '../../../components/ObsidianModal';
import { COLORS } from './constants';
import { styles } from './styles';
import { CandidateSteps } from './components/CandidateSteps';
import { CompanySteps } from './components/CompanySteps';
import { AiAssessmentModal } from './components/AiAssessmentModal';

export const RegisterScreen = ({ navigation, route }: any) => {
  const initialRole = route?.params?.initialRole || 'candidate';
  const localRole: 'candidate' | 'company' = initialRole;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Company Specific States
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
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [selectedCompanyCountry, setSelectedCompanyCountry] = useState('');
  const [selectedCompanyCity, setSelectedCompanyCity] = useState('');
  const [companyCulture, setCompanyCulture] = useState('');

  // Candidate Specific States
  const [candidateStep, setCandidateStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profession, setProfession] = useState('');
  const [candidateSectors, setCandidateSectors] = useState<string[]>([]);
  const [candidateLocation, setCandidateLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [customCandidateTagInput, setCustomCandidateTagInput] = useState('');
  const [customCandidateTags, setCustomCandidateTags] = useState<string[]>([]);
  const [candidateBio, setCandidateBio] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidatePortfolio, setCandidatePortfolio] = useState('');
  const [candidateLinkedIn, setCandidateLinkedIn] = useState('');

  // Shared file picking states
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  // Date picker states
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // AI Assessment states
  const [showAiAssessment, setShowAiAssessment] = useState(false);
  const [aiAssessed, setAiAssessed] = useState(false);
  const [showManualLevel, setShowManualLevel] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{ score: number; tier: string; feedback: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const totalSteps = 11;
  const currentStep = localRole === 'company' ? companyStep : candidateStep;
  const accentColor = localRole === 'company' ? COLORS.company : COLORS.candidate;

  // Keyboard Visibility state
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Reanimated Shared Values
  const contentFade = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);
  const stepOpacity = useSharedValue(1);
  const stepTranslateX = useSharedValue(0);
  const progressAnim = useSharedValue(0);

  const prevStepRef = React.useRef(currentStep);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'info' as any,
    type: 'info' as any,
    onOk: () => {}
  });

  // Parse location strings
  useEffect(() => {
    if (candidateLocation && candidateLocation.includes(',')) {
      const parts = candidateLocation.split(',').map(s => s.trim());
      if (parts.length === 2) {
        setSelectedCity(parts[0]);
        setSelectedCountry(parts[1]);
      }
    }
  }, [candidateLocation]);

  useEffect(() => {
    if (companyLocation && companyLocation.includes(',')) {
      const parts = companyLocation.split(',').map(s => s.trim());
      if (parts.length === 2) {
        setSelectedCompanyCity(parts[0]);
        setSelectedCompanyCountry(parts[1]);
      }
    }
  }, [companyLocation]);

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

  // Keyboard show/hide listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Animations initialization
  useEffect(() => {
    contentFade.value = withTiming(1, { duration: 800 });
    cardTranslateY.value = withSpring(0, { damping: 15 });
    progressAnim.value = withTiming(currentStep / totalSteps, { duration: 300 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    progressAnim.value = withTiming(currentStep / totalSteps, { duration: 300 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  useEffect(() => {
    const isForward = currentStep > prevStepRef.current;
    prevStepRef.current = currentStep;

    stepTranslateX.value = isForward ? 45 : -45;
    stepOpacity.value = 0;

    stepTranslateX.value = withSpring(0, { damping: 16, stiffness: 110 });
    stepOpacity.value = withTiming(1, { duration: 250 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      opacity: contentFade.value,
      transform: [{ translateY: cardTranslateY.value }],
    };
  });

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnim.value * 100}%`,
    };
  });

  const animatedStepStyle = useAnimatedStyle(() => {
    return {
      opacity: stepOpacity.value,
      transform: [{ translateX: stepTranslateX.value }],
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
          candidate_tags: [...customCandidateTags].join(', '),
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

      try {
        const updateData: any = {};
        if (finalAvatarUrl) updateData.avatar_url = finalAvatarUrl;
        if (finalResumeUrl) {
          updateData.resume_url = finalResumeUrl;
          updateData.pdf_name = pdfName;
        }

        if (localRole === 'candidate') {
          updateData.experience_level = experienceLevel || undefined;
          updateData.portfolio_url = candidatePortfolio || undefined;
          updateData.linkedin_url = candidateLinkedIn || undefined;
          updateData.birth_date = birthDate || undefined;
          updateData.candidate_tags = [...customCandidateTags].join(', ') || undefined;
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

  const showAlert = (msg: string) => {
    setAlertConfig({ visible: true, title: 'Datos Incompletos', message: msg, icon: 'edit-3', type: 'info', onOk: () => {} });
  };

  const handleNext = () => {
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
        setCompanyStep(8);
      } else if (companyStep === 8) {
        setCompanyStep(9);
      } else if (companyStep === 9) {
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
          <View style={styles.progressBarContainer}>
            <Animated.View style={[
              styles.progressBarFill,
              animatedProgressStyle,
              { backgroundColor: accentColor }
            ]} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Animated.View style={[animatedCardStyle, { flex: 1 }]}>
                <Animated.View style={[animatedStepStyle, { flex: 1 }]}>
                  {localRole === 'candidate' ? (
                    <CandidateSteps
                      candidateStep={candidateStep}
                      email={email}
                      setEmail={setEmail}
                      password={password}
                      setPassword={setPassword}
                      confirmPassword={confirmPassword}
                      setConfirmPassword={setConfirmPassword}
                      fullName={fullName}
                      setFullName={setFullName}
                      avatarUrl={avatarUrl}
                      pickImage={pickImage}
                      selectedCountry={selectedCountry}
                      setSelectedCountry={setSelectedCountry}
                      selectedCity={selectedCity}
                      setSelectedCity={setSelectedCity}
                      candidateLocation={candidateLocation}
                      setCandidateLocation={setCandidateLocation}
                      birthDate={birthDate}
                      setShowDatePicker={setShowDatePicker}
                      profession={profession}
                      setProfession={setProfession}
                      experienceLevel={experienceLevel}
                      setExperienceLevel={setExperienceLevel}
                      aiAssessed={aiAssessed}
                      setAiAssessed={setAiAssessed}
                      showManualLevel={showManualLevel}
                      setShowManualLevel={setShowManualLevel}
                      assessmentResult={assessmentResult}
                      setShowAiAssessment={setShowAiAssessment}
                      setCandidateStep={setCandidateStep}
                      candidateSectors={candidateSectors}
                      setCandidateSectors={setCandidateSectors}
                      customCandidateTagInput={customCandidateTagInput}
                      setCustomCandidateTagInput={setCustomCandidateTagInput}
                      customCandidateTags={customCandidateTags}
                      setCustomCandidateTags={setCustomCandidateTags}
                      candidateBio={candidateBio}
                      setCandidateBio={setCandidateBio}
                      candidatePhone={candidatePhone}
                      setCandidatePhone={setCandidatePhone}
                      candidateLinkedIn={candidateLinkedIn}
                      setCandidateLinkedIn={setCandidateLinkedIn}
                      candidatePortfolio={candidatePortfolio}
                      setCandidatePortfolio={setCandidatePortfolio}
                      pdfName={pdfName}
                      pickDocument={pickDocument}
                      showAlert={showAlert}
                    />
                  ) : (
                    <CompanySteps
                      companyStep={companyStep}
                      email={email}
                      setEmail={setEmail}
                      password={password}
                      setPassword={setPassword}
                      confirmPassword={confirmPassword}
                      setConfirmPassword={setConfirmPassword}
                      companyName={companyName}
                      setCompanyName={setCompanyName}
                      avatarUrl={avatarUrl}
                      pickImage={pickImage}
                      companyWebsite={companyWebsite}
                      setCompanyWebsite={setCompanyWebsite}
                      companyPhone={companyPhone}
                      setCompanyPhone={setCompanyPhone}
                      selectedCompanyCountry={selectedCompanyCountry}
                      setSelectedCompanyCountry={setSelectedCompanyCountry}
                      selectedCompanyCity={selectedCompanyCity}
                      setSelectedCompanyCity={setSelectedCompanyCity}
                      companyLocation={companyLocation}
                      setCompanyLocation={setCompanyLocation}
                      taxId={taxId}
                      setTaxId={setTaxId}
                      creationDate={creationDate}
                      setShowDatePicker={setShowDatePicker}
                      businessArea={businessArea}
                      setBusinessArea={setBusinessArea}
                      selectedSectors={selectedSectors}
                      setSelectedSectors={setSelectedSectors}
                      isOtherSector={isOtherSector}
                      setIsOtherSector={setIsOtherSector}
                      customSector={customSector}
                      setCustomSector={setCustomSector}
                      selectedTags={selectedTags}
                      setSelectedTags={setSelectedTags}
                      customTagInput={customTagInput}
                      setCustomTagInput={setCustomTagInput}
                      customTags={customTags}
                      setCustomTags={setCustomTags}
                      companyCulture={companyCulture}
                      setCompanyCulture={setCompanyCulture}
                      pdfName={pdfName}
                      pickDocument={pickDocument}
                      setCompanyStep={setCompanyStep}
                      showAlert={showAlert}
                    />
                  )}
                </Animated.View>
              </Animated.View>
            </ScrollView>

            {!isKeyboardVisible && (
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
            )}

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

            <AiAssessmentModal
              visible={showAiAssessment}
              onClose={() => setShowAiAssessment(false)}
              profession={profession}
              onComplete={(tier, score, feedback) => {
                setExperienceLevel(`${tier} (IA: ${score}%)`);
                setAiAssessed(true);
                setAssessmentResult({ score, tier, feedback });
                const newTag = `IA: ${score}%`;
                if (!customCandidateTags.includes(newTag)) {
                  setCustomCandidateTags(prev => [...prev, newTag]);
                }
                setShowAiAssessment(false);
                setCandidateStep(6);
              }}
            />

            {showDatePicker && Platform.OS === 'ios' ? (
              <View style={styles.iosDatePickerContainer}>
                <View style={styles.iosDatePickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={{ color: accentColor, fontWeight: 'bold', fontSize: 16 }}>Listo</Text>
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
