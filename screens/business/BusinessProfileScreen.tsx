import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { useFocusEffect } from '@react-navigation/native';

export const BusinessProfileScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const [profile, setProfile] = useState<any>(null);
  const [jobsCount, setJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompanyProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch Profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      // Fetch Jobs Count
      const { count, error: jobsError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', session.user.id);

      if (error && error.code !== 'PGRST116') throw error;
      
      // If no profile in table, use session metadata
      if (data) {
        setProfile(data);
      } else {
        setProfile({
          full_name: session.user.user_metadata?.full_name || 'Mi Empresa',
          role: 'company'
        });
      }

      // Handle jobs count (fallback to mock if error/table missing)
      if (jobsError) {
          // If table doesn't exist, we use a fixed mock count for now 
          // to keep UI consistent with BusinessVacantesScreen.
          setJobsCount(2); 
      } else {
          setJobsCount(count || 0);
      }

    } catch (error: any) {
      console.error('Error fetching company profile:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      fetchCompanyProfile();
    }, [fetchCompanyProfile])
  );

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
             await supabase.auth.signOut();
          } 
        }
      ]
    );
  };

  const StatCard = ({ label, value, icon, color }: any) => (
    <View className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-[30px] items-center shadow-sm shadow-slate-200 border border-slate-50 dark:border-slate-800">
      <Text className="text-xl font-black text-slate-900 dark:text-white">{value}</Text>
      <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase text-center mt-1 leading-3">
        {label}
      </Text>
      {icon && (
          <View className="absolute top-3 right-3">
              <Ionicons name={icon} size={10} color={color || "#94a3b8"} />
          </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-white dark:bg-slate-900 shadow-sm">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Perfil de Empresa</Text>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
             <Ionicons name="settings-outline" size={22} color="#1e293b" className="dark:text-white" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchCompanyProfile} />
          }
        >
          {/* Logo Section */}
          <View className="items-center mt-8 px-6">
            <View className="relative">
              <View className="w-36 h-36 bg-blue-600 rounded-[40px] items-center justify-center shadow-2xl shadow-blue-400">
                 <MaterialCommunityIcons name="office-building" size={60} color="white" />
              </View>
              <TouchableOpacity className="absolute bottom-1 right-1 bg-white dark:bg-slate-800 w-10 h-10 rounded-full items-center justify-center border-4 border-slate-50 dark:border-slate-950 shadow-sm">
                 <Feather name="edit-2" size={16} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-3xl font-black text-slate-900 dark:text-white mt-6 mb-1">
              {profile?.full_name || 'TechFlow Inc.'}
            </Text>
            
            <View className="bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full mb-3">
                 <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">Software & Tecnología</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="location" size={14} color="#3b82f6" />
              <Text className="text-slate-400 dark:text-slate-500 text-sm ml-1 font-medium">San Francisco, CA</Text>
            </View>

            <TouchableOpacity className="mt-8 bg-white dark:bg-slate-900 px-8 py-3.5 rounded-full border border-slate-200 dark:border-slate-800 flex-row items-center shadow-sm">
              <Feather name="edit-3" size={18} color="#1e293b" className="dark:text-white" />
              <Text className="text-slate-800 dark:text-white font-bold ml-2">Editar Información</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Bar */}
          <View className="flex-row px-6 mt-10 gap-3">
             <StatCard label="Vacantes Activas" value={jobsCount.toString()} />
             <StatCard label="Candidatos Proceso" value="85" />
             <StatCard label="Valoración Global" value="4.8" icon="star" color="#f59e0b" />
          </View>

          {/* About Section */}
          <View className="px-6 mt-10">
            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-4">Sobre la Empresa</Text>
            <View className="bg-white dark:bg-slate-900 p-6 rounded-[35px] shadow-sm border border-slate-50 dark:border-slate-800">
               <Text className="text-slate-500 dark:text-slate-400 leading-6 text-[15px]">
                 Somos líderes en innovación tecnológica, dedicados a construir el futuro del software. En TechFlow, valoramos la creatividad y el impacto global. Experimentamos constantemente con nuevas tecnologías para ofrecer soluciones excepcionales a nuestros clientes.
               </Text>
            </View>
          </View>

          {/* Recent Jobs */}
          <View className="px-6 mt-10">
             <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-bold text-slate-900 dark:text-white">Publicaciones Recientes</Text>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-black text-xs uppercase tracking-tighter">Ver Todo</Text>
                </TouchableOpacity>
             </View>

             {/* Job Item 1 */}
             <TouchableOpacity className="bg-white dark:bg-slate-900 p-4 rounded-[28px] flex-row items-center mb-3 shadow-sm border border-slate-50 dark:border-slate-800">
                <View className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl items-center justify-center">
                    <MaterialCommunityIcons name="xml" size={24} color="#64748b" />
                </View>
                <View className="flex-1 ml-4 mr-2">
                   <Text className="text-slate-900 dark:text-white font-bold text-base" numberOfLines={1}>Senior UX Designer</Text>
                   <Text className="text-slate-400 text-xs mt-0.5">TechFlow HQ • Remoto</Text>
                   <View className="flex-row mt-2">
                      <View className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg mr-2">
                          <Text className="text-[10px] text-slate-500 font-bold uppercase">Figma</Text>
                      </View>
                      <View className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          <Text className="text-[10px] text-slate-500 font-bold uppercase">Prototyping</Text>
                      </View>
                   </View>
                </View>
                <Text className="text-[10px] text-slate-300 font-bold absolute top-4 right-4 italic">Hace 2d</Text>
                <View className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center">
                    <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </View>
             </TouchableOpacity>

             {/* Job Item 2 */}
             <TouchableOpacity className="bg-white dark:bg-slate-900 p-4 rounded-[28px] flex-row items-center mb-4 shadow-sm border border-slate-50 dark:border-slate-800">
                <View className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl items-center justify-center">
                    <MaterialCommunityIcons name="google-circles-extended" size={24} color="#10b981" />
                </View>
                <View className="flex-1 ml-4 mr-2">
                   <Text className="text-slate-900 dark:text-white font-bold text-base" numberOfLines={1}>Product Manager</Text>
                   <Text className="text-slate-400 text-xs mt-0.5">TechFlow HQ • Híbrido</Text>
                   <View className="flex-row mt-2">
                      <View className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg mr-2">
                          <Text className="text-[10px] text-slate-500 font-bold uppercase">Agile</Text>
                      </View>
                      <View className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          <Text className="text-[10px] text-slate-500 font-bold uppercase">Strategy</Text>
                      </View>
                   </View>
                </View>
                <Text className="text-[10px] text-slate-300 font-bold absolute top-4 right-4 italic">Hace 5d</Text>
                <View className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center">
                    <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </View>
             </TouchableOpacity>

             {/* Add New CTA */}
             <TouchableOpacity 
                onPress={() => navigation.navigate('CreateVacante')}
                className="w-full py-5 rounded-[28px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex-row items-center justify-center mt-2"
             >
                <Ionicons name="add-circle-outline" size={20} color="#64748b" />
                <Text className="text-slate-500 dark:text-slate-400 font-bold ml-2">Crear Nueva Vacante</Text>
             </TouchableOpacity>
          </View>

          {/* Bottom Actions */}
          <View className="px-8 mt-16 items-center">
            <TouchableOpacity 
              onPress={handleLogout}
              className="w-full bg-red-50 dark:bg-red-950/20 py-5 rounded-[28px] flex-row items-center justify-center border border-red-100 dark:border-red-900/50"
            >
               <Feather name="log-out" size={18} color="#ef4444" />
               <Text className="text-red-500 font-black ml-3">Cerrar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity className="mt-5 pb-10">
               <Text className="text-red-600 dark:text-red-900 text-xs font-bold underline decoration-red-900">Eliminar cuenta de empresa</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
