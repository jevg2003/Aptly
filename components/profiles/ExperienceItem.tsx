import React from 'react';
import { View, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  logoUrl?: string;
  tags?: string[];
}

interface ExperienceItemProps {
  experience: Experience;
}

export const ExperienceItem = ({ experience }: ExperienceItemProps) => {
  const { title, company, startDate, endDate, isCurrent, tags, logoUrl } = experience;
  
  return (
    <View className="flex-row bg-white dark:bg-slate-900 rounded-3xl p-4 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm">
      <View className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 items-center justify-center mr-4 overflow-hidden">
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} className="w-full h-full" resizeMode="contain" />
        ) : (
          <MaterialCommunityIcons name="office-building" size={24} color="#94a3b8" />
        )}
      </View>
      
      <View className="flex-1">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-base font-bold text-slate-900 dark:text-white">{title}</Text>
            <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{company}</Text>
          </View>
          <MaterialCommunityIcons name="drag" size={20} color="#cbd5e1" />
        </View>
        
        <Text className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-medium">
          {startDate} - {isCurrent ? 'Presente' : endDate}
        </Text>
        
        {tags && tags.length > 0 && (
          <View className="flex-row flex-wrap mt-3 gap-2">
            {tags.map((tag, idx) => (
              <View key={idx} className="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
