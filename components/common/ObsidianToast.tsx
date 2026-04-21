import React, { useEffect, useRef } from 'react';
import { 
  Animated, 
  Text, 
  View, 
  StyleSheet, 
  Dimensions, 
  DeviceEventEmitter 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export const ObsidianToast = () => {
  const [visible, setVisible] = React.useState(false);
  const [config, setConfig] = React.useState<ToastOptions | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('SHOW_OBSIDIAN_TOAST', (options: ToastOptions) => {
      setConfig(options);
      show();
    });
    return () => listener.remove();
  }, []);

  const show = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 10,
      }),
    ]).start();

    setTimeout(hide, config?.duration || 3000);
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setConfig(null);
    });
  };

  if (!visible || !config) return null;

  const getIcon = () => {
    switch (config.type) {
      case 'error': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'checkmark-circle';
    }
  };

  const getAccentColor = () => {
    switch (config.type) {
      case 'error': return '#FF3B30';
      case 'info': return '#00A3FF';
      default: return '#FF005C';
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        <View style={[styles.toast, { borderColor: `rgba(${config.type === 'error' ? '255,59,48' : '255,0,92'}, 0.3)` }]}>
           <View style={[styles.iconLine, { backgroundColor: getAccentColor() }]} />
           <Ionicons name={getIcon()} size={20} color={getAccentColor()} />
           <Text style={styles.message}>{config.message}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
};

export const showToast = (message: string, type: ToastOptions['type'] = 'success', duration = 3000) => {
  DeviceEventEmitter.emit('SHOW_OBSIDIAN_TOAST', { message, type, duration });
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 10000,
    width: width * 0.9,
  },
  blur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 10, 12, 0.8)',
  },
  iconLine: {
    position: 'absolute',
    left: 0,
    top: '25%',
    bottom: '25%',
    width: 3,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 12,
    letterSpacing: 0.3,
  }
});
