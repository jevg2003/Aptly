import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { useFocusEffect } from '@react-navigation/native';
import { useBusinessProfile } from '../../lib/BusinessProfileContext';
import { useApp } from '../../lib/AppContext';
import { ObsidianHeader } from '../../components/ObsidianHeader';
import { ObsidianModal } from '../../components/ObsidianModal';
import { pickAndOptimizeImage } from '../../lib/imageUtils';
import { uploadAvatar } from '../../lib/storageUtils';
import { handleAccountSoftDelete } from '../../lib/accountUtils';

export const BusinessProfileScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const { setCurrentScreen, setIsBusiness } = useApp();
  const { profile, updateProfile } = useBusinessProfile();
  const [jobsCount, setJobsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmDelete = async () => {
    try {
      setShowDeleteModal(false);
      if (!session?.user?.id) return;
      await handleAccountSoftDelete(session.user.id);
      setCurrentScreen('login');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo eliminar la cuenta');
    }
  };

  const handleImageUpload = async () => {
    if (!session?.user?.id) return;
    try {
      setUploadingImage(true);
      
      const localUri = await pickAndOptimizeImage();
      if (!localUri) return;

      const publicUrl = await uploadAvatar(localUri, session.user.id);
      if (!publicUrl) throw new Error('Error al subir la imagen al servidor.');

      await updateProfile({ avatar_url: publicUrl });
      
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Hubo un problema actualizando el logo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchCompanyProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      if (profile.full_name === 'TechFlow Solutions' && session.user.user_metadata?.full_name) {
          updateProfile({ full_name: session.user.user_metadata.full_name });
      }
      
      // Fetch Active Jobs
      const { data: jobsData, count: jobsCountRes } = await supabase
         .from('jobs')
         .select('*', { count: 'exact' })
         .eq('company_id', session.user.id)
         .order('created_at', { ascending: false })
         .limit(3);
         
      setJobsCount(jobsCountRes || 0);
      setRecentJobs(jobsData || []);

      // Fetch Applications (Candidates interested)
      const { count: appCount } = await supabase
         .from('applications')
         .select('jobs!inner(company_id)', { count: 'exact', head: true })
         .eq('jobs.company_id', session.user.id);
         
      setCandidatesCount(appCount || 0);

    } catch (error: any) {
      console.error('Error fetching company stats:', error.message);
    } finally {
      setRefreshing(false);
    }
  }, [session, profile.full_name, updateProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchCompanyProfile();
    }, [fetchCompanyProfile])
  );

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    setCurrentScreen('login');
    setIsBusiness(false);
    await supabase.auth.signOut();
  };

  const LocalStatCard = ({ label, value, icon, color }: any) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {icon && (
          <View style={styles.statIcon}>
              <Ionicons name={icon} size={12} color={color || "#475569"} />
          </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        
        <ObsidianHeader 
          title="Enterprise Profile" 
          subtitle="Corporate Center"
        />

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchCompanyProfile} tintColor="#FF005C" />
          }
        >
          {/* Logo Section */}
          <View style={styles.profileHeader}>
            <View style={styles.logoWrapper}>
              <View style={[styles.logoCircle, { overflow: 'hidden' }]}>
                 {profile?.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={{ width: '100%', height: '100%' }} />
                 ) : (
                    <MaterialCommunityIcons name="office-building" size={60} color="white" />
                 )}
              </View>
              <TouchableOpacity 
                style={styles.logoEditBtn}
                onPress={handleImageUpload}
                disabled={uploadingImage}
              >
                 {uploadingImage ? (
                   <ActivityIndicator size="small" color="white" />
                 ) : (
                   <Feather name="camera" size={16} color="white" />
                 )}
              </TouchableOpacity>
            </View>
            
            <Text style={styles.companyName}>
              {profile?.full_name || 'TechFlow Inc.'}
            </Text>
            
            <View style={styles.categoryBadge}>
                 <Text style={styles.categoryText}>{profile.category || 'Software & Tecnología'}</Text>
            </View>
            
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#FF005C" />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('EditBusinessProfile', { profile })}
              style={styles.editBtn}
            >
              <Feather name="edit-3" size={18} color="#FF005C" />
              <Text style={styles.editBtnText}>Gestionar Información</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsRow}>
             <LocalStatCard label="Vacantes Activas" value={jobsCount.toString()} />
             <LocalStatCard label="Candidatos" value={candidatesCount.toString()} />
          </View>

          {/* Corporate Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Detalles Corporativos</Text>
            </View>
            <View style={{ backgroundColor: '#121214', padding: 24, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#475569', fontSize: 10, marginBottom: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>NIT / ID Fiscal</Text>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>{profile?.tax_id || 'No registrado'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#475569', fontSize: 10, marginBottom: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Fundación</Text>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>{profile?.creation_date || 'No registrada'}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#475569', fontSize: 10, marginBottom: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Área de Negocio</Text>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>{profile?.business_area || 'No registrada'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#475569', fontSize: 10, marginBottom: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Sector principal</Text>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>{profile?.industry || profile?.category || 'No registrado'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Company Tags Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Etiquetas de la Empresa</Text>
            </View>
            {profile?.company_tags ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {profile.company_tags.split(',').map((tag: string, index: number) => (
                  <View key={index} style={{ backgroundColor: 'rgba(255,0,92,0.08)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,0,92,0.2)' }}>
                    <Text style={{ color: '#FF005C', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{tag.trim()}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ backgroundColor: '#121214', padding: 24, borderRadius: 28, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' }}>
                 <Text style={{ color: '#475569', fontSize: 13, fontWeight: '600' }}>Aún no se han añadido etiquetas.</Text>
              </View>
            )}
          </View>

          {/* PDF Preview Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Presentación Institucional</Text>
            </View>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#121214', padding: 20, borderRadius: 28, borderWidth: 1, borderColor: profile?.pdf_name ? 'rgba(255,0,92,0.3)' : 'rgba(255,255,255,0.03)' }}>
              <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: profile?.pdf_name ? 'rgba(255,0,92,0.1)' : '#1A1A1C', alignItems: 'center', justifyContent: 'center' }}>
                 <MaterialCommunityIcons name={profile?.pdf_name ? "file-pdf-box" : "file-outline"} size={28} color={profile?.pdf_name ? "#FF005C" : "#475569"} />
              </View>
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15, marginBottom: 4 }}>
                  {profile?.pdf_name ? profile.pdf_name : 'Sin documento adjunto'}
                </Text>
                <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '500', lineHeight: 18 }}>
                  {profile?.pdf_name ? 'Documento visible para todos los candidatos' : 'Puedes subirlo desde la edición del perfil'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cultura y Misión</Text>
            <View style={styles.descriptionCard}>
               <Text style={styles.descriptionText}>
                 {profile.culture || 'Añade información sobre la cultura y misión de tu empresa.'}
               </Text>
            </View>
          </View>

          {/* Recent Jobs */}
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Postings</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>View All</Text>
                </TouchableOpacity>
             </View>

              {/* Dynamic Jobs */}
             {recentJobs.length > 0 ? recentJobs.map(job => (
               <TouchableOpacity 
                 key={job.id} 
                 style={styles.miniJobCard}
                 onPress={() => navigation.navigate('Vacantes', { screen: 'JobDetail', params: { job } })}
               >
                  <View style={styles.miniJobIcon}>
                      <MaterialCommunityIcons name="briefcase-outline" size={24} color="#FF005C" />
                  </View>
                  <View style={styles.miniJobContent}>
                     <Text style={styles.miniJobTitle} numberOfLines={1}>{job.title}</Text>
                     <Text style={styles.miniJobMeta}>{job.location} • {job.modality || 'Presencial'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#1A1A1C" />
               </TouchableOpacity>
             )) : (
               <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#475569', fontSize: 12 }}>No tienes ofertas recientes.</Text>
               </View>
             )}

             {/* Add New CTA */}
             <TouchableOpacity 
                onPress={() => navigation.navigate('Vacantes', { screen: 'CreateVacante' })}
                style={styles.createCta}
             >
                <Ionicons name="add-circle-outline" size={20} color="#475569" />
                <Text style={styles.createCtaText}>Publish New Opening</Text>
             </TouchableOpacity>
          </View>

          {/* Bottom Actions */}
          <View style={styles.footerActions}>
            <TouchableOpacity 
              onPress={handleLogout}
              style={styles.logoutBtn}
            >
               <Feather name="log-out" size={18} color="#FF3B30" />
               <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowDeleteModal(true)}
              style={styles.deleteCta}
            >
               <Text style={styles.deleteText}>Eliminar Cuenta Permanente</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        {/* Logout Confirmation Modal */}
        <ObsidianModal
          isVisible={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          title="Confirmar"
          message="¿Estás seguro de que quieres cerrar sesión?"
          iconName="log-out"
          type="destructive"
          confirmText="Cerrar Sesión"
          cancelText="Cancelar"
          onConfirm={confirmLogout}
        />

        {/* Delete Account Confirmation Modal */}
        <ObsidianModal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Eliminar Cuenta"
          message="Tu cuenta será desactivada y no será visible. Tienes 30 días para recuperarla antes de que tus datos sean eliminados permanentemente. ¿Continuar con la eliminación?"
          iconName="alert-triangle"
          type="destructive"
          confirmText="Eliminar Cuenta"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    paddingTop: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoWrapper: {
    position: 'relative',
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 45,
    backgroundColor: '#FF005C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF005C',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logoEditBtn: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#121214',
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#050505',
  },
  companyName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 24,
    textAlign: 'center',
  },
  categoryBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 0, 92, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 92, 0.15)',
  },
  categoryText: {
    color: '#FF005C',
    fontWeight: '800',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  editBtn: {
    marginTop: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 35,
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtnText: {
    color: '#FF005C',
    fontWeight: '900',
    marginLeft: 10,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 40,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#121214',
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },
  statIcon: {
    position: 'absolute',
    top: 10,
    right: 12,
  },
  section: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#FF005C',
    fontWeight: '800',
    fontSize: 12,
  },
  descriptionCard: {
    backgroundColor: '#121214',
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  descriptionText: {
    color: '#94a3b8',
    lineHeight: 24,
    fontSize: 15,
    fontWeight: '500',
  },
  miniJobCard: {
    backgroundColor: '#121214',
    padding: 16,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  miniJobIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#1A1A1C',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniJobContent: {
    flex: 1,
    marginLeft: 16,
  },
  miniJobTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  miniJobMeta: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  createCta: {
    marginTop: 10,
    paddingVertical: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  createCtaText: {
    color: '#475569',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 8,
  },
  footerActions: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    paddingVertical: 18,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.1)',
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '900',
    fontSize: 15,
    marginLeft: 12,
  },
  deleteCta: {
    marginTop: 20,
    alignItems: 'center',
  },
  deleteText: {
    color: '#1A1A1C',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  }
});
