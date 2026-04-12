import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export const BusinessHomeScreen = () => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4 flex-row justify-between items-center bg-white dark:bg-slate-900 shadow-sm">
          <View>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">Panel Empresa</Text>
            <Text className="text-slate-500 dark:text-slate-400">Gestiona tus vacantes</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSignOut}
            className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6">
          <View className="bg-blue-600 rounded-3xl p-6 mb-6 shadow-lg shadow-blue-200">
            <Text className="text-blue-100 text-sm font-semibold uppercase tracking-widest mb-1">Resumen Mensual</Text>
            <Text className="text-white text-3xl font-bold mb-4">12 Vacantes Activas</Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-blue-200 text-xs">Postulaciones</Text>
                <Text className="text-white text-xl font-bold">148</Text>
              </View>
              <View>
                <Text className="text-blue-200 text-xs">Entrevistas</Text>
                <Text className="text-white text-xl font-bold">12</Text>
              </View>
              <View>
                <Text className="text-blue-200 text-xs">Contratados</Text>
                <Text className="text-white text-xl font-bold">4</Text>
              </View>
            </View>
          </View>

          <Text className="text-lg font-bold text-slate-800 dark:text-white mb-4">Acciones rápidas</Text>
          
          <View className="flex-row flex-wrap gap-4">
            <TouchableOpacity className="w-[47%] bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <View className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl items-center justify-center mb-3">
                <Ionicons name="add-circle" size={24} color="#22c55e" />
              </View>
              <Text className="font-bold text-slate-800 dark:text-white">Nueva Vacante</Text>
              <Text className="text-[10px] text-slate-500">Publica un empleo</Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-[47%] bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <View className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl items-center justify-center mb-3">
                <Ionicons name="people" size={24} color="#a855f7" />
              </View>
              <Text className="font-bold text-slate-800 dark:text-white">Candidatos</Text>
              <Text className="text-[10px] text-slate-500">Ver postulaciones</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
            <Text className="text-center text-slate-400 italic">
              Pronto podrás ver analíticas detalladas de tus publicaciones aquí.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
