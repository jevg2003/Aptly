import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, FlatList, StatusBar } from 'react-native';
import { FilterTabs, AppFilterParam } from '../../components/applications/FilterTabs';
import { ApplicationCard } from '../../components/applications/ApplicationCard';
import { mockApplications, Application } from './mockData';
import { Feather } from '@expo/vector-icons';

export const ApplicationsScreen = ({ navigation }: any) => {
  const [activeFilter, setActiveFilter] = useState<AppFilterParam>('Todas');

  const filteredApplications = useMemo(() => {
    if (activeFilter === 'Todas') return mockApplications;
    
    if (activeFilter === 'Activas') {
      return mockApplications.filter(app => 
         app.status === 'En revisión' || app.status === 'Entrevista' || app.status === 'Recibida'
      );
    }
    
    if (activeFilter === 'Finalizadas') {
      return mockApplications.filter(app => app.status === 'Finalizado');
    }
    
    return mockApplications;
  }, [activeFilter]);

  const handleCardPress = (application: Application) => {
    navigation.navigate('ApplicationStatus', { application });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View className="px-4 py-4 items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
         <Text className="text-xl font-bold text-slate-800 dark:text-slate-100">Mis Postulaciones</Text>
      </View>

      <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ApplicationCard application={item} onPress={() => handleCardPress(item)} />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-32 px-8">
             <Feather name="folder-minus" size={48} color="#cbd5e1" />
             <Text className="text-slate-500 mt-4 text-center">
               No tienes postulaciones en esta categoría.
             </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
