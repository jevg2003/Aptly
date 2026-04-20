import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { pickAndOptimizeImage } from '../../lib/imageUtils';
import { uploadAvatar } from '../../lib/storageUtils';

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
  const [newExp, setNewExp] = useState({ title: '', company: '', startDate: '' });
  
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
      Alert.alert('¡Éxito!', 'Perfil actualizado correctamente.');
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

    try {
      const { data, error } = await supabase
        .from('experiences')
        .insert({
          profile_id: session?.user?.id,
          title: newExp.title,
          company: newExp.company,
          start_date: newExp.startDate || null,
        })
        .select();

      if (error) throw error;
      
      setExperiences([data[0], ...experiences]);
      setNewExp({ title: '', company: '', startDate: '' });
      setIsAddingExp(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
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
    <SafeAreaView className="flex-1 bg-[#050505]">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5 bg-[#050505]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-sm font-black text-white uppercase tracking-widest">Editar Perfil</Text>
        <TouchableOpacity onPress={handleSaveProfile} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#00A3FF" /> : <Text className="text-[#00A3FF] font-black uppercase text-xs tracking-wider">Guardar</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View className="items-center mt-12 mb-12">
            <View className="relative">
              <View className="w-28 h-28 rounded-[40px] bg-[#121214] overflow-hidden border border-white/5 items-center justify-center">
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                ) : (
                  <MaterialCommunityIcons name="account" size={50} color="#334155" />
                )}
              </View>
              <TouchableOpacity onPress={handleImageUpload} disabled={uploadingImage} className="absolute -bottom-2 -right-2 bg-[#00A3FF] w-10 h-10 rounded-full items-center justify-center border-4 border-[#050505]">
                 {uploadingImage ? <ActivityIndicator size="small" color="white" /> : <Feather name="edit-2" size={14} color="white" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Professional Info */}
          <View className="bg-[#121214] p-8 rounded-[40px] border border-white/5 mb-8">
            <Text className="text-xs font-black text-slate-500 uppercase tracking-[3px] mb-8">Información Profesional</Text>

            <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 ml-1">Nombre Completo</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholderTextColor="#334155" className="bg-[#050505] p-5 rounded-2xl mb-6 text-white border border-white/5" />

            <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 ml-1">Título Profesional</Text>
            <TextInput value={title} onChangeText={setTitle} placeholderTextColor="#334155" className="bg-[#050505] p-5 rounded-2xl mb-6 text-white border border-white/5" />

            <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 ml-1">Ubicación</Text>
            <TextInput value={location} onChangeText={setLocation} placeholderTextColor="#334155" className="bg-[#050505] p-5 rounded-2xl mb-6 text-white border border-white/5" />

            <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 ml-1">Resumen / Bio</Text>
            <TextInput value={bio} onChangeText={setBio} multiline numberOfLines={3} placeholderTextColor="#334155" className="bg-[#050505] p-5 rounded-2xl text-white border border-white/5 min-h-[100px]" />
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

            {isAddingExp && (
              <View className="bg-[#121214] p-6 rounded-[32px] mb-8 border border-[#00A3FF]/30">
                <TextInput placeholder="Cargo (ej. Designer)" placeholderTextColor="#475569" value={newExp.title} onChangeText={t => setNewExp({...newExp, title: t})} className="bg-[#050505] p-4 rounded-xl mb-4 text-white text-sm border border-white/5" />
                <TextInput placeholder="Empresa" placeholderTextColor="#475569" value={newExp.company} onChangeText={t => setNewExp({...newExp, company: t})} className="bg-[#050505] p-4 rounded-xl mb-6 text-white text-sm border border-white/5" />
                <TouchableOpacity onPress={handleAddExperience} className="bg-[#00A3FF] py-4 rounded-xl items-center shadow-[0_4px_20px_rgba(0,163,255,0.3)]">
                  <Text className="text-white font-black uppercase tracking-widest text-xs">Guardar Experiencia</Text>
                </TouchableOpacity>
              </View>
            )}

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

          <TouchableOpacity onPress={handleSaveProfile} disabled={loading} className="bg-[#00A3FF] py-5 mb-24 rounded-[28px] items-center shadow-[0_10px_40px_rgba(0,163,255,0.4)]">
            <Text className="text-white font-black uppercase tracking-widest text-sm">{loading ? "Guardando..." : "Guardar Todo"}</Text>
          </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
