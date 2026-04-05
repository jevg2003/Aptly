import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';

export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string; // e.g., 'Full-time', 'Part-time'
  modality: string; // e.g., 'Remoto', 'Híbrido', 'Presencial'
  postedAt: string;
  logoColor?: string;
}

interface JobCardProps {
  job: JobData;
  onPress?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Usa la primera letra de la compañía para el logo genérico si no hay imagen
  const initial = job.company.charAt(0).toUpperCase();

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-4"
    >
      <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        
        {/* Header con Logo, Título y Compañía */}
        <View className="flex-row items-center mb-4">
          <View 
            className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
            style={{ backgroundColor: job.logoColor || (isDark ? '#1e293b' : '#f1f5f9') }}
          >
            <Text className="text-xl font-bold text-slate-800 dark:text-white">
              {initial}
            </Text>
          </View>
          <View className="flex-1">
            <Text 
              className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1"
              numberOfLines={1}
            >
              {job.title}
            </Text>
            <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {job.company} • {job.location}
            </Text>
          </View>
        </View>

        {/* Tags y Atributos del trabajo */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          <View className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
            <Text className="text-blue-700 dark:text-blue-400 text-xs font-semibold">
              {job.modality}
            </Text>
          </View>
          <View className="bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Text className="text-slate-700 dark:text-slate-300 text-xs font-medium">
              {job.type}
            </Text>
          </View>
          <View className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
            <Text className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              {job.salary}
            </Text>
          </View>
        </View>

        {/* Footer del Card */}
        <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Publicado hace {job.postedAt}
          </Text>
          <Text className="text-primary-light dark:text-primary-light font-bold text-sm">
            Ver detalles →
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
