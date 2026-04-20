import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export const JobDetailScreen = ({ route, navigation }: any) => {
  const { job } = route.params || {};
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
     if (job?.id) {
       supabase.from('applications')
         .select('id, status, profiles!applications_candidate_id_fkey(full_name, avatar_url)')
         .eq('job_id', job.id)
         .then(({ data }) => setApplications(data || []));
     }
  }, [job?.id]);

  console.log('DEBUG: JobDetailScreen received job:', !!job);

  if (!job) {
    console.error('CRITICAL: JobDetailScreen missing job data in route.params');
    return (
      <View className="flex-1 bg-white items-center justify-center p-10">
        <Ionicons name="warning-outline" size={60} color="#f59e0b" />
        <Text className="text-xl font-bold text-slate-900 mt-4 text-center">Error al cargar datos</Text>
        <Text className="text-slate-500 text-center mt-2">No se recibió la información de la vacante.</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="bg-blue-600 px-8 py-3 rounded-xl mt-6"
        >
          <Text className="text-white font-bold">Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const DetailSection = ({ icon, label, value, color }: any) => (
    <View className="flex-row items-center mb-6 bg-[#121214] p-4 rounded-3xl border border-[#1e1e1e]">
      <View className={`w-12 h-12 rounded-2xl items-center justify-center ${color}`}>
        <Ionicons name={icon} size={22} color="white" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</Text>
        <Text className="text-white font-bold text-base">{value || 'No especificado'}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#050505]">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-[#1e1e1e]">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-[#1a1a1c] rounded-full">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-black text-white">Detalle de Vacante</Text>
          <TouchableOpacity className="w-10 h-10 items-center justify-center bg-[#1a1a1c] rounded-full">
            <Ionicons name="create-outline" size={20} color="#FF005C" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Main Info Card */}
          <View className="p-6 bg-[#121214] border-b border-[#1e1e1e] mb-8 rounded-b-[40px] shadow-lg shadow-black/50">
            <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-3">
              <Text className="text-white text-[10px] font-black uppercase">Activa</Text>
            </View>
            <Text className="text-white text-3xl font-black mb-1">{job.title}</Text>
            <Text className="text-[#FF005C] text-sm font-medium opacity-80">{job.location}</Text>
            
            <View className="flex-row mt-6 pt-6 border-t border-[#1e1e1e]">
              <View className="flex-row items-center bg-[#1A1A1C] px-4 py-2 rounded-2xl">
                <Ionicons name="people" size={16} color="#FF005C" />
                <Text className="text-white font-bold text-xs ml-2">{applications.length} Postulados</Text>
              </View>
            </View>
          </View>

          <View className="px-6">
            <DetailSection icon="cash" label="Presupuesto / Salario" value={job.salary} color="bg-green-500" />
            <DetailSection icon="briefcase" label="Tipo de Contrato" value={job.type || 'Término Indefinido'} color="bg-purple-500" />
            <DetailSection icon="home" label="Modalidad" value={job.modality || 'Presencial'} color="bg-orange-500" />

            <View className="mb-8 p-6 bg-[#121214] rounded-[35px] border border-[#1e1e1e]">
              <Text className="text-white font-black text-lg mb-4">Descripción del Cargo</Text>
              <Text className="text-slate-400 leading-6 text-sm">
                {job.description || 'Estamos buscando a un profesional proactivo con excelente actitud para unirse a nuestro equipo líder en el sector. Experiencia demostrable y ganas de crecer.'}
              </Text>
            </View>

            <View className="mb-8 p-6 bg-[#121214] rounded-[35px] border border-[#1e1e1e]">
              <Text className="text-white font-black text-lg mb-4">Requisitos</Text>
              <View className="flex-row items-start mb-2">
                <Ionicons name="checkmark-circle" size={18} color="#FF005C" />
                <Text className="text-slate-400 text-xs ml-2 flex-1">Mínimo 2 años de experiencia relacionada.</Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={18} color="#FF005C" />
                <Text className="text-slate-400 text-xs ml-2 flex-1">Proactividad y trabajo en equipo.</Text>
              </View>
            </View>

            {applications.length > 0 && (
              <View className="mb-8 p-6 bg-[#121214] rounded-[35px] border border-[#1e1e1e]">
                <Text className="text-white font-black text-lg mb-4">Candidatos Aplicados</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                   {applications.map((app) => {
                      const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
                      return (
                        <View key={app.id} className="items-center mr-4">
                           <View className="w-14 h-14 rounded-full border-2 border-[#1A1A1C] overflow-hidden mb-2 bg-[#2a2a2c]">
                              {profile?.avatar_url ? (
                                <Image source={{uri: profile.avatar_url}} className="w-full h-full" />
                              ) : (
                                <View className="w-full h-full justify-center items-center"><Text className="text-white font-bold">{profile?.full_name?.charAt(0) || 'C'}</Text></View>
                              )}
                           </View>
                           <Text className="text-slate-400 text-xs text-center w-16" numberOfLines={1}>{profile?.full_name?.split(' ')[0]}</Text>
                           {app.status === 'interview' && <View className="w-2 h-2 rounded-full bg-green-500 absolute top-0 right-0" />}
                        </View>
                      )
                   })}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity className="bg-[#2a0d15] p-5 rounded-[30px] items-center mb-10 border border-[#4d1323]">
              <Text className="text-[#ff3b30] font-bold">Cerrar esta vacante</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
