import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StatusBar, Text } from 'react-native';

export const WelcomeScreen = ({ navigation, onFinish }: { navigation: any, onFinish: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo entrance with spring bounce
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 25,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Glow pulse loop
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ])
    );

    // 3. Tagline fade in after 600ms
    const textTimer = setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      glowLoop.start();
    }, 600);

    // 4. Exit animation after 2.8s
    const exitTimer = setTimeout(() => {
      glowLoop.stop();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -60,
          duration: 700,
          useNativeDriver: true,
        })
      ]).start(() => {
        onFinish();
        navigation.replace('Login');
      });
    }, 2800);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
      glowLoop.stop();
    };
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY }],
          alignItems: 'center',
        }}
      >
        {/* Logo and Glow Section */}
        <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
          {/* Glow ring */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: '#FF005C',
              opacity: glowOpacity,
              shadowColor: '#FF005C',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 40,
            }}
          />

          {/* Logo container */}
          <View
            style={{
              width: 180,
              height: 180,
              borderRadius: 50,
              backgroundColor: '#121214',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255, 0, 92, 0.25)',
              zIndex: 2,
            }}
          >
            <Image
              source={require('../assets/favicon.png')}
              style={{ width: 140, height: 140 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* App name + tagline */}
        <View style={{ height: 100, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
          <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center' }}>
            <Text
              style={{
                color: 'white',
                fontSize: 36,
                fontWeight: '900',
                letterSpacing: 6,
                textTransform: 'uppercase',
              }}
            >
              Aptly
            </Text>
            <Text
              style={{
                color: '#FF005C',
                fontSize: 12,
                fontWeight: '600',
                letterSpacing: 3,
                textTransform: 'uppercase',
                marginTop: 6,
                opacity: 0.9,
              }}
            >
              Tu carrera, tu ritmo
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};