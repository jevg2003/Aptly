import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';

const MOCK_BUSINESS_JOBS = [
  {
    id: 'm1',
    title: 'Desarrollador React Native',
    location: 'Medellín, Colombia',
    salary: '$5.0M - $7.0M COP',
    modality: 'Híbrido',
    created_at: new Date().toISOString(),
    postulaciones: 12
  },
  {
    id: 'm2',
    title: 'Diseñador UI/UX Senior',
    location: 'Bogotá, Colombia (Remoto)',
    salary: '$4.5M - $5.5M COP',
    modality: 'Remoto',
    created_at: new Date().toISOString(),
    postulaciones: 8
  }
];

export const BusinessVacantesScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const [jobs, setJobs] = useState<any[]>(MOCK_BUSINESS_JOBS); // Iniciamos con mock data
  const [loading, setLoading] = useState(false);

  const fetchJobs = React.useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Usando datos de prueba (Supabase no configurado)');
        setJobs(MOCK_BUSINESS_JOBS);
      } else if (data && data.length > 0) {
        setJobs(data);
      } else {
        setJobs(MOCK_BUSINESS_JOBS);
      }
    } catch (err) {
      setJobs(MOCK_BUSINESS_JOBS);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useFocusEffect(
    React.useCallback(() => {
      fetchJobs();
    }, [fetchJobs])
  );

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('JobDetail', { job: item })}
      className="bg-white dark:bg-slate-900 mx-6 mb-4 p-5 rounded-[30px] shadow-sm border border-slate-100 dark:border-slate-800"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900 dark:text-white mb-1">{item.title}</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{item.location}</Text>
        </View>
        <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
          <Text className="text-green-600 dark:text-green-400 text-[10px] font-bold">ACTIVA</Text>
        </View>
      </View>
      <View className="flex-row items-center mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
        <View className="flex-row items-center mr-4">
          <Ionicons name="people-outline" size={14} color="#64748b" />
          <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1">{item.postulaciones || 0} Postulaciones</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="cash-outline" size={14} color="#64748b" />
          <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1">{item.salary}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-white dark:bg-slate-900 shadow-sm">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Mis Vacantes</Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#3b82f6" />
          </View>
        ) : jobs.length > 0 ? (
          <FlatList
            data={jobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 24, paddingBottom: 100 }}
            onRefresh={fetchJobs}
            refreshing={loading}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-10">
            <View className="w-20 h-20 bg-blue-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
              <Ionicons name="briefcase-outline" size={40} color="#3b82f6" />
            </View>
            <Text className="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">No tienes vacantes aún</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-center mb-8">Empieza publicando tu primera oferta de empleo para atraer talento.</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateVacante')}
              className="bg-blue-600 px-8 py-4 rounded-2xl shadow-lg shadow-blue-200"
            >
              <Text className="text-white font-bold">Publicar Vacante</Text>
            </TouchableOpacity>
          </View>
        )}

      </SafeAreaView>

      {/* Floating Action Button (FAB) moved outside SafeArea for true floating */}
      {!loading && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('CreateVacante')}
          activeOpacity={0.8}
          className="absolute bottom-28 right-6 w-16 h-16 rounded-full bg-blue-600 items-center justify-center shadow-xl shadow-blue-400 z-50"
          style={{ elevation: 15 }}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};
