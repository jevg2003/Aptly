import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Image,
  Animated,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Animación de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
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
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926' }}
        className="flex-1"
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-white/50" />
        
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            className="flex-1"
          >
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
              showsVerticalScrollIndicator={false}
            >
              
              <Animated.View 
                style={{ 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }}
                className="bg-white/95 rounded-[40px] p-8 shadow-2xl border border-white/50"
              >
                
                {/* Logo de Favicon */}
                <View className="items-center mb-6">
                  <View className="bg-blue-50/50 p-4 rounded-3xl items-center justify-center shadow-inner">
                    <Image 
                      source={require('../assets/favicon.png')} 
                      className="w-12 h-12"
                      resizeMode="contain"
                    />
                  </View>
                </View>

                {/* Título y Subtítulo */}
                <View className="items-center mb-8">
                  <Text className="text-slate-800 text-3xl font-bold mb-2">Bienvenido a Aptly</Text>
                  <Text className="text-slate-500 text-center text-base px-2 leading-6">
                    Accede a tu cuenta para encontrar tu próximo empleo ideal.
                  </Text>
                </View>

                {/* Formulario */}
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
                  
                  <TouchableOpacity className="items-end mb-6 -mt-1">
                    <Text className="text-[#2B468B] font-semibold text-sm">
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </TouchableOpacity>

                  <CustomButton 
                    title="Iniciar Sesión" 
                    onPress={handleLogin} 
                    variant="primary" 
                    className="mb-8"
                  />
                </View>

                {/* Divisor */}
                <View className="flex-row items-center mb-8">
                  <View className="flex-1 h-[1px] bg-slate-100" />
                  <Text className="mx-4 text-slate-400 text-[10px] font-bold tracking-widest uppercase">
                    O continúa con
                  </Text>
                  <View className="flex-1 h-[1px] bg-slate-100" />
                </View>

                {/* Logins Sociales */}
                <View>
                  <CustomButton 
                    title="Google" 
                    onPress={() => handleSocialLogin('Google')} 
                    variant="social" 
                    icon="google"
                  />
                  <CustomButton 
                    title="GitHub" 
                    onPress={() => handleSocialLogin('GitHub')} 
                    variant="social" 
                    icon="github"
                  />
                  <CustomButton 
                    title="Cuenta de empresa" 
                    onPress={() => handleSocialLogin('Company')} 
                    variant="primary" 
                    icon="briefcase-variant-outline"
                  />
                </View>

                {/* Enlace de Registro */}
                <View className="flex-row justify-center mt-6">
                  <Text className="text-slate-500">¿No tienes una cuenta? </Text>
                  <TouchableOpacity>
                    <Text className="text-[#2B468B] font-bold">Registrate</Text>
                  </TouchableOpacity>
                </View>

              </Animated.View>

              {/* Footer */}
              <View className="mt-8 items-center">
                <Text className="text-slate-400 text-[10px] font-medium tracking-widest">
                  Aptly v1.0.4 © 2024
                </Text>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};