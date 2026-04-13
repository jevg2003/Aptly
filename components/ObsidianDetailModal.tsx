import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView,
  Image,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ObsidianDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  salary?: string;
  location?: string;
  accentColor?: string;
}

export const ObsidianDetailModal: React.FC<ObsidianDetailModalProps> = ({
  isVisible,
  onClose,
  title,
  subtitle,
  content,
  imageUrl,
  tags,
  salary,
  location,
  accentColor = '#FF005C',
}) => {
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture downward swipes
        return gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 1.2) {
          // Swipe down far enough → dismiss
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={onClose} 
          activeOpacity={1}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.9)' }]} />
          )}
        </TouchableOpacity>

        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
          {/* Handle with PanResponder attached */}
          <View {...panResponder.panHandlers} style={styles.handleZone}>
            <View style={styles.handle} />
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {imageUrl && (
              <Image source={{ uri: imageUrl }} style={styles.coverImage} />
            )}

            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={[styles.subtitle, { color: accentColor }]}>{subtitle}</Text>}
            </View>

            {(location || salary) && (
              <View style={styles.metaRow}>
                {location && (
                  <View style={[styles.metaItem, { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` }]}>
                    <Ionicons name="location-outline" size={16} color={accentColor} />
                    <Text style={styles.metaText}>{location}</Text>
                  </View>
                )}
                {salary && (
                  <View style={[styles.metaItem, { backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}20` }]}>
                    <Ionicons name="cash-outline" size={16} color={accentColor} />
                    <Text style={styles.metaText}>{salary}</Text>
                  </View>
                )}
              </View>
            )}

            {tags && tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, i) => (
                  <View key={i} style={[styles.tag, { backgroundColor: `${accentColor}1a`, borderColor: `${accentColor}33` }]}>
                    <Text style={[styles.tagText, { color: accentColor }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.contentText}>{content}</Text>
            </View>

            <View style={[styles.contentSection, { marginBottom: 40 }]}>
              <Text style={styles.sectionTitle}>Requisitos & Cultura</Text>
              <Text style={styles.contentText}>
                Buscamos a alguien apasionado por el crecimiento y la innovación. En Aptly, valoramos la proactividad y el trabajo en equipo bajo nuestra filosofía de Obsidian Universe.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: `${accentColor}26`, borderColor: `${accentColor}4d` }]} onPress={onClose}>
             <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#050505',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  handleZone: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF005C',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 92, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 92, 0.12)',
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 30,
  },
  tag: {
    backgroundColor: 'rgba(255, 0, 92, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 92, 0.2)',
  },
  tagText: {
    color: '#FF005C',
    fontSize: 12,
    fontWeight: '800',
  },
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
    fontWeight: '400',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 0, 92, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 92, 0.3)',
  }
});
