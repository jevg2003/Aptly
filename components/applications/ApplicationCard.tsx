import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Application } from '../../screens/applications/mockData';

interface ApplicationCardProps {
  application: Application;
  onPress: () => void;
}

export const ApplicationCard = ({ application, onPress }: ApplicationCardProps) => {
  const { companyName, status, statusColor, subtitle, buttonVariant, buttonText, imageUri } = application;
  
  // Decide title color depending on selection
  const titleColor = buttonVariant === 'filled' ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200';
  const subtitleColor = buttonVariant === 'filled' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-blue-500 dark:text-blue-400';

  return (
    <View className="bg-white dark:bg-slate-900 rounded-3xl m-4 p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex-row overflow-hidden">
      <View className="flex-1 pr-4 justify-between min-h-[120px]">
        
        <View>
          <View className="flex-row items-center mb-1">
            <View className={`w-2 h-2 rounded-full mr-2 ${statusColor}`} />
            <Text className="text-slate-500 dark:text-slate-400 text-sm">{status}</Text>
          </View>
          
          <Text className={`text-lg font-bold mt-1 mb-1 ${titleColor}`}>
            {companyName}
          </Text>
          
          <Text className={`text-sm ${subtitleColor} leading-tight`}>
            {subtitle}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={onPress}
          className={`mt-4 py-2 px-4 rounded-xl self-start ${
            buttonVariant === 'filled' 
              ? 'bg-blue-600' 
              : 'bg-indigo-50 dark:bg-slate-800'
          }`}
        >
          <Text 
            className={`font-semibold text-[13px] ${
              buttonVariant === 'filled' 
                ? 'text-white' 
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View className="w-28 h-28 rounded-2xl overflow-hidden self-center bg-slate-100">
         <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
      </View>
    </View>
  );
};
