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
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';

export const LoginScreen = () => {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = () => {
    console.log('Login attempt with:', email, password);
  };

  const handleSocialLogin = (platform: string) => {
    console.log(`Social login with ${platform}`);
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={require('../assets/morocho.jpg')}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Capa de oscurecimiento dinámica */}
        <View className="absolute inset-0 bg-black/30 dark:bg-black/60" />
        
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            className="flex-1 justify-center px-6"
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
                <View className="bg-blue-50/20 dark:bg-blue-900/10 p-4 rounded-[28px] items-center justify-center">
                  <Image 
                    source={require('../assets/favicon.png')} 
                    className="w-32 h-32" 
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Messaging Area */}
              <View className="items-center mb-6">
                <Text className="text-slate-900 dark:text-slate-50 text-3xl font-bold mb-1 tracking-tight">Bienvenido a Aptly</Text>
                <Text className="text-slate-600 dark:text-slate-400 text-center text-[15px] px-6 leading-5 font-medium">
                   Encuentra tu próximo empleo de forma simple y rápida.
                </Text>
              </View>

              {/* Auth Form */}
              <View>
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
                  title="Iniciar Sesión" 
                  onPress={handleLogin} 
                  variant="primary" 
                  className="mb-8 py-4 px-10" 
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
                <TouchableOpacity>
                  <Text className="text-primary-light font-black text-sm">Registrate gratis</Text>
                </TouchableOpacity>
              </View>

            </Animated.View>

            {/* Application Identifier */}
            <View className="mt-8 items-center">
              <Text className="text-white/70 dark:text-slate-500 text-[10px] font-bold tracking-widest uppercase py-2">
                 versión 1.0.4 - Aptly Inc.
              </Text>
            </View>

          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};