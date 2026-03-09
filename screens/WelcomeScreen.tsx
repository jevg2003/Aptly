import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StatusBar, useColorScheme, ImageBackground } from 'react-native';

export const WelcomeScreen = ({ onFinish }: { onFinish: () => void }) => {
  const colorScheme = useColorScheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    // Entrance animation
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

    // Exit animation
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -80,
          duration: 700,
          useNativeDriver: true,
        })
      ]).start(() => onFinish());
    }, 2800);

    return () => clearTimeout(timer);
  }, [fadeAnim, onFinish, scaleAnim, translateY]);

  return (
    <View className="flex-1">
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={require('../assets/morocho.jpg')}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Oscurecimiento del fondo */}
        <View className="absolute inset-0 bg-black/40 dark:bg-black/60" />

        <View className="flex-1 items-center justify-center">
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
            <View className="bg-white/90 dark:bg-slate-900/90 p-8 rounded-[40px] shadow-2xl border border-white/20">
              <Image 
                source={require('../assets/favicon.png')} 
                className="w-40 h-40"
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
};