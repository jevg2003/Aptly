import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Alert,
  RefreshControl,
  StyleSheet,
  ActivityIndicator
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

export const BusinessProfileScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const { setCurrentScreen, setIsBusiness } = useApp();
  const { profile, updateProfile } = useBusinessProfile();
  const [jobsCount, setJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchCompanyProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      if (profile.full_name === 'TechFlow Solutions' && session.user.user_metadata?.full_name) {
          updateProfile({ full_name: session.user.user_metadata.full_name });
      }
      const { count, error: jobsError } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('company_id', session.user.id);
      setJobsCount(jobsError ? 2 : count || 0);
    } catch (error: any) {
      console.error('Error fetching company jobs count:', error.message);
    } finally {
      setLoading(false);
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
          rightIcon="settings-outline"
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
              <View style={styles.logoCircle}>
                 <MaterialCommunityIcons name="office-building" size={60} color="white" />
              </View>
              <TouchableOpacity style={styles.logoEditBtn}>
                 <Feather name="camera" size={16} color="white" />
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
             <LocalStatCard label="Candidatos" value="85" />
             <LocalStatCard label="Valoración" value="4.8" icon="star" color="#FFCC00" />
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cultura y Misión</Text>
            <View style={styles.descriptionCard}>
               <Text style={styles.descriptionText}>
                 {profile.culture}
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

             {/* Job Item 1 */}
             <TouchableOpacity style={styles.miniJobCard}>
                <View style={styles.miniJobIcon}>
                    <MaterialCommunityIcons name="xml" size={24} color="#FF005C" />
                </View>
                <View style={styles.miniJobContent}>
                   <Text style={styles.miniJobTitle} numberOfLines={1}>Senior UX Designer</Text>
                   <Text style={styles.miniJobMeta}>HQ • Medellín • Remote</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#1A1A1C" />
             </TouchableOpacity>

             {/* Add New CTA */}
             <TouchableOpacity 
                onPress={() => navigation.navigate('CreateVacante')}
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

            <TouchableOpacity style={styles.deleteCta}>
               <Text style={styles.deleteText}>Enterprise Account Options</Text>
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
