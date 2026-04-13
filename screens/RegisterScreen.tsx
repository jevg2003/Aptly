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
  Keyboard
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

export const RegisterScreen = ({ navigation }: any) => {
  const { setIsBusiness } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [localRole, setLocalRole] = useState<'candidate' | 'company'>('candidate');
  
  const switchAnim = useSharedValue(0);
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
    if (!email || !password || (localRole === 'company' && !companyName)) {
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
          role: 'company'
        } : { 
          role: 'candidate' 
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Animated.View style={[styles.card, animatedCardStyle]}>
              <View style={styles.logoContainer}>
                <Image source={require('../assets/favicon.png')} style={styles.logo} resizeMode="contain" />
                <Animated.Text style={[styles.title, animatedAccentStyle]}>Unirse a Aptly</Animated.Text>
              </View>

              <View 
                style={styles.switcherContainer}
                onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
              >
                <Animated.View style={[styles.switcherPill, animatedSwitchStyle]} />
                <TouchableOpacity onPress={() => handleRoleChange('candidate')} style={styles.switcherButton}>
                  <Text style={[styles.switcherText, localRole === 'candidate' && styles.switcherTextActive]}>Candidato</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRoleChange('company')} style={styles.switcherButton}>
                  <Text style={[styles.switcherText, localRole === 'company' && styles.switcherTextActive]}>Empresa</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                <CustomInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} iconName="email-outline" />
                
                {localRole === 'company' && (
                  <CustomInput placeholder="Nombre de la empresa" value={companyName} onChangeText={setCompanyName} iconName="office-building" />
                )}

                <CustomInput placeholder="Contraseña" value={password} onChangeText={setPassword} iconName="lock-outline" isPassword />
                <CustomInput placeholder="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} iconName="lock-check-outline" isPassword />

                <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8} style={{ marginTop: 10 }}>
                  <Animated.View style={[styles.mainButton, { 
                    backgroundColor: interpolateColor(switchAnim.value, [0, 1], [COLORS.candidate, COLORS.company])
                  } as any]}>
                    <Text style={styles.buttonText}>{loading ? 'Creando cuenta...' : 'Registrarse'}</Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Animated.Text style={[styles.linkText, animatedAccentStyle]}>Inicia sesión</Animated.Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>

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
          confirmText="Continuar"
        />
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1, paddingHorizontal: 24 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 70, height: 70, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  switcherContainer: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 20, padding: 6, marginBottom: 24, position: 'relative' },
  switcherPill: { position: 'absolute', top: 6, left: 6, width: '50%', height: '100%', borderRadius: 14 },
  switcherButton: { flex: 1, paddingVertical: 12, alignItems: 'center', zIndex: 1 },
  switcherText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  switcherTextActive: { color: '#FFF' },
  form: { width: '100%' },
  mainButton: { borderRadius: 20, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: '800' },
});
