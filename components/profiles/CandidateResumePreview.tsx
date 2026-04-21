import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const CandidateResumePreview = ({ profile, experiences = [], onClose }: any) => {
  return (
    <View style={styles.modalContent}>
      {/* Header Overlay Style */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Perfil Profesional</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{profile?.full_name}</Text>
          <Text style={styles.role}>{profile?.professional_title || 'Candidato Aptly'}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#64748b" />
            <Text style={styles.locationText}>{profile?.location || 'Colombia'}</Text>
          </View>

          <View style={styles.bioContainer}>
             <Text style={styles.sectionTitle}>SOBRE MÍ</Text>
             <Text style={styles.bioText}>{profile?.bio || 'Este candidato aún no ha completado su biografía profesional.'}</Text>
          </View>
        </View>

        {/* Experience Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase-outline" size={18} color="#FF005C" />
            <Text style={styles.sectionTitle}>TRAYECTORIA LABORAL</Text>
          </View>
          
          {experiences.length > 0 ? (
            experiences.map((exp: any, index: number) => (
              <View key={exp.id || index} style={styles.expItem}>
                 <View style={styles.expDot} />
                 {index !== experiences.length - 1 && <View style={styles.expLine} />}
                 
                 <View style={styles.expContent}>
                    <Text style={styles.expTitle}>{exp.title}</Text>
                    <Text style={styles.expCompany}>{exp.company}</Text>
                    <Text style={styles.expDate}>
                      {exp.start_date ? new Date(exp.start_date).getFullYear() : 'N/A'} - {exp.is_current ? 'Presente' : (exp.end_date ? new Date(exp.end_date).getFullYear() : 'N/A')}
                    </Text>
                    <Text style={styles.expDesc}>{exp.description}</Text>
                    
                    {exp.tags && (
                      <View style={styles.tagRow}>
                        {exp.tags.map((tag: string, tidx: number) => (
                          <View key={tidx} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                 </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
               <Text style={styles.emptyText}>No hay experiencias laborales registradas.</Text>
            </View>
          )}
        </View>

        {/* Contact CTA */}
        <View style={styles.ctaFooter}>
           <Text style={styles.ctaText}>¿Cumple con el perfil?</Text>
           <Text style={styles.ctaSub}>Puedes solicitar su HV formal en el chat.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: { flex: 1, backgroundColor: '#050505' },
  topBar: { 
    height: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    backgroundColor: '#1A1A1C',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  topTitle: { color: 'white', fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  closeBtn: { padding: 5 },
  scroll: { paddingBottom: 40 },
  profileSection: { alignItems: 'center', padding: 24, backgroundColor: '#121214' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#FF005C', marginBottom: 16 },
  name: { color: 'white', fontSize: 24, fontWeight: '900' },
  role: { color: '#FF005C', fontSize: 14, fontWeight: '800', marginTop: 4, letterSpacing: 0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  locationText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  bioContainer: { width: '100%', marginTop: 24, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 20 },
  sectionTitle: { color: '#FF005C', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
  bioText: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
  
  section: { padding: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  expItem: { flexDirection: 'row', marginBottom: 24, position: 'relative' },
  expDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF005C', marginTop: 4, zIndex: 2 },
  expLine: { position: 'absolute', left: 5.5, top: 16, bottom: -24, width: 1, backgroundColor: 'rgba(255,0,92,0.2)', zIndex: 1 },
  expContent: { flex: 1, marginLeft: 20 },
  expTitle: { color: 'white', fontSize: 16, fontWeight: '800' },
  expCompany: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginTop: 2 },
  expDate: { color: '#64748b', fontSize: 10, fontWeight: '700', marginTop: 4 },
  expDesc: { color: '#64748b', fontSize: 12, lineHeight: 18, marginTop: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700' },
  emptyBox: { padding: 20, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, alignItems: 'center' },
  emptyText: { color: '#475569', fontSize: 12 },
  ctaFooter: { padding: 30, alignItems: 'center', backgroundColor: '#121214', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  ctaText: { color: 'white', fontSize: 18, fontWeight: '900' },
  ctaSub: { color: '#64748b', fontSize: 13, marginTop: 6 }
});
