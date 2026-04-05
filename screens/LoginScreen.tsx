import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  Animated,
  StatusBar,
  useColorScheme,
  Alert
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = ({ 
  onNavigate, 
  isBusiness, 
  setIsBusiness 
}: { 
  onNavigate: (screen: 'welcome' | 'login' | 'register' | 'home') => void;
  isBusiness: boolean;
  setIsBusiness: (value: boolean) => void;
}) => {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'candidate' | 'company'>('candidate');
  const isDarkMode = colorScheme === 'dark';
  
  // Animation state
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    console.log('Login attempt with:', email, password, 'Role:', role);
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Por favor ingresa tu correo y contraseña');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Error al iniciar sesión', error.message);
    } else {
      onNavigate('home');
    }
  };

  const handleSocialLogin = async (platform: string) => {
    // Generate an app-specific URL to return to after authentication
    const redirectUrl = Linking.createURL('auth/callback', { scheme: 'aptly' });
    


    // Get the login URL from Supabase WITHOUT opening the external browser automatically
    const { data, error } = await supabase.auth.signInWithOAuth({ 
      provider: platform.toLowerCase() as any,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      }
    });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    if (data?.url) {
      // Open the URL inside an in-app overlay window
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      
      // When the user comes back securely, process the deep link connection
      if (result.type === 'success' && result.url) {
        try {
          // Supabase returns credentials in the URL fragment (#) or sometimes query (?)
          // e.g., app://auth/callback#access_token=TOKEN&refresh_token=TOKEN
          const paramsString = result.url.split('#')[1] || result.url.split('?')[1] || '';
          const paramsList = paramsString.split('&');
          let access_token: string | null = null;
          let refresh_token: string | null = null;
          let provider_error: string | null = null;

          for (const param of paramsList) {
            const [key, value] = param.split('=');
            if (key === 'access_token') access_token = value;
            if (key === 'refresh_token') refresh_token = value;
            if (key === 'error_description') {
              provider_error = decodeURIComponent(value.replace(/\+/g, ' '));
            }
          }

          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          } else if (provider_error) {
            if (provider_error.includes('Multiple accounts')) {
              Alert.alert(
                'Cuenta Vinculada', 
                'Ya existe una cuenta con este correo (seguro ya iniciaste con Google). Para poder iniciar con ambos, debes habilitar "Link identities to a single user" en los ajustes de Supabase (Authentication > Providers).'
              );
            } else {
              Alert.alert('Error del Proveedor', provider_error);
            }
          } else {
            Alert.alert("Error de Inicio", "No se detectó la sesión iniciada correctamente. Intenta de nuevo.");
            console.error("No tokens found in URL:", result.url);
          }
        } catch (e) {
          console.error("Error parsing URL:", e);
        }
      }
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      {/* Background with Glassmorphism */}
      <ImageBackground
        source={require('../assets/morocho.jpg')}
        className="flex-1"
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-black/30 dark:bg-black/60" />
        
          {/* @ts-ignore */}
          <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
            {/* @ts-ignore */}
            <KeyboardAwareScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            className="flex-1 px-6"
            enableOnAndroid={true}
            extraScrollHeight={80}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              style={{ 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
              className="bg-white/80 dark:bg-slate-900/80 rounded-[45px] p-7 shadow-2xl border border-white/30 dark:border-slate-800/30 max-h-[94%]"
            >
              
              {/* Branding Header */}
              <View className="items-center mb-4">
                  {/* @ts-ignore */}
                  <Image 
                    source={require('../assets/favicon.png')} 
                    className="w-32 h-32" 
                    resizeMode="contain"
                  />
              </View>

              {/* Messaging Area */}
              <View className="items-center mb-6">
                <Text className="text-slate-900 dark:text-slate-50 text-3xl font-bold mb-1 tracking-tight">
                  {isBusiness ? "Aptly Business" : "Bienvenido a Aptly"}
                </Text>
                <Text className="text-slate-600 dark:text-slate-400 text-center text-[15px] px-6 leading-5 font-medium">
                   {isBusiness 
                     ? "Inicia sesión para gestionar tus ofertas y encontrar talento." 
                     : "Encuentra tu próximo empleo de forma simple y rápida."}
                </Text>
              </View>

              {/* Auth Form */}
              <View>
                {/* Role Switcher */}
                <View className="flex-row items-center p-1.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl mb-6">
                  <TouchableOpacity 
                    className={'flex-1 py-2.5 rounded-xl items-center ' + (role === 'candidate' ? 'bg-white dark:bg-slate-700 shadow-sm' : '')}
                    onPress={() => {
                      setRole('candidate');
                    }}
                  >
                    <Text className={'text-[13px] font-bold ' + (role === 'candidate' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400')}>Candidato</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className={'flex-1 py-2.5 rounded-xl items-center ' + (role === 'company' ? 'bg-white dark:bg-slate-700 shadow-sm' : '')}
                    onPress={() => {
                      setRole('company');
                    }}
                  >
                    <Text className={'text-[13px] font-bold ' + (role === 'company' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400')}>Empresa</Text>
                  </TouchableOpacity>
                </View>

                <CustomInput
                  placeholder="Correo electrónico"
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
                
                <TouchableOpacity className="items-end mb-6 -mt-3">
                  <Text className="text-primary-light font-bold text-[13px] tracking-tight">
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>

                <CustomButton 
                  title={loading ? "Iniciando..." : (isBusiness ? "Acceso Empresa" : "Iniciar Sesión")} 
                  onPress={handleLogin} 
                  variant="primary" 
                  className={`mb-8 py-4 px-10 ${isBusiness ? 'bg-slate-900 dark:bg-slate-800' : ''}`} 
                />
              </View>

              {/* Semantic Divider */}
              <View className="flex-row items-center mb-8">
                <View className="flex-1 h-[0.5px] bg-slate-300 dark:bg-slate-700" />
                <Text className="mx-4 text-slate-500 dark:text-slate-400 text-[10px] font-black tracking-widest uppercase">
                   Acceso rápido
                </Text>
                <View className="flex-1 h-[0.5px] bg-slate-300 dark:bg-slate-700" />
              </View>

              {/* Social Login Grid */}
              <View className="flex-row gap-4 mb-4">
                <CustomButton 
                  title="Google" 
                  onPress={() => handleSocialLogin('Google')} 
                  variant="social" 
                  icon="google"
                  className="flex-1 py-[12px] bg-white/50 dark:bg-slate-800/50"
                />
                <CustomButton 
                  title="GitHub" 
                  onPress={() => handleSocialLogin('GitHub')} 
                  variant="social" 
                  icon="github"
                  className="flex-1 py-[12px] bg-white/50 dark:bg-slate-800/50"
                />
              </View>

              {/* Navigation Link */}
              <View className="flex-row justify-center mt-4">
                <Text className="text-slate-600 dark:text-slate-400 text-sm">¿Nuevo por aquí? </Text>
                <TouchableOpacity onPress={() => onNavigate('register')}>
                  <Text className="text-primary-light font-black text-sm">Registrate gratis</Text>
                </TouchableOpacity>
              </View>

              {/* Company Login Toggle */}
              <View className="flex-row justify-center mt-2 mb-2">
                <Text className="text-slate-600 dark:text-slate-400 text-sm">
                  {isBusiness ? "¿Eres candidato? " : "¿Eres una empresa? "}
                </Text>
                <TouchableOpacity onPress={() => setIsBusiness(!isBusiness)}>
                  <Text className="text-primary-light font-black text-sm">
                    {isBusiness ? "Inicia sesión aquí" : "Cuenta de empresa"}
                  </Text>
                </TouchableOpacity>
              </View>

            </Animated.View>

            {/* Application Identifier */}
            <View className="mt-8 items-center pb-8">
              <Text className="text-white/70 dark:text-slate-500 text-[10px] font-bold tracking-widest uppercase py-2">
                 versión 1.0.4 - Aptly Inc.
              </Text>
            </View>

          </KeyboardAwareScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};