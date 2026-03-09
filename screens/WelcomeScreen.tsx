import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StatusBar } from 'react-native';

export const WelcomeScreen = ({ onFinish }: { onFinish: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrada: El logo aparece y se escala
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 20,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Salida: El logo se mueve un poco hacia arriba y se desvanece
    // Esto simula que el logo se "coloca" en su lugar del Login
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 700,
          useNativeDriver: true,
        })
      ]).start(() => onFinish());
    }, 2800);

    return () => clearTimeout(timer);
  }, [fadeAnim, onFinish, scaleAnim, translateY]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateY }
          ]
        }}
        className="items-center"
      >
        <Image 
          source={require('../assets/favicon.png')} 
          className="w-28 h-28"
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};