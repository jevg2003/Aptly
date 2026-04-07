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
import { SessionContext } from '../../navigation/AppNavigator';

export const EditProfileScreen = ({ navigation, route }: any) => {
  const session = React.useContext(SessionContext);
  const initialProfile = route.params?.profile || {};
  
  // Profile State
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [title, setTitle] = useState(initialProfile.professional_title || '');
  const [location, setLocation] = useState(initialProfile.location || '');
  const [bio, setBio] = useState(initialProfile.bio || '');
  
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
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-900 bg-white dark:bg-slate-950">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#0f172a" className="dark:text-white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900 dark:text-white">Editar Perfil</Text>
        <TouchableOpacity onPress={handleSaveProfile} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#2563eb" /> : <Text className="text-blue-600 font-bold">Guardar</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View className="items-center mt-8 mb-10">
            <View className="relative">
              <View className="w-28 h-28 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden border-2 border-slate-50 dark:border-slate-800">
                {initialProfile?.avatar_url ? (
                  <Image source={{ uri: initialProfile.avatar_url }} className="w-full h-full" />
                ) : (
                  <MaterialCommunityIcons name="account" size={60} color="#cbd5e1" className="self-center mt-4" />
                )}
              </View>
              <TouchableOpacity className="absolute bottom-0 right-0 bg-blue-600 w-9 h-9 rounded-full items-center justify-center border-4 border-white dark:border-slate-950">
                 <Feather name="edit-2" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Professional Info */}
          <View className="bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-[40px] border border-slate-100 dark:border-slate-900 mb-8">
            <Text className="text-base font-bold text-slate-800 dark:text-white mb-6">Información Profesional</Text>

            <Text className="text-[11px] text-slate-400 font-bold uppercase mb-2">Nombre Completo</Text>
            <TextInput value={fullName} onChangeText={setFullName} className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700" />

            <Text className="text-[11px] text-slate-400 font-bold uppercase mb-2">Título Profesional</Text>
            <TextInput value={title} onChangeText={setTitle} className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700" />

            <Text className="text-[11px] text-slate-400 font-bold uppercase mb-2">Ubicación</Text>
            <TextInput value={location} onChangeText={setLocation} className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700" />

            <Text className="text-[11px] text-slate-400 font-bold uppercase mb-2">Resumen / Bio</Text>
            <TextInput value={bio} onChangeText={setBio} multiline numberOfLines={3} className="bg-white dark:bg-slate-800 p-4 rounded-2xl text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 min-h-[80px]" />
          </View>

          {/* Experiences Section */}
          <View className="mb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-base font-bold text-slate-800 dark:text-white">Experiencia</Text>
              <TouchableOpacity 
                onPress={() => setIsAddingExp(!isAddingExp)}
                className="bg-blue-600 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-bold text-xs">{isAddingExp ? "Cerrar" : "+ Añadir"}</Text>
              </TouchableOpacity>
            </View>

            {isAddingExp && (
              <View className="bg-blue-50/50 dark:bg-slate-900/50 p-5 rounded-3xl mb-6 border border-blue-100 dark:border-slate-800">
                <TextInput placeholder="Cargo (ej. Designer)" value={newExp.title} onChangeText={t => setNewExp({...newExp, title: t})} className="bg-white dark:bg-slate-800 p-3 rounded-xl mb-3 text-sm" />
                <TextInput placeholder="Empresa" value={newExp.company} onChangeText={t => setNewExp({...newExp, company: t})} className="bg-white dark:bg-slate-800 p-3 rounded-xl mb-3 text-sm" />
                <TouchableOpacity onPress={handleAddExperience} className="bg-blue-600 py-3 rounded-xl items-center">
                  <Text className="text-white font-bold">Guardar Experiencia</Text>
                </TouchableOpacity>
              </View>
            )}

            {fetchingExp ? (
              <ActivityIndicator color="#3b82f6" />
            ) : experiences.length > 0 ? (
              experiences.map((exp) => (
                <View key={exp.id} className="flex-row items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-800">
                  <View>
                    <Text className="font-bold text-slate-800 dark:text-white">{exp.title}</Text>
                    <Text className="text-xs text-blue-600">{exp.company}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteExperience(exp.id)}>
                    <Feather name="trash-2" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="text-slate-400 text-center italic text-xs">No hay experiencias registradas.</Text>
            )}
          </View>

          <TouchableOpacity onPress={handleSaveProfile} disabled={loading} className="bg-blue-600 py-4 mb-20 rounded-3xl items-center shadow-lg">
            <Text className="text-white font-bold text-base">{loading ? "Guardando..." : "Guardar Todo"}</Text>
          </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
