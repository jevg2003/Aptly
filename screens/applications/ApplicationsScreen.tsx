import React, { useState, useMemo } from 'react';
import { View, Text, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { mockApplications, Application, AppFilterParam } from './mockData';
import { ApplicationCard } from '../../components/applications/ApplicationCard';

import { ObsidianHeader } from '../../components/ObsidianHeader';
import { ObsidianSwitcher } from '../../components/ObsidianSwitcher';

export const ApplicationsScreen = ({ navigation }: any) => {
  const [activeFilter, setActiveFilter] = useState<AppFilterParam>('Todas');

  const filteredApplications = useMemo(() => {
    if (activeFilter === 'Todas') return mockApplications;
    if (activeFilter === 'Activas') {
      return mockApplications.filter(app => 
         app.status === 'En revisión' || app.status === 'Entrevista' || app.status === 'Recibida'
      );
    }
    if (activeFilter === 'Finalizadas') return mockApplications.filter(app => app.status === 'Finalizado');
    return mockApplications;
  }, [activeFilter]);

  const handleCardPress = (application: Application) => {
    navigation.navigate('ApplicationStatus', { application });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      
      <ObsidianHeader 
        title="Mis Postulaciones" 
        subtitle="Tracking"
      />

      <ObsidianSwitcher 
        options={['Todas', 'Activas', 'Finalizadas']}
        activeOption={activeFilter}
        onOptionChange={(opt) => setActiveFilter(opt as AppFilterParam)}
      />

      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ApplicationCard application={item} onPress={() => handleCardPress(item)} />
        )}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
             <Feather name="folder-minus" size={50} color="rgba(255,255,255,0.1)" />
             <Text style={{ color: '#475569', marginTop: 15, textAlign: 'center', paddingHorizontal: 40 }}>
                No tienes postulaciones en esta categoría.
             </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
