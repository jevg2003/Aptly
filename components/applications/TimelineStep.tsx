import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TimelineStepData } from '../../screens/applications/mockData';

interface TimelineStepProps {
  step: TimelineStepData;
  isLast: boolean;
}

export const TimelineStep = ({ step, isLast }: TimelineStepProps) => {
  const isCompleted = step.status === 'completed';
  const isInProgress = step.status === 'in_progress';
  
  // Colors based on status
  let iconColor = '#cbd5e1'; // slate-300
  let bgColor = 'bg-transparent';
  let borderColor = 'border-slate-200 dark:border-slate-700';
  let statusTextClass = 'text-slate-400';
  let titleClass = 'text-slate-800 dark:text-slate-200 font-bold';

  if (isCompleted) {
    iconColor = 'white';
    bgColor = 'bg-blue-600';
    borderColor = 'border-blue-600';
    statusTextClass = 'text-green-600 dark:text-green-500 font-medium';
  } else if (isInProgress) {
    iconColor = '#3b82f6'; // blue-500
    bgColor = 'bg-blue-100 dark:bg-blue-900/40';
    borderColor = 'border-blue-500';
    statusTextClass = 'text-blue-500 dark:text-blue-400 font-medium';
  } else {
    // pending
    statusTextClass = 'text-slate-400 font-medium';
    titleClass = 'text-slate-500 dark:text-slate-400 font-bold';
    iconColor = '#cbd5e1';
  }

  return (
    <View className="flex-row">
      {/* Icon & Line Column */}
      <View className="items-center w-12 mr-2">
        <View className={`w-10 h-10 rounded-full border-2 items-center justify-center ${bgColor} ${borderColor}`}>
           {isCompleted ? (
              <Feather name="check" size={20} color={iconColor} />
           ) : isInProgress ? (
              <Feather name="clock" size={20} color={iconColor} />
           ) : (
              <View className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
           )}
        </View>
        
        {!isLast && (
          <View className="w-[1px] h-full bg-blue-100 dark:bg-slate-800 my-1 min-h-[40px] absolute top-10" />
        )}
      </View>
      
      {/* Content Column */}
      <View className="flex-1 pb-8 pt-1">
        <Text className={`text-base ${titleClass}`}>{step.title}</Text>
        
        {step.status === 'completed' ? (
          <Text className={`text-sm ${statusTextClass} mt-0.5`}>Completado</Text>
        ) : step.status === 'in_progress' ? (
          <Text className={`text-sm ${statusTextClass} mt-0.5`}>En progreso</Text>
        ) : (
          <Text className={`text-sm ${statusTextClass} mt-0.5`}>Pendiente</Text>
        )}
        
        <Text className="text-slate-500 dark:text-slate-400 text-[13px] mt-1 pr-6 leading-5">
          {step.description}
        </Text>
      </View>
    </View>
  );
};
