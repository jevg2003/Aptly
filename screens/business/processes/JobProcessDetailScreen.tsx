import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ObsidianHeader } from '../../../components/ObsidianHeader';
import { ObsidianConfirm } from '../../../components/common/ObsidianConfirm';
import { showToast } from '../../../components/common/ObsidianToast';
import { supabase } from '../../../lib/supabase';

export const JobProcessDetailScreen = ({ route, navigation }: any) => {
  const { job } = route.params;
  const [candidates, setCandidates] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [confirmData, setConfirmData] = React.useState<any>(null);

  const closeVacancyActual = async () => {
    try {
      setConfirmVisible(false);
      setLoading(true);
      // 1. Cerrar el Job
      await supabase.from('jobs').update({ status: 'closed' }).eq('id', job.id);
      
      // 2. Notificar a los candidatos
      const companyName = job.company_name || 'La empresa';
      for (const cand of candidates) {
        const rejectionMsg = `Hola, ${companyName} ha cerrado el proceso para la vacante de ${job.title}. Agradecemos tu participación y te deseo lo mejor en tus futuras búsquedas.`;
        
        // Buscar room
        const { data: room } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('application_id', cand.id)
          .maybeSingle();

        if (room) {
          await supabase.from('messages').insert({
            room_id: room.id,
            content: rejectionMsg,
            sender_id: job.company_id,
            type: 'system',
            is_system: true
          });
        }
      }

      showToast('Vacante cerrada correctamente');
      navigation.goBack();
    } catch (err) {
      console.error('Error closing vacancy:', err);
      showToast('Error al cerrar la vacante', 'error');
    } finally {
      setLoading(false);
    }
  };

  const closeVacancy = () => {
    setConfirmData({
      title: 'CERRAR VACANTE',
      message: '¿Estás seguro de cerrar esta vacante? Se notificará automáticamente a todos los candidatos en proceso.',
      onConfirm: closeVacancyActual,
      type: 'danger'
    });
    setConfirmVisible(true);
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          current_stage,
          profiles!applications_candidate_id_fkey(id, full_name, avatar_url, professional_title),
          chat_rooms(id)
        `)
        .eq('job_id', job.id)
        .eq('status', 'interview');

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error('Error fetching candidates for job process:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCandidates();
  }, [job.id]);

  const renderCandidate = ({ item }: { item: any }) => {
    const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
    
    return (
      <TouchableOpacity 
        style={styles.candidateCard}
        onPress={() => navigation.navigate('CandidatePipeline', { application: item, job })}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' }} 
          style={styles.avatar} 
        />
        <View style={styles.candidateInfo}>
          <Text style={styles.candidateName}>{profile?.full_name || 'Candidato'}</Text>
          <Text style={styles.candidateRole}>{profile?.professional_title || 'Aplicante'}</Text>
          
          <View style={styles.stageIndicator}>
             <View style={styles.pulse} />
             <Text style={styles.stageText}>{item.current_stage || 'Nueva Postulación'}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ObsidianHeader 
          title="Candidatos" 
          subtitle={job.title.toUpperCase()}
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
        />
        
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 }}>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '900', color: 'white', textTransform: 'uppercase', letterSpacing: 1 }}>
            Estado de Aplicación
          </Text>
          <TouchableOpacity onPress={closeVacancy} style={{ padding: 4 }}>
            <Ionicons name="archive-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#FF005C" />
          </View>
        ) : (
          <FlatList
            data={candidates}
            renderItem={renderCandidate}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>No hay candidatos en proceso para esta vacante.</Text>
              </View>
            }
          />
        )}

        <ObsidianConfirm 
          visible={confirmVisible}
          title={confirmData?.title || ''}
          message={confirmData?.message || ''}
          onConfirm={confirmData?.onConfirm || (() => {})}
          onCancel={() => setConfirmVisible(false)}
          type={confirmData?.type}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },
  candidateCard: {
    backgroundColor: '#121214',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  candidateInfo: { flex: 1 },
  candidateName: { color: 'white', fontSize: 16, fontWeight: '900', marginBottom: 2 },
  candidateRole: { color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  stageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  pulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF005C',
    marginRight: 6
  },
  stageText: { color: 'white', fontSize: 10, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 100 },
  emptyText: { color: '#64748b', marginTop: 10, fontSize: 14, textAlign: 'center' }
});
