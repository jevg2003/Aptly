import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar,
  Alert,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { StatCard } from '../../components/profiles/StatCard';
import { ExperienceItem, Experience } from '../../components/profiles/ExperienceItem';
import { ResumeSection } from '../../components/profiles/ResumeSection';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../lib/AppContext';
import { ObsidianHeader } from '../../components/ObsidianHeader';
import { ObsidianModal } from '../../components/ObsidianModal';

export const ProfileScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const { setCurrentScreen, setIsBusiness } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [errorConfig, setErrorConfig] = useState({ visible: false, message: '' });

  const fetchProfileData = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);

      const { data: expData, error: expError } = await supabase.from('experiences').select('*').eq('profile_id', session.user.id).order('start_date', { ascending: false });
      if (expError) throw expError;
      setExperiences(expData || []);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [fetchProfileData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    setCurrentScreen('login');
    setIsBusiness(false);
    const { error } = await supabase.auth.signOut();
    if (error) setErrorConfig({ visible: true, message: error.message });
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#475569', fontStyle: 'italic' }}>Iniciando Obsidian...</Text>
      </View>
    );
  }

  const profileCompletePercent = 85;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" />
      
      <ObsidianHeader 
        title="Profile" 
        subtitle="Professional Hub"
        rightIcon="settings-outline"
      />

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A3FF" />
        }
      >
        {/* Profile Card Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <MaterialCommunityIcons name="account" size={80} color="#1A1A1C" />
              )}
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
               <MaterialCommunityIcons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.nameText}>
            {profile?.full_name || 'Sin nombre'}
          </Text>
          <Text style={styles.titleText}>
            {profile?.professional_title || 'Añadir título profesional'}
          </Text>
          
          {profile?.location && (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color="#475569" />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          )}

          <TouchableOpacity 
            onPress={() => navigation.navigate('EditProfile', { profile })}
            style={styles.editBtn}
          >
            <Feather name="edit-3" size={18} color="#00A3FF" />
            <Text style={styles.editBtnText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
            <StatCard label="Profile Complete" value={`${profileCompletePercent}%`} sublabel="Añadir experiencia" />
            <StatCard label="Applications" value="12" />
            <StatCard label="Profile Views" value="34" />
        </View>

        {/* Experience Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mi Experiencia</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver Todo</Text>
            </TouchableOpacity>
          </View>
          
          {experiences.length > 0 ? (
            experiences.map(exp => (
              <ExperienceItem key={exp.id} experience={exp} />
            ))
          ) : (
            <TouchableOpacity 
              style={styles.emptyExperience}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.emptyText}>Aún no has añadido experiencias</Text>
              <Text style={styles.addText}>+ Añadir</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Resume Section */}
        <View style={styles.section}>
            <ResumeSection 
              resumeUrl={profile?.resume_url} 
              onUpload={() => navigation.navigate('EditProfile')}
            />
        </View>

        {/* Action Buttons */}
        <View style={styles.footerActions}>
          <TouchableOpacity 
            onPress={handleLogout}
            style={styles.logoutBtn}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Eliminar Cuenta</Text>
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

      {/* Error Modal */}
      <ObsidianModal
        isVisible={errorConfig.visible}
        onClose={() => setErrorConfig({ ...errorConfig, visible: false })}
        title="Error"
        message={errorConfig.message}
        iconName="alert-circle"
        type="destructive"
        confirmText="Entendido"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    paddingTop: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    backgroundColor: '#121214',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00A3FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#050505',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 20,
  },
  titleText: {
    fontSize: 14,
    color: '#00A3FF',
    fontWeight: '700',
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  editBtn: {
    marginTop: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtnText: {
    color: '#00A3FF',
    fontWeight: '800',
    marginLeft: 10,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 35,
    gap: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 35,
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
    letterSpacing: 0.5,
  },
  seeAllText: {
    color: '#00A3FF',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyExperience: {
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  emptyText: {
    color: '#475569',
    fontSize: 13,
    fontStyle: 'italic',
  },
  addText: {
    color: '#00A3FF',
    fontWeight: '900',
    marginTop: 8,
  },
  footerActions: {
    paddingHorizontal: 20,
    marginTop: 20,
    paddingBottom: 60,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.1)',
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 10,
  },
  deleteBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  deleteText: {
    color: '#1e293b',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});
