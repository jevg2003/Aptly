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
  RefreshControl
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../navigation/AppNavigator';
import { StatCard } from '../../components/profiles/StatCard';
import { ExperienceItem, Experience } from '../../components/profiles/ExperienceItem';
import { ResumeSection } from '../../components/profiles/ResumeSection';
import { useFocusEffect } from '@react-navigation/native';

export const ProfileScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);

      // Fetch Experiences
      const { data: expData, error: expError } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', session.user.id)
        .order('start_date', { ascending: false });
      
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

  const handleLogout = async () => {
    Alert.alert(
      "Confirmar",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Cerrar Sesión", 
          style: "destructive", 
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) Alert.alert("Error", error.message);
          } 
        }
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white dark:bg-slate-950 items-center justify-center">
        <Text className="text-slate-500 italic">Cargando perfil...</Text>
      </View>
    );
  }

  const profileCompletePercent = 85; // This could be calculated

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Background */}
        <View className="h-40 bg-blue-50/50 dark:bg-slate-900 absolute top-0 left-0 right-0" />
        
        {/* Profile Card Section */}
        <View className="pt-12 px-6 items-center">
          <View className="relative">
            <View className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-white">
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
              ) : (
                <MaterialCommunityIcons name="account" size={80} color="#cbd5e1" className="self-center mt-4" />
              )}
            </View>
            <TouchableOpacity className="absolute bottom-1 right-1 bg-green-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
               <MaterialCommunityIcons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-2xl font-bold text-slate-800 dark:text-white mt-4">
            {profile?.full_name || 'Sin nombre'}
          </Text>
          <Text className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
            {profile?.professional_title || 'Añadir título profesional'}
          </Text>
          
          {profile?.location && (
            <View className="flex-row items-center mt-1">
              <MaterialCommunityIcons name="map-marker-outline" size={14} color="#94a3b8" />
              <Text className="text-slate-400 dark:text-slate-500 text-xs ml-1">
                {profile.location}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            onPress={() => navigation.navigate('EditProfile', { profile })}
            className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-8 py-3 rounded-2xl flex-row items-center shadow-sm"
          >
            <Feather name="edit-3" size={18} color="#2563eb" />
            <Text className="text-blue-600 font-bold ml-2">Editar Info</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row px-6 mt-8 gap-4">
            <StatCard label="Profile Complete" value={`${profileCompletePercent}%`} sublabel="Añadir experiencia" />
            <StatCard label="Applications" value="12" />
            <StatCard label="Profile Views" value="34" />
        </View>

        {/* Experience Section */}
        <View className="px-6 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">Mi Experiencia</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-bold text-xs">Ver Todo</Text>
            </TouchableOpacity>
          </View>
          
          {experiences.length > 0 ? (
            experiences.map(exp => (
              <ExperienceItem key={exp.id} experience={exp} />
            ))
          ) : (
            <TouchableOpacity 
              className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 items-center justify-center mb-4"
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text className="text-slate-400 text-sm italic">Aún no has añadido experiencias</Text>
              <Text className="text-blue-600 font-bold mt-2">+ Añadir</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Resume Section */}
        <View className="px-6 mt-2">
            <ResumeSection 
              resumeUrl={profile?.resume_url} 
              onUpload={() => navigation.navigate('EditProfile')}
            />
        </View>

        {/* Action Buttons */}
        <View className="px-6 mt-4 pb-12">
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-red-50/50 dark:bg-red-950/20 py-4 rounded-3xl border border-red-100 dark:border-red-900/50"
          >
            <MaterialCommunityIcons name="logout" size={20} color="#ef4444" className="mr-2" />
            <Text className="text-red-500 font-bold ml-2">Cerrar Sesión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="mt-4 items-center">
            <Text className="text-red-200 dark:text-red-900 text-[10px] font-bold uppercase tracking-wider">Eliminar Cuenta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};
