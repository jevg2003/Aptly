import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ObsidianModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  iconName?: React.ComponentProps<typeof Feather>['name'];
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  type?: 'info' | 'destructive' | 'success';
  children?: React.ReactNode;
  loading?: boolean;
}

export const ObsidianModal: React.FC<ObsidianModalProps> = ({
  isVisible,
  onClose,
  title,
  message,
  iconName = 'info',
  iconColor = '#00A3FF',
  confirmText = 'Aceptar',
  cancelText,
  onConfirm,
  type = 'info',
  children,
  loading = false,
}) => {
  const isDestructive = type === 'destructive';
  const finalIconColor = isDestructive ? '#FF3B30' : iconColor;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Background Blur (if supported) */}
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)' }]} />
        )}

        <View style={styles.modalContainer}>
          <View style={styles.card}>
            {/* Glossy top border effect */}
            <View style={styles.glossyTop} />

            {/* Icon Header */}
            <View style={[styles.iconWrapper, { backgroundColor: `${finalIconColor}15`, borderColor: `${finalIconColor}30` }]}>
              <Feather name={iconName} size={28} color={finalIconColor} />
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              {message ? <Text style={styles.message}>{message}</Text> : null}
              {children}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {cancelText && (
                <TouchableOpacity 
                  onPress={onClose} 
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                onPress={onConfirm || onClose} 
                style={[
                  styles.confirmBtn, 
                  isDestructive ? styles.destructiveBtn : styles.infoBtn,
                  !cancelText && { width: '100%' }
                ]}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmText}>{confirmText}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
  },
  card: {
    backgroundColor: '#121214',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  glossyTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  content: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cancelText: {
    color: '#64748b',
    fontWeight: '800',
    fontSize: 15,
  },
  confirmBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  infoBtn: {
    backgroundColor: '#00A3FF',
    shadowColor: '#00A3FF',
  },
  destructiveBtn: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
