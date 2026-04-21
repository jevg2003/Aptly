import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Image,
  StatusBar,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { pickAndOptimizeImage } from '../../lib/imageUtils';
import { uploadAvatar } from '../../lib/storageUtils';
import { ObsidianModal } from '../../components/ObsidianModal';

export const EditProfileScreen = ({ navigation, route }: any) => {
  const session = React.useContext(SessionContext);
  const initialProfile = route.params?.profile || {};
  
  // Profile State
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [title, setTitle] = useState(initialProfile.professional_title || '');
  const [location, setLocation] = useState(initialProfile.location || '');
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Experience State
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [newExp, setNewExp] = useState({ title: '', company: '', description: '' });
  const [savingExp, setSavingExp] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [fetchingExp, setFetchingExp] = useState(false);

  const fetchExperiences = useCallback(async () => {
    if (!session?.user?.id) return;
    setFetchingExp(true);
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setExperiences(data || []);
    } catch (err: any) {
      console.error('Error fetching experiences:', err.message);
    } finally {
      setFetchingExp(false);
    }
  }, [session?.user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchExperiences();
    }, [fetchExperiences])
  );

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

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
      setAvatarUrl(publicUrl);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Problema al actualizar la foto.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session?.user?.id,
          full_name: fullName,
          professional_title: title,
          location: location,
          bio,
          updated_at: new Date(),
        });

      if (error) throw error;
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExperience = async () => {
    if (!newExp.title || !newExp.company) {
      Alert.alert('Error', 'Título y empresa son obligatorios.');
      return;
    }

    setSavingExp(true);
    try {
      const { data, error } = await supabase
        .from('experiences')
        .insert({
          profile_id: session?.user?.id,
          title: newExp.title,
          company: newExp.company,
          description: newExp.description,
          start_date: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      
      setExperiences([data[0], ...experiences]);
      setNewExp({ title: '', company: '', description: '' });
      setIsAddingExp(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSavingExp(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setExperiences(experiences.filter(exp => exp.id !== id));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestionar Información</Text>
        <TouchableOpacity onPress={handleSaveProfile} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#00A3FF" /> : <Text style={styles.saveBtn}>Guardar</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <MaterialCommunityIcons name="account" size={50} color="#334155" />
                )}
              </View>
              <TouchableOpacity onPress={handleImageUpload} disabled={uploadingImage} style={styles.avatarEditBtn}>
                 {uploadingImage ? <ActivityIndicator size="small" color="white" /> : <Feather name="edit-2" size={14} color="white" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Professional Info */}
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>Información Profesional</Text>

            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholderTextColor="#334155" style={styles.input} />

            <Text style={styles.inputLabel}>Título Profesional</Text>
            <TextInput value={title} onChangeText={setTitle} placeholderTextColor="#334155" style={styles.input} />

            <Text style={styles.inputLabel}>Ubicación</Text>
            <TextInput value={location} onChangeText={setLocation} placeholderTextColor="#334155" style={styles.input} />

            <Text style={styles.inputLabel}>Resumen / Bio</Text>
            <TextInput value={bio} onChangeText={setBio} multiline numberOfLines={3} placeholderTextColor="#334155" style={[styles.input, styles.inputMultiline]} />
          </View>

          {/* Experiences Section */}
          <View className="mb-10 px-2">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-xs font-black text-slate-500 uppercase tracking-[3px]">Experiencia</Text>
              <TouchableOpacity 
                onPress={() => setIsAddingExp(!isAddingExp)}
                className="bg-[#00A3FF] px-5 py-2 rounded-full"
              >
                <Text className="text-white font-black uppercase text-[10px] tracking-widest">{isAddingExp ? "Cerrar" : "+ Añadir"}</Text>
              </TouchableOpacity>
            </View>


            {/* The inline form was removed in favor of the ObsidianModal */}

            {fetchingExp ? (
              <ActivityIndicator color="#00A3FF" />
            ) : experiences.length > 0 ? (
              experiences.map((exp) => (
                <View key={exp.id} className="flex-row items-center justify-between bg-[#121214] p-5 rounded-[24px] mb-4 border border-white/5">
                  <View className="flex-1 mr-4">
                    <Text className="font-bold text-white text-base">{exp.title}</Text>
                    <Text className="text-[11px] font-black uppercase tracking-widest text-[#00A3FF] mt-1">{exp.company}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteExperience(exp.id)} className="w-10 h-10 bg-red-500/10 rounded-full items-center justify-center">
                    <Feather name="trash-2" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View className="py-10 items-center">
                 <Feather name="briefcase" size={24} color="#1e293b" />
                 <Text className="text-slate-600 text-center uppercase font-black text-[10px] tracking-widest mt-4">No hay experiencias registradas</Text>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={handleSaveProfile} disabled={loading} style={styles.saveAllBtn}>
            <Text style={styles.saveAllText}>{loading ? "Guardando..." : "Guardar Todo"}</Text>
          </TouchableOpacity>
      </ScrollView>
      </SafeAreaView>

      <ObsidianModal
        isVisible={isAddingExp}
        onClose={() => setIsAddingExp(false)}
        title="Nueva Experiencia"
        message=""
        iconName="briefcase"
        confirmText={savingExp ? "Guardando..." : "Guardar"}
        cancelText="Descartar"
        onConfirm={handleAddExperience}
        loading={savingExp}
      >
        <View style={styles.modalForm}>
           <Text style={styles.modalInputLabel}>1. Cargo o Posición</Text>
           <TextInput 
             style={styles.modalInput} 
             placeholder="Ej: Senior Frontend" 
             placeholderTextColor="#475569"
             value={newExp.title}
             onChangeText={(val) => setNewExp({...newExp, title: val})}
           />

           <Text style={styles.modalInputLabel}>2. Empresa</Text>
           <TextInput 
             style={styles.modalInput} 
             placeholder="Ej: Google" 
             placeholderTextColor="#475569"
             value={newExp.company}
             onChangeText={(val) => setNewExp({...newExp, company: val})}
           />

           <Text style={styles.modalInputLabel}>3. Descripción / Periodo</Text>
           <TextInput 
             style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]} 
             placeholder="Ej: 2022 - 2024. Desarrollo de UI..." 
             placeholderTextColor="#475569"
             multiline
             value={newExp.description}
             onChangeText={(val) => setNewExp({...newExp, description: val})}
           />
        </View>
      </ObsidianModal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#050505'
  },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 13, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 3 },
  saveBtn: { color: '#00A3FF', fontWeight: '900', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1.5 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', marginTop: 48, marginBottom: 48 },
  avatarWrapper: { position: 'relative' },
  avatarCircle: {
    width: 112, height: 112, borderRadius: 40, backgroundColor: '#121214',
    overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center'
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarEditBtn: {
    position: 'absolute', bottom: -8, right: -8,
    backgroundColor: '#00A3FF', width: 40, height: 40,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#050505'
  },
  card: {
    backgroundColor: '#121214', padding: 32, borderRadius: 40,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32
  },
  cardSectionLabel: {
    fontSize: 11, fontWeight: '900', color: '#475569',
    textTransform: 'uppercase', letterSpacing: 3, marginBottom: 28
  },
  inputLabel: {
    fontSize: 10, fontWeight: '700', color: '#475569',
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, marginLeft: 4
  },
  input: {
    backgroundColor: '#050505', padding: 18, borderRadius: 16, marginBottom: 24,
    color: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', fontSize: 15
  },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
  saveAllBtn: {
    backgroundColor: '#00A3FF', paddingVertical: 20, marginBottom: 40,
    borderRadius: 28, alignItems: 'center'
  },
  saveAllText: { color: '#FFFFFF', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 14 },
  modalForm: { width: '100%', marginTop: 20 },
  modalInputLabel: { color: '#00A3FF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  modalInput: { backgroundColor: '#050505', borderRadius: 16, padding: 16, color: 'white', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 20 }
});
