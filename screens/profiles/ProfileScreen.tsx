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
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { pickAndOptimizeImage } from '../../lib/imageUtils';
import { uploadAvatar, uploadDocument } from '../../lib/storageUtils';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { StatCard } from '../../components/profiles/StatCard';
import { ExperienceItem, Experience } from '../../components/profiles/ExperienceItem';
import { ResumeSection } from '../../components/profiles/ResumeSection';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../lib/AppContext';
import { ObsidianHeader } from '../../components/ObsidianHeader';
import { ObsidianModal } from '../../components/ObsidianModal';
import { handleAccountSoftDelete } from '../../lib/accountUtils';

export const ProfileScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const { setCurrentScreen, setIsBusiness } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorConfig, setErrorConfig] = useState({ visible: false, message: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Real data state
  const [appCount, setAppCount] = useState(0);
  const [recentApps, setRecentApps] = useState<any[]>([]);

  // Experience Modal state
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [newExp, setNewExp] = useState({ title: '', company: '', description: '' });
  const [savingExp, setSavingExp] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleOpenURL = async (url: string) => {
    if (!url) return;
    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`;
      }
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        Alert.alert('Enlace no soportado', `No se pudo abrir la dirección: ${url}`);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo abrir el enlace en el navegador.');
    }
  };

  const confirmDelete = async () => {
    try {
      setShowDeleteModal(false);
      if (!session?.user?.id) return;
      await handleAccountSoftDelete(session.user.id);
      setCurrentScreen('login');
    } catch (err: any) {
      setErrorConfig({ visible: true, message: err.message || 'No se pudo eliminar la cuenta' });
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

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (error) throw error;

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
    } catch (err: any) {
      setErrorConfig({
        visible: true,
        message: err.message || 'Hubo un problema actualizando tu foto de perfil.',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchProfileData = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);

      const { data: expData, error: expError } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', session.user.id)
        .order('start_date', { ascending: false });
      if (expError) throw expError;
      setExperiences(expData || []);

      // Fetch Real Applications Count
      const { count, error: countErr } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('candidate_id', session.user.id);

      if (!countErr) setAppCount(count || 0);

      // Fetch Recent Applications Preview
      const { data: appsData, error: appsErr } = await supabase
        .from('applications')
        .select(
          `
          id, 
          status,
          created_at,
          jobs (
            title,
            profiles(full_name, avatar_url)
          )
        `
        )
        .eq('candidate_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!appsErr && appsData) {
        const mapped = appsData.map((app) => {
          const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
          const company = job?.profiles
            ? Array.isArray(job.profiles)
              ? job.profiles[0]
              : job.profiles
            : null;
          return {
            id: app.id,
            jobTitle: job?.title || 'Vacante',
            companyName: company?.full_name || 'Empresa',
            companyLogo: company?.avatar_url,
            status:
              app.status === 'pending'
                ? 'Recibida'
                : app.status === 'reviewed'
                  ? 'En revisión'
                  : app.status === 'accepted'
                    ? 'Seleccionado'
                    : 'Procesando',
          };
        });
        setRecentApps(mapped);
      }
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

  const handleResumeUpload = async () => {
    if (!session?.user?.id) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setUploadingResume(true);
      const asset = result.assets[0];

      const publicUrl = await uploadDocument(asset.uri, session.user.id, asset.name);

      if (!publicUrl) throw new Error('No se pudo subir el archivo.');

      const { error } = await supabase
        .from('profiles')
        .update({ resume_url: publicUrl })
        .eq('id', session.user.id);

      if (error) throw error;

      // Update local state
      setProfile({ ...profile, resume_url: publicUrl });
      Alert.alert('Éxito', 'Tu CV se ha subido correctamente.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Hubo un problema al subir tu CV.');
    } finally {
      setUploadingResume(false);
    }
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

  const handleAddExperience = async () => {
    if (!newExp.title || !newExp.company) {
      setErrorConfig({
        visible: true,
        message: 'Por favor completa al menos el cargo y la empresa.',
      });
      return;
    }

    setSavingExp(true);
    try {
      const { error } = await supabase.from('experiences').insert({
        profile_id: session?.user?.id,
        title: newExp.title,
        company: newExp.company,
        description: newExp.description,
        start_date: new Date().toISOString(), // Fallback literal
      });

      if (error) throw error;

      setNewExp({ title: '', company: '', description: '' });
      setIsAddingExp(false);
      fetchProfileData(); // Refresh list
    } catch (err: any) {
      setErrorConfig({ visible: true, message: err.message });
    } finally {
      setSavingExp(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#050505',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ color: '#475569', fontStyle: 'italic' }}>Iniciando Obsidian...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" />
      <ObsidianHeader
        title="Profile"
        subtitle="Professional Hub"
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
            <TouchableOpacity style={styles.cameraBtn} onPress={handleImageUpload} disabled={uploadingImage}>
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#050505" />
              ) : (
                <MaterialCommunityIcons name="camera" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.nameText}>
            {profile?.full_name || 'Sin nombre'}
          </Text>
          <Text style={styles.titleText}>
            {profile?.professional_title || (profile?.role === 'company' ? 'Empresa' : 'Añadir título profesional')}
            {profile?.role !== 'company' && profile?.experience_level ? ` • ${profile.experience_level}` : ''}
          </Text>

          {(profile?.location || (profile?.role !== 'company' && profile?.birth_date)) && (
            <View style={styles.locationRow}>
              {profile?.location && (
                <View style={styles.locationTag}>
                  <MaterialCommunityIcons name="map-marker-outline" size={14} color="#00A3FF" />
                  <Text style={styles.locationTagText}>{profile.location}</Text>
                </View>
              )}
              {profile?.role !== 'company' && profile?.birth_date && (
                <View style={styles.locationTag}>
                  <MaterialCommunityIcons name="cake-variant" size={14} color="#00A3FF" />
                  <Text style={styles.locationTagText}>{profile.birth_date}</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile', { profile })}
            style={[
              styles.editBtn,
              profile?.role === 'company' && {
                borderColor: 'rgba(255,0,92,0.15)',
                backgroundColor: 'rgba(255,0,92,0.04)',
              }
            ]}
          >
            <Feather name="edit-3" size={18} color={profile?.role === 'company' ? "#FF005C" : "#00A3FF"} />
            <Text style={[styles.editBtnText, profile?.role === 'company' && { color: '#FF005C' }]}>Gestionar Información</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label={profile?.role === 'company' ? "Candidatos" : "Postulaciones"} value={appCount} />
          <StatCard label="Vistas" value="0" />
        </View>

        {/* Bio / Sobre mí Section (Only for Candidate, but also nice for Companies) */}
        {profile?.role !== 'company' && (
          profile?.bio ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sobre mí</Text>
              </View>
              <View style={styles.bioCard}>
                <Text style={styles.bioText}>{profile.bio}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sobre mí</Text>
              </View>
              <TouchableOpacity
                style={styles.emptyExperience}
                onPress={() => navigation.navigate('EditProfile', { profile })}
              >
                <Text style={styles.emptyText}>Aún no has añadido una breve presentación sobre ti.</Text>
                <Text style={styles.addText}>+ Añadir Resumen / Bio</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        {profile?.role === 'company' ? (
          <>
            {/* Company Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Detalles Corporativos</Text>
              </View>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  padding: 20,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 15,
                  }}>
                  <View>
                    <Text style={{ color: '#475569', fontSize: 12, marginBottom: 4 }}>
                      NIT / ID Fiscal
                    </Text>
                    <Text style={{ color: '#FFF', fontWeight: '600' }}>
                      {profile?.tax_id || 'No registrado'}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: '#475569', fontSize: 12, marginBottom: 4 }}>
                      Fecha de Creación
                    </Text>
                    <Text style={{ color: '#FFF', fontWeight: '600' }}>
                      {profile?.creation_date || 'No registrada'}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ color: '#475569', fontSize: 12, marginBottom: 4 }}>
                      Área de Negocio
                    </Text>
                    <Text style={{ color: '#FFF', fontWeight: '600' }}>
                      {profile?.business_area || 'No registrada'}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: '#475569', fontSize: 12, marginBottom: 4 }}>
                      Sector principal
                    </Text>
                    <Text style={{ color: '#FFF', fontWeight: '600' }}>
                      {profile?.industry || 'No registrado'}
                    </Text>
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
                    <View
                      key={index}
                      style={{
                        backgroundColor: 'rgba(255,0,92,0.1)',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(255,0,92,0.3)',
                      }}>
                      <Text style={{ color: '#FF005C', fontWeight: '600', fontSize: 13 }}>
                        {tag.trim()}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No hay etiquetas registradas.</Text>
              )}
            </View>

            {/* PDF Preview Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Presentación Institucional</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                }}>
                <MaterialCommunityIcons
                  name={profile?.pdf_name ? 'file-pdf-box' : 'file-outline'}
                  size={32}
                  color={profile?.pdf_name ? '#FF005C' : '#475569'}
                />
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>
                    {profile?.pdf_name ? profile.pdf_name : 'Sin documento adjunto'}
                  </Text>
                  <Text style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>
                    {profile?.pdf_name
                      ? 'Documento visible para candidatos'
                      : 'Puedes subirlo desde la edición del perfil'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Contact & Links Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Contacto y Enlaces</Text>
              </View>
              {profile?.phone || profile?.linkedin_url || profile?.portfolio_url ? (
                <View style={styles.contactContainer}>
                  {profile?.phone && (
                    <View style={styles.contactCard}>
                      <View style={styles.contactIconWrapper}>
                        <MaterialCommunityIcons name="phone" size={20} color="#00A3FF" />
                      </View>
                      <View style={styles.contactDetails}>
                        <Text style={styles.contactLabel}>Teléfono</Text>
                        <Text style={styles.contactValue}>{profile.phone}</Text>
                      </View>
                    </View>
                  )}

                  {(profile?.linkedin_url || profile?.portfolio_url) && (
                    <View style={styles.linksRow}>
                      {profile?.linkedin_url && (
                        <TouchableOpacity 
                          style={styles.linkButton} 
                          onPress={() => handleOpenURL(profile.linkedin_url)}
                        >
                          <MaterialCommunityIcons name="linkedin" size={20} color="#00A3FF" />
                          <Text style={styles.linkButtonText}>LinkedIn</Text>
                          <Feather name="external-link" size={12} color="#00A3FF" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      )}
                      {profile?.portfolio_url && (
                        <TouchableOpacity 
                          style={styles.linkButton} 
                          onPress={() => handleOpenURL(profile.portfolio_url)}
                        >
                          <MaterialCommunityIcons name="web" size={20} color="#00A3FF" />
                          <Text style={styles.linkButtonText}>Portafolio</Text>
                          <Feather name="external-link" size={12} color="#00A3FF" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.emptyExperience}
                  onPress={() => navigation.navigate('EditProfile', { profile })}
                >
                  <Text style={styles.emptyText}>Aún no has añadido datos de contacto o enlaces profesionales</Text>
                  <Text style={styles.addText}>+ Configurar Enlaces</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Skills Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Habilidades Clave</Text>
              </View>
              {profile?.candidate_tags ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {profile.candidate_tags.split(',').map((tag: string, index: number) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: 'rgba(0,163,255,0.08)',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(0,163,255,0.25)',
                      }}>
                      <Text style={{ color: '#00A3FF', fontWeight: '600', fontSize: 13 }}>
                        {tag.trim()}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.emptyExperience}
                  onPress={() => navigation.navigate('EditProfile', { profile })}>
                  <Text style={styles.emptyText}>Aún no has añadido tus habilidades clave</Text>
                  <Text style={styles.addText}>+ Configurar Habilidades</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Industry Interests Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sectores de Interés</Text>
              </View>
              {profile?.industry_interests ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {profile.industry_interests.split(',').map((interest: string, index: number) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.08)',
                      }}>
                      <Text style={{ color: '#E2E8F0', fontWeight: '600', fontSize: 13 }}>
                        {interest.trim()}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.emptyExperience}
                  onPress={() => navigation.navigate('EditProfile', { profile })}>
                  <Text style={styles.emptyText}>Aún no has añadido tus sectores de interés</Text>
                  <Text style={styles.addText}>+ Configurar Intereses</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Experience Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mi Experiencia</Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                  <TouchableOpacity onPress={() => setIsAddingExp(true)}>
                    <Text style={styles.seeAllText}>+ Añadir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>Ver Todo</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {experiences.length > 0 ? (
                experiences.map((exp) => <ExperienceItem key={exp.id} experience={exp} />)
              ) : (
                <TouchableOpacity
                  style={styles.emptyExperience}
                  onPress={() => setIsAddingExp(true)}>
                  <Text style={styles.emptyText}>Aún no has añadido experiencias</Text>
                  <Text style={styles.addText}>+ Añadir</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Resume Section */}
            <View style={styles.section}>
              {uploadingResume ? (
                <View style={[styles.emptyExperience, { borderStyle: 'solid' }]}>
                  <ActivityIndicator color="#00A3FF" size="large" />
                  <Text style={[styles.emptyText, { marginTop: 15 }]}>Subiendo currículum...</Text>
                </View>
              ) : (
                <ResumeSection resumeUrl={profile?.resume_url} onUpload={handleResumeUpload} />
              )}
            </View>
          </>
        )}

        {/* Recent Applications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Postulaciones Recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Postulaciones')}>
              <Text style={styles.seeAllText}>Ver Todas</Text>
            </TouchableOpacity>
          </View>

          {recentApps.length > 0 ? (
            recentApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.miniAppCard}
                onPress={() => navigation.navigate('Postulaciones')}>
                <View style={styles.miniAppLogo}>
                  {app.companyLogo ? (
                    <Image
                      source={{ uri: app.companyLogo }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <MaterialCommunityIcons name="office-building" size={20} color="#475569" />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.miniAppTitle}>{app.jobTitle}</Text>
                  <Text style={styles.miniAppCompany}>{app.companyName}</Text>
                </View>
                <View style={styles.miniAppStatus}>
                  <Text style={styles.miniAppStatusText}>{app.status}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyRecentApps}>
              <Feather name="layers" size={24} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyText}>Aún no te has postulado a ninguna vacante.</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.footerActions}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={styles.deleteBtn}>
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

      {/* Add Experience Modal */}
      <ObsidianModal
        isVisible={isAddingExp}
        onClose={() => setIsAddingExp(false)}
        title="Nueva Experiencia"
        message=""
        iconName="briefcase"
        confirmText={savingExp ? 'Guardando...' : 'Guardar'}
        cancelText="Descartar"
        onConfirm={handleAddExperience}
        loading={savingExp}>
        <View style={styles.modalForm}>
          <Text style={styles.modalInputLabel}>1. Cargo o Posición</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Ej: Senior UI Designer"
            placeholderTextColor="#475569"
            value={newExp.title}
            onChangeText={(val: string) => setNewExp({ ...newExp, title: val })}
          />

          <Text style={styles.modalInputLabel}>2. Empresa / Organización</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Ej: Obsidian Tech"
            placeholderTextColor="#475569"
            value={newExp.company}
            onChangeText={(val: string) => setNewExp({ ...newExp, company: val })}
          />

          <Text style={styles.modalInputLabel}>3. Periodo o Descripción</Text>
          <TextInput
            style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Ej: 2021 - Actualidad. Liderando equipos..."
            placeholderTextColor="#475569"
            multiline
            value={newExp.description}
            onChangeText={(val: string) => setNewExp({ ...newExp, description: val })}
          />
        </View>
      </ObsidianModal>
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
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  locationTagText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  editBtn: {
    marginTop: 24,
    backgroundColor: 'rgba(0, 163, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.15)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtnText: {
    color: '#00A3FF',
    fontWeight: '800',
    marginLeft: 10,
    fontSize: 14,
  },
  bioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  bioText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  contactContainer: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  contactIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 163, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.2)',
  },
  contactDetails: {
    marginLeft: 16,
    flex: 1,
  },
  contactLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contactValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  linksRow: {
    flexDirection: 'row',
    gap: 12,
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  linkButtonText: {
    color: '#00A3FF',
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 8,
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
  },
  miniAppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  miniAppLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1A1A1C',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAppTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  miniAppCompany: {
    color: '#475569',
    fontSize: 12,
    marginTop: 2,
  },
  miniAppStatus: {
    backgroundColor: 'rgba(0, 163, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniAppStatusText: {
    color: '#00A3FF',
    fontSize: 10,
    fontWeight: '800',
  },
  emptyRecentApps: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  modalForm: {
    width: '100%',
    marginTop: 20,
  },
  modalInputLabel: {
    color: '#00A3FF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  modalInput: {
    backgroundColor: '#050505',
    borderRadius: 16,
    padding: 16,
    color: 'white',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
});
