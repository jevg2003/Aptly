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
  let iconColor = '#475569'; // slate-600
  let bgColor = 'bg-transparent';
  let borderColor = 'border-white/10';
  let statusTextClass = 'text-slate-500';
  let titleClass = 'text-slate-500 font-bold';

  if (isCompleted) {
    iconColor = 'white';
    bgColor = 'bg-[#00A3FF]';
    borderColor = 'border-[#00A3FF]';
    statusTextClass = 'text-green-500 font-black uppercase tracking-widest text-[10px]';
    titleClass = 'text-white font-bold';
  } else if (isInProgress) {
    iconColor = '#00A3FF';
    bgColor = 'bg-[#00A3FF]/10';
    borderColor = 'border-[#00A3FF]';
    statusTextClass = 'text-[#00A3FF] font-black uppercase tracking-widest text-[10px]';
    titleClass = 'text-white font-bold';
  } else {
    // pending
    statusTextClass = 'text-slate-600 font-black uppercase tracking-widest text-[10px]';
    titleClass = 'text-slate-500 font-bold';
    iconColor = '#1e293b';
  }

  return (
    <View className="flex-row">
      {/* Icon & Line Column */}
      <View className="items-center w-12 mr-2">
        <View className={`w-10 h-10 rounded-full border items-center justify-center ${bgColor} ${borderColor}`}>
           {isCompleted ? (
              <Feather name="check" size={18} color={iconColor} />
           ) : isInProgress ? (
              <View className="w-3 h-3 rounded-full bg-[#00A3FF] shadow-[0_0_8px_#00A3FF]" />
           ) : (
              <View className="w-4 h-4 rounded-full border border-slate-800" />
           )}
        </View>
        
        {!isLast && (
          <View className="w-[1.5px] h-full bg-slate-800 my-1 min-h-[50px] absolute top-10" />
        )}
      </View>
      
      {/* Content Column */}
      <View className="flex-1 pb-10 pt-0.5">
        <View className="flex-row items-center mb-1">
           <Text className={`text-[15px] ${titleClass}`}>{step.title}</Text>
        </View>
        
        {step.status === 'completed' ? (
          <Text className={`${statusTextClass}`}>Completado</Text>
        ) : step.status === 'in_progress' ? (
          <Text className={`${statusTextClass}`}>En progreso</Text>
        ) : (
          <Text className={`${statusTextClass}`}>Pendiente</Text>
        )}
        
        <Text className="text-slate-500 text-[13px] mt-2 pr-6 leading-5">
          {step.description}
        </Text>
      </View>
    </View>
  );
};
