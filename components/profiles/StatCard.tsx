import React from 'react';
import { View, Text } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

export const StatCard = ({ label, value, sublabel }: StatCardProps) => {
  return (
    <View className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-4 items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
      <Text className="text-xl font-bold text-slate-900 dark:text-white">{value}</Text>
      <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1 text-center">
        {label}
      </Text>
      {sublabel && (
        <Text className="text-[9px] text-slate-400 dark:text-slate-600 mt-0.5 text-center lowercase">
          {sublabel}
        </Text>
      )}
    </View>
  );
};
