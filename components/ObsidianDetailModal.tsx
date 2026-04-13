import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView,
  Image,
  Platform 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
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
  location
}) => {
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

        <View style={styles.container}>
          <View style={styles.handle} />
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {imageUrl && (
              <Image source={{ uri: imageUrl }} style={styles.coverImage} />
            )}

            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {(location || salary) && (
              <View style={styles.metaRow}>
                {location && (
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={16} color="#00A3FF" />
                    <Text style={styles.metaText}>{location}</Text>
                  </View>
                )}
                {salary && (
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={16} color="#00A3FF" />
                    <Text style={styles.metaText}>{salary}</Text>
                  </View>
                )}
              </View>
            )}

            {tags && tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.contentText}>{content}</Text>
            </View>

            {/* Placeholder for more info like requirements */}
            <View style={[styles.contentSection, { marginBottom: 40 }]}>
              <Text style={styles.sectionTitle}>Requisitos & Cultura</Text>
              <Text style={styles.contentText}>
                Buscamos a alguien apasionado por el crecimiento y la innovación. En Aptly, valoramos la proactividad y el trabajo en equipo bajo nuestra filosofía de Obsidian Universe.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
             <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
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
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
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
    color: '#00A3FF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
    backgroundColor: 'rgba(0, 163, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.2)',
  },
  tagText: {
    color: '#00A3FF',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  }
});
