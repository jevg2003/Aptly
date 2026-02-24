import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';

export const WelcomeScreen = ({ onFinish }: { onFinish: () => void }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Animación de entrada y salida
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start(() => onFinish()); // Al terminar, avisa para cambiar de pantalla
  }, []);

  return (
    <View className="flex-1 bg-[#1E3A8A] items-center justify-center">
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text className="text-white text-5xl font-bold tracking-tighter">Aptly</Text>
        <Text className="text-blue-200 text-center mt-2 italic">Tu futuro, hoy.</Text>
      </Animated.View>
    </View>
  );
};