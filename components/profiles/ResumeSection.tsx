import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ResumeSectionProps {
  resumeUrl?: string;
  updatedAt?: string;
  onUpload?: () => void;
}

export const ResumeSection = ({ resumeUrl, updatedAt, onUpload }: ResumeSectionProps) => {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-slate-900 dark:text-white">CV / Archivos</Text>
      </View>
      
      {resumeUrl ? (
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-4 flex-row items-center border border-slate-100 dark:border-slate-800 shadow-sm">
          <View className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 items-center justify-center mr-4">
            <MaterialCommunityIcons name="file-pdf-box" size={30} color="#ef4444" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-slate-800 dark:text-slate-200" numberOfLines={1}>
              Resume_Profesional.pdf
            </Text>
            <Text className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-medium">
              Actualizado: {updatedAt || 'Recientemente'}
            </Text>
          </View>
          <TouchableOpacity className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl" onPress={onUpload}>
            <MaterialCommunityIcons name="download-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          className="bg-blue-50/50 dark:bg-slate-900/50 border-2 border-dashed border-blue-200 dark:border-slate-800 rounded-3xl p-8 items-center justify-center"
          onPress={onUpload}
        >
          <MaterialCommunityIcons name="cloud-upload-outline" size={36} color="#3b82f6" />
          <Text className="text-blue-600 dark:text-blue-400 font-bold mt-2">Subir CV</Text>
          <Text className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-medium">
            PDF, DOCX hasta 5MB
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
