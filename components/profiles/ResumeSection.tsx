import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface ResumeSectionProps {
  resumeUrl?: string;
  updatedAt?: string;
  onUpload?: () => void;
}

export const ResumeSection = ({ resumeUrl, updatedAt, onUpload }: ResumeSectionProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CV y Currículum</Text>
      </View>
      
      {resumeUrl ? (
        <View style={styles.card}>
          <View style={styles.pdfIconWrapper}>
            <MaterialCommunityIcons name="file-pdf-box" size={26} color="#ef4444" />
          </View>
          <View style={styles.details}>
            <Text style={styles.filename} numberOfLines={1}>
              CV_Profesional.pdf
            </Text>
            <Text style={styles.subtitle}>
              Actualizado: {updatedAt || 'Recientemente'}
            </Text>
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={onUpload}>
            <Feather name="refresh-cw" size={16} color="#00A3FF" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.emptyCard} onPress={onUpload}>
          <MaterialCommunityIcons name="cloud-upload-outline" size={32} color="#00A3FF" />
          <Text style={styles.emptyText}>Subir Currículum Vitae</Text>
          <Text style={styles.emptySub}>Formatos PDF o DOCX hasta 5MB</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pdfIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  filename: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: 'rgba(0, 163, 255, 0.02)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 163, 255, 0.25)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#00A3FF',
    fontWeight: '900',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 12,
  },
  emptySub: {
    color: '#475569',
    fontWeight: '800',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
});
