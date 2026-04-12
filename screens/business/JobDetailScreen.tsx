import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const JobDetailScreen = ({ route, navigation }: any) => {
  const { job } = route.params || {};
  
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
    <View className="flex-row items-center mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
      <View className={`w-12 h-12 rounded-2xl items-center justify-center ${color}`}>
        <Ionicons name={icon} size={22} color="white" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</Text>
        <Text className="text-slate-900 dark:text-white font-bold text-base">{value || 'No especificado'}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full">
            <Ionicons name="arrow-back" size={20} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-black text-slate-900 dark:text-white">Detalle de Vacante</Text>
          <TouchableOpacity className="w-10 h-10 items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full">
            <Ionicons name="create-outline" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Main Info Card */}
          <View className="p-6 bg-blue-600 mb-8 rounded-b-[50px] shadow-xl shadow-blue-200">
            <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-3">
              <Text className="text-white text-[10px] font-black uppercase">Activa</Text>
            </View>
            <Text className="text-white text-3xl font-black mb-1">{job.title}</Text>
            <Text className="text-blue-100 text-sm font-medium opacity-80">{job.location}</Text>
            
            <View className="flex-row mt-6 pt-6 border-t border-white/20">
              <View className="flex-row items-center bg-white/10 px-4 py-2 rounded-2xl">
                <Ionicons name="people" size={16} color="white" />
                <Text className="text-white font-bold text-xs ml-2">12 Postulados</Text>
              </View>
            </View>
          </View>

          <View className="px-6">
            <DetailSection icon="cash" label="Presupuesto / Salario" value={job.salary} color="bg-green-500" />
            <DetailSection icon="briefcase" label="Tipo de Contrato" value={job.type || 'Término Indefinido'} color="bg-purple-500" />
            <DetailSection icon="home" label="Modalidad" value={job.modality || 'Presencial'} color="bg-orange-500" />

            <View className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-[35px] border border-slate-100 dark:border-slate-800">
              <Text className="text-slate-900 dark:text-white font-black text-lg mb-4">Descripción del Cargo</Text>
              <Text className="text-slate-500 dark:text-slate-400 leading-6 text-sm">
                {job.description || 'Estamos buscando a un profesional proactivo con excelente actitud para unirse a nuestro equipo líder en el sector. Experiencia demostrable y ganas de crecer.'}
              </Text>
            </View>

            <View className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-[35px] border border-slate-100 dark:border-slate-800">
              <Text className="text-slate-900 dark:text-white font-black text-lg mb-4">Requisitos</Text>
              <View className="flex-row items-start mb-2">
                <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                <Text className="text-slate-500 dark:text-slate-400 text-xs ml-2 flex-1">Mínimo 2 años de experiencia relacionada.</Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                <Text className="text-slate-500 dark:text-slate-400 text-xs ml-2 flex-1">Proactividad y trabajo en equipo.</Text>
              </View>
            </View>

            <TouchableOpacity className="bg-red-50 dark:bg-red-900/10 p-5 rounded-[30px] items-center mb-10 border border-red-100 dark:border-red-900/20">
              <Text className="text-red-500 font-bold">Cerrar esta vacante</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
