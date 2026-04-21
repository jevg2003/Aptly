import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBusinessChat } from '../../lib/BusinessChatContext';

const { width } = Dimensions.get('window');

export const NotificationBanner = () => {
  const { notification, setNotification } = useBusinessChat();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (notification?.visible) {
      // Entrar
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }).start();

      // Salir automáticamente después de 4 segundos
      const timer = setTimeout(() => {
        hideBanner();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const hideBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNotification(null);
    });
  };

  if (!notification) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity 
        style={styles.banner} 
        onPress={hideBanner}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#FF005C" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.body} numberOfLines={1}>{notification.body}</Text>
        </View>
        <TouchableOpacity onPress={hideBanner}>
          <Ionicons name="close" size={20} color="#475569" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  banner: {
    width: '100%',
    backgroundColor: '#121214',
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 92, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 0, 92, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 2,
  },
  body: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
