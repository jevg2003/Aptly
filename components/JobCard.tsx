import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface JobData {
  id: string;
  title: string;
  company: string;
  companyDescription?: string;
  location: string;
  salary: string;
  type: string; 
  modality: string; 
  postedAt: string;
  logoColor?: string;
  imageUrl?: string;
  tags?: string[];
}

interface JobCardProps {
  job: JobData;
  onPress?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const initial = job.company.charAt(0).toUpperCase();
  const defaultImage = 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80';

  return (
    <View className="flex-1 w-full bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
      
      {/* Imagen de Portada */}
      <View className="h-[55%] w-full relative">
        <Image 
          source={{ uri: job.imageUrl || defaultImage }} 
          className="w-full h-full absolute" 
          resizeMode="cover"
        />
        
        {/* Sombreado simulando Gradiente */}
        <View className="absolute bottom-0 left-0 right-0 h-32 bg-black/40 justify-end p-5" />

        <View className="absolute bottom-5 left-5 flex-row items-center">
            {/* Logo */}
            <View className="w-12 h-12 rounded-full items-center justify-center bg-white mr-3 shadow-md">
                <Ionicons name="cube-outline" size={24} color="#2563eb" />
            </View>
            <View>
                <Text className="text-white font-bold text-xl">{job.company}</Text>
                <Text className="text-slate-200 text-sm font-medium">{job.companyDescription || 'Empresa destacada'}</Text>
            </View>
        </View>

        {/* Badge Flotante "NEW MATCH" */}
        <View className="absolute top-6 left-6 bg-white/30 px-4 py-1.5 rounded-full border border-white/40">
           <Text className="text-white text-xs font-bold tracking-widest">NEW MATCH</Text>
        </View>
      </View>

      {/* Contenido Blanco Inferior */}
      <View className="flex-1 p-6 bg-white dark:bg-slate-900">
          
          <View className="flex-row justify-between items-center mb-1">
             <Text className="text-2xl font-black text-slate-800 dark:text-white flex-1 mr-2" numberOfLines={1}>
                {job.title}
             </Text>
             <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                 <Text className="text-slate-600 dark:text-slate-300 text-xs font-bold">{job.type}</Text>
             </View>
          </View>

          <View className="flex-row items-center mb-4">
              <Ionicons name="location-outline" size={16} color="#64748b" />
              <Text className="text-slate-500 dark:text-slate-400 font-medium ml-1 text-sm">
                 {job.location} ({job.modality})
              </Text>
          </View>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 mb-6">
             {(job.tags || ['Figma', 'Prototyping', 'User Research']).map((tag, index) => (
                 <View key={index} className="border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5">
                     <Text className="text-slate-600 dark:text-slate-400 text-xs font-medium">{tag}</Text>
                 </View>
             ))}
          </View>

          {/* Salario */}
          <View className="mt-auto mb-10">
             <Text className="text-3xl font-black text-blue-800 dark:text-blue-400">
                {job.salary} <Text className="text-base font-medium text-slate-400 dark:text-slate-500">/ mes</Text>
             </Text>
          </View>

      </View>
    </View>
  );
};
