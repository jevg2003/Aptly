import React from 'react';
import { View, Text, ImageBackground, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { SocialButton } from '../components/SocialButton';

export const LoginScreen = () => {
  return (
    <View className="flex-1">
      {/* Imagen de fondo de oficina */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c' }}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Capa blanca semi-transparente para aclarar el fondo como en tu foto */}
        <View className="absolute inset-0 bg-white/60" />

        <SafeAreaView className="flex-1 items-center justify-between py-10">
          
          {/* SECCIÓN LOGO */}
          <View className="items-center mt-10">
            <View className="bg-[#2b468b] p-4 rounded-2xl shadow-xl">
               <Image 
                source={require('../assets/favicon.png')} 
                className="w-16 h-16" 
                tintColor="white"
              />
            </View>
            <Text className="text-[#2b468b] text-2xl font-bold mt-4">Aptly</Text>
            <Text className="text-gray-600 text-center px-10 mt-2 font-medium">
              Encuentra tu futuro profesional con un solo toque.
            </Text>
          </View>

          {/* CONTENEDOR BLANCO (La Tarjeta de tu imagen) */}
          <View className="w-[90%] bg-white/95 rounded-[30px] p-6 shadow-2xl border border-white">
            
            <SocialButton title="Continue with Google" icon="google" variant="google" />
            <SocialButton title="Continue with GitHub" icon="github" variant="github" />

            <View className="items-center my-4">
              <Text className="text-gray-400 font-bold text-[10px] tracking-widest">
                O USA TU CUENTA
              </Text>
            </View>

            <SocialButton title="Iniciar Sesión" icon="briefcase" variant="primary" />

            <TouchableOpacity className="mt-4 flex-row justify-center">
              <Text className="text-gray-500 text-sm">Don't have an account? </Text>
              <Text className="text-black font-bold text-sm">Register here</Text>
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};