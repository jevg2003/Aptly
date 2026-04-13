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

// Colors from favicon and futuristic palette
const COLORS = {
  background: '#050505',
  card: '#121214',
  candidate: '#00A3FF',
  company: '#FF005C',
  text: '#FFFFFF',
  textSecondary: '#94a3b8',
  border: 'rgba(255, 255, 255, 0.05)',
};

export const LoginScreen = ({ navigation }: any) => {
  const { setIsBusiness } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Local role state for pure UI animation
  const [localRole, setLocalRole] = useState<'candidate' | 'company'>('candidate');
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });
  
  // Shared values for animations
  const switchAnim = useSharedValue(0); // 0 for candidate, 1 for company
  const contentFade = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    // Initial entrance animation
    contentFade.value = withDelay(200, withTiming(1, { duration: 1000 }));
    cardTranslateY.value = withDelay(200, withSpring(0, { damping: 15 }));
  }, []);

  const handleRoleChange = (role: 'candidate' | 'company') => {
    setLocalRole(role);
    switchAnim.value = withSpring(role === 'candidate' ? 0 : 1, { damping: 20 });
    // Note: We don't call setIsBusiness here to avoid app-wide re-renders during UI interaction
  };

  const animatedSwitchStyle = useAnimatedStyle(() => {
    // Calculate a stretch effect based on the animation speed/position
    const isMoving = switchAnim.value > 0.1 && switchAnim.value < 0.9;
    const stretch = withSpring(isMoving ? 1.1 : 1, { damping: 10 });
    
    // Calculate exact travel distance: (containerWidth - innerPaddingTotal) / 2
    // Inner padding is 12 (6 from each side)
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
      // Add a dynamic glow effect
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

  const handleLogin = async () => {
    if (!email || !password) {
      setAlertConfig({
        visible: true,
        title: 'Datos Incompletos',
        message: 'Por favor ingresa todos los datos para continuar.'
      });
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setAlertConfig({
        visible: true,
        title: 'Error de Acceso',
        message: 'Credenciales incorrectas o problema de red. Por favor intenta de nuevo.'
      });
    } else {
      // Sync global state only upon success
      setIsBusiness(localRole === 'company');
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
              {/* Logo section */}
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../assets/favicon.png')} 
                  style={styles.logo} 
                  resizeMode="contain"
                />
                <Animated.Text style={[styles.title, animatedAccentStyle]}>
                  {localRole === 'candidate' ? 'Aptly' : 'Aptly Business'}
                </Animated.Text>
              </View>

              {/* Innovative Switcher */}
              <View 
                style={styles.switcherContainer}
                onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
              >
                <Animated.View style={[styles.switcherPill, animatedSwitchStyle]} />
                <TouchableOpacity 
                   onPress={() => handleRoleChange('candidate')}
                   style={styles.switcherButton}
                >
                  <Text style={[styles.switcherText, localRole === 'candidate' && styles.switcherTextActive]}>
                    Candidato
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   onPress={() => handleRoleChange('company')}
                   style={styles.switcherButton}
                >
                  <Text style={[styles.switcherText, localRole === 'company' && styles.switcherTextActive]}>
                    Empresa
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form section */}
              <View style={styles.form}>
                <CustomInput
                  placeholder="Email institucional"
                  value={email}
                  onChangeText={setEmail}
                  iconName="email-outline"
                  keyboardType="email-address"
                />
                
                <CustomInput
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  iconName="lock-outline"
                  isPassword
                />

                <TouchableOpacity style={styles.forgotPass}>
                  <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Animated.View style={[styles.mainButton, { 
                    backgroundColor: interpolateColor(
                      switchAnim.value,
                      [0, 1],
                      [COLORS.candidate, COLORS.company]
                    )
                  } as any]}>
                    <Text style={styles.buttonText}>
                      {loading ? 'Accediendo...' : (localRole === 'company' ? 'Acceso Empresa' : 'Entrar')}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>

                {/* Fast Access Section */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ACCESO RÁPIDO</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialContainer}>
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                    <Image 
                      source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} 
                      style={styles.socialIcon}
                    />
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="github" size={20} color="#FFF" />
                    <Text style={[styles.socialButtonText, { marginLeft: 8 }]}>GitHub</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>¿Nuevo por aquí? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Animated.Text style={[styles.linkText, animatedAccentStyle]}>Regístrate gratis</Animated.Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <ObsidianModal
              isVisible={alertConfig.visible}
              onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
              title={alertConfig.title}
              message={alertConfig.message}
              iconName="alert-circle"
              type="destructive"
              confirmText="Reintentar"
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 6,
    marginBottom: 24,
    position: 'relative',
  },
  switcherPill: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: '50%',
    height: '100%',
    borderRadius: 14,
  },
  switcherButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  switcherText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  switcherTextActive: {
    color: '#FFF',
  },
  form: {
    width: '100%',
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#64748b',
    fontSize: 13,
  },
  mainButton: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dividerText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '800',
  },
});