import React, { useState, useMemo } from 'react';
import { View, Text, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { mockApplications, Application, AppFilterParam } from './mockData';
import { ApplicationCard } from '../../components/applications/ApplicationCard';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { useFocusEffect } from '@react-navigation/native';

import { ObsidianHeader } from '../../components/ObsidianHeader';
import { ObsidianSwitcher } from '../../components/ObsidianSwitcher';

export const ApplicationsScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const [activeFilter, setActiveFilter] = useState<AppFilterParam>('Todas');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'candidate' | 'company'>('candidate');

  const fetchApplications = React.useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      // Saber el rol actual primero
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      const role = profile?.role || 'candidate';
      setUserRole(role);

      // Traer postulaciones (RLS automatically filters by candidate or company)
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id, 
          status,
          created_at,
          candidate_id,
          candidate_profile:profiles!applications_candidate_id_fkey(full_name, avatar_url),
          jobs (
            id,
            title,
            company_id,
            company_profile:profiles!jobs_company_id_fkey(full_name, avatar_url)
          )
        `);
        
      if (error) throw error;

      // Map to UI model
      const mapped: Application[] = (data || []).map(app => {
        const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
        const compProf = job?.company_profile ? (Array.isArray(job.company_profile) ? job.company_profile[0] : job.company_profile) : null;
        const candProf = app.candidate_profile ? (Array.isArray(app.candidate_profile) ? app.candidate_profile[0] : app.candidate_profile) : null;
        
        let statusString = 'Recibida';
        if (app.status === 'pending') statusString = 'Recibida';
        if (app.status === 'reviewed') statusString = 'En revisión';
        if (app.status === 'interview') statusString = 'Entrevista';
        if (app.status === 'rejected') statusString = 'Rechazado';
        if (app.status === 'accepted') statusString = 'Aceptado';
        
        // Timeline estandarizado para pruebas UI
        const baseTimeline = [
            { id: 't1', title: 'Aplicación recibida', date: new Date(app.created_at).toLocaleDateString(), completed: true },
            { id: 't2', title: 'En revisión', date: 'Pendiente', completed: app.status !== 'pending' },
            { id: 't3', title: 'Entrevista', date: 'Pendiente', completed: app.status === 'interview' || app.status === 'accepted' },
            { id: 't4', title: 'Decisión final', date: 'Pendiente', completed: app.status === 'rejected' || app.status === 'accepted' }
        ];

        return {
          id: app.id,
          jobId: job?.id || '',
          jobTitle: job?.title || 'Vacante',
          companyId: role === 'company' ? app.candidate_id : (job?.company_id || ''), 
          companyName: role === 'company' ? (candProf?.full_name || 'Candidato') : (compProf?.full_name || 'Empresa'),
          logoUri: role === 'company' ? candProf?.avatar_url : compProf?.avatar_url,
          status: statusString,
          appliedDate: new Date(app.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          timeline: baseTimeline
        } as Application;
      });

      setApplications(mapped);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchApplications();
    }, [fetchApplications])
  );

  const filteredApplications = useMemo(() => {
    if (activeFilter === 'Todas') return applications;
    if (activeFilter === 'Activas') {
      return applications.filter(app => 
         app.status === 'En revisión' || app.status === 'Entrevista' || app.status === 'Recibida'
      );
    }
    if (activeFilter === 'Finalizadas') return applications.filter(app => app.status === 'Finalizado' || app.status === 'Rechazado' || app.status === 'Aceptado');
    return applications;
  }, [activeFilter, applications]);

  const handleCardPress = (application: Application) => {
    navigation.navigate('ApplicationStatus', { application, userRole });
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
