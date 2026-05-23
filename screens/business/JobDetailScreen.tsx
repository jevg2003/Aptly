import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useBusinessChat } from '../../lib/BusinessChatContext';

export const JobDetailScreen = ({ route, navigation }: any) => {
  const { job } = route.params || {};
  const [applications, setApplications] = useState<any[]>([]);
  const { conversations } = useBusinessChat();

  const [currentJob, setCurrentJob] = useState(job);

  const fetchJobDetails = async () => {
    if (!job?.id) return;
    const { data, error } = await supabase.from('jobs').select('*').eq('id', job.id).single();

    if (data && !error) {
      setCurrentJob(data);
    }
  };

  useEffect(() => {
    if (job?.id) {
      fetchJobDetails();
      supabase
        .from('applications')
        .select('id, status, profiles!applications_candidate_id_fkey(full_name, avatar_url)')
        .eq('job_id', job.id)
        .then(({ data }) => setApplications(data || []));
    }
  }, [job?.id]);

  const handleCloseVacancy = () => {
    Alert.alert(
      'Confirmar Cierre',
      '¿Estás seguro de que deseas cerrar esta vacante? Ya no será visible para nuevos candidatos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Vacante',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('jobs')
              .update({ status: 'closed' })
              .eq('id', job.id);

            if (error) {
              Alert.alert('Error', 'No se pudo cerrar la vacante: ' + error.message);
            } else {
              Alert.alert('Éxito', 'La vacante ha sido cerrada.');
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleCandidateChat = (app: any) => {
    // Buscar la conversación que corresponda a esta aplicación
    const conversation = conversations.find((c) => c.applicationId === app.id);

    if (conversation) {
      // Usar navegación anidada para saltar al Tab de Chat
      navigation.navigate('Chat', {
        screen: 'BusinessChatDetail',
        params: { conversation },
      });
    } else if (app.status === 'interview') {
      Alert.alert(
        'Chat no iniciado',
        'Estamos sincronizando la sala de chat. Intenta de nuevo en unos segundos.'
      );
    } else {
      Alert.alert(
        'Sin Chat',
        'Debes preseleccionar (dar match) a este candidato primero para habilitar el chat.'
      );
    }
  };

  if (!currentJob) {
    // ... error UI
  }

  const DetailSection = ({ icon, label, value, color }: any) => (
    <View className="mb-6 flex-row items-center rounded-3xl border border-[#1e1e1e] bg-[#121214] p-4">
      <View className={`h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
        <Ionicons name={icon} size={22} color="white" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </Text>
        <Text className="text-base font-bold text-white">{value || 'No especificado'}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#050505]">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-[#1e1e1e] px-6 py-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1c]">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-black text-white">Detalle de Vacante</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateVacante', { job: currentJob })}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1c]">
            <Ionicons name="create-outline" size={20} color="#FF005C" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Main Info Card */}
          <View className="mb-8 rounded-b-[40px] border-b border-[#1e1e1e] bg-[#121214] p-6 shadow-lg shadow-black/50">
            <View className="mb-3 self-start rounded-full bg-white/20 px-3 py-1">
              <Text className="text-[10px] font-black uppercase text-white">
                {currentJob.status === 'active' ? 'Activa' : 'Cerrada'}
              </Text>
            </View>
            <Text className="mb-1 text-3xl font-black text-white">{currentJob.title}</Text>
            <Text className="text-sm font-medium text-[#FF005C] opacity-80">
              {currentJob.location}
            </Text>

            <View className="mt-6 flex-row border-t border-[#1e1e1e] pt-6">
              <View className="flex-row items-center rounded-2xl bg-[#1A1A1C] px-4 py-2">
                <Ionicons name="people" size={16} color="#FF005C" />
                <Text className="ml-2 text-xs font-bold text-white">
                  {applications.length} Postulados
                </Text>
              </View>
            </View>
          </View>

          <View className="px-6">
            <DetailSection
              icon="cash"
              label="Presupuesto / Salario"
              value={currentJob.salary}
              color="bg-green-500"
            />
            <DetailSection
              icon="briefcase"
              label="Tipo de Contrato"
              value={currentJob.type || 'Término Indefinido'}
              color="bg-purple-500"
            />
            <DetailSection
              icon="home"
              label="Modalidad"
              value={currentJob.modality || 'Presencial'}
              color="bg-orange-500"
            />

            <View className="mb-8 rounded-[35px] border border-[#1e1e1e] bg-[#121214] p-6">
              <Text className="mb-4 text-lg font-black text-white">Descripción del Cargo</Text>
              <Text className="text-sm leading-6 text-slate-400">
                {currentJob.description || 'Sin descripción disponible.'}
              </Text>
            </View>

            <View className="mb-8 rounded-[35px] border border-[#1e1e1e] bg-[#121214] p-6">
              <Text className="mb-4 text-lg font-black text-white">Requisitos</Text>
              {currentJob.requirements &&
              Array.isArray(currentJob.requirements) &&
              currentJob.requirements.length > 0 ? (
                currentJob.requirements.map((req: string, index: number) => (
                  <View key={index} className="mb-3 flex-row items-start">
                    <Ionicons name="checkmark-circle" size={18} color="#FF005C" />
                    <Text className="ml-2 flex-1 text-sm text-slate-400">{req}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-xs italic text-slate-500">
                  No hay requisitos específicos listados.
                </Text>
              )}
            </View>

            {currentJob.tags && currentJob.tags.length > 0 && (
              <View className="mb-8 flex-row flex-wrap gap-2">
                {currentJob.tags.map((tag: string, index: number) => (
                  <View
                    key={index}
                    className="rounded-full border border-[#FF005C]/30 bg-[#1A1A1C] px-4 py-2">
                    <Text className="text-[10px] font-black uppercase tracking-tight text-[#FF005C]">
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {applications.length > 0 && (
              <View className="mb-8 rounded-[35px] border border-[#1e1e1e] bg-[#121214] p-6">
                <Text className="mb-4 text-lg font-black text-white">Candidatos Aplicados</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {applications.map((app) => {
                    const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
                    return (
                      <TouchableOpacity
                        key={app.id}
                        className="mr-4 items-center"
                        onPress={() => handleCandidateChat(app)}
                        activeOpacity={0.7}>
                        <View className="mb-2 h-14 w-14 overflow-hidden rounded-full border-2 border-[#1A1A1C] bg-[#2a2a2c]">
                          {profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} className="h-full w-full" />
                          ) : (
                            <View className="h-full w-full items-center justify-center">
                              <Text className="font-bold text-white">
                                {profile?.full_name?.charAt(0) || 'C'}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="w-16 text-center text-xs text-slate-400" numberOfLines={1}>
                          {profile?.full_name?.split(' ')[0] || 'Candidato'}
                        </Text>
                        {app.status === 'interview' && (
                          <View className="absolute right-0 top-0 h-2 w-2 rounded-full bg-green-500" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {currentJob.status === 'active' && (
              <TouchableOpacity
                onPress={handleCloseVacancy}
                className="mb-10 items-center rounded-[30px] border border-[#4d1323] bg-[#2a0d15] p-5">
                <Text className="font-bold text-[#ff3b30]">Cerrar esta vacante</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
