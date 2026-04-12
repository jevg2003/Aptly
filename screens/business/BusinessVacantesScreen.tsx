import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';

export const BusinessVacantesScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
      } else {
        setJobs(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [session]);

  const renderJobItem = ({ item }: { item: any }) => (
    <View className="bg-white dark:bg-slate-900 mx-6 mb-4 p-5 rounded-[30px] shadow-sm border border-slate-100 dark:border-slate-800">
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
          <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1">12 Postulaciones</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="cash-outline" size={14} color="#64748b" />
          <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1">{item.salary}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-white dark:bg-slate-900 shadow-sm">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Mis Vacantes</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('CreateVacante')}
            className="w-10 h-10 rounded-2xl bg-blue-600 items-center justify-center shadow-lg shadow-blue-200"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
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
            contentContainerStyle={{ paddingVertical: 24 }}
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
    </View>
  );
};
