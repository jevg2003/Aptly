import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

interface TimelineStepProps {
  step: {
    id: string;
    title: string;
    description: string;
    date: string;
    status: 'completed' | 'in_progress' | 'pending';
    action_type?: string;
  };
  isLast: boolean;
  onUploadPDF?: () => void;
  onGoToChat?: () => void;
  isUploadingPDF?: boolean;
  uploadedPDFUrl?: string | null;
}

export const TimelineStep = ({
  step,
  isLast,
  onUploadPDF,
  onGoToChat,
  isUploadingPDF = false,
  uploadedPDFUrl = null,
}: TimelineStepProps) => {
  const isCompleted = step.status === 'completed';
  const isInProgress = step.status === 'in_progress';

  // Design configuration based on status
  let iconName: any = 'circle';
  let dotBg = 'bg-[#18181b]';
  let dotBorder = 'border-white/10';
  let lineBg = 'bg-white/5';
  let titleColor = 'text-slate-500';
  let descColor = 'text-slate-500';
  let statusBadge = null;

  if (isCompleted) {
    iconName = 'checkmark';
    dotBg = 'bg-[#10b981]';
    dotBorder = 'border-[#10b981]';
    lineBg = 'bg-[#10b981]';
    titleColor = 'text-white font-bold';
    descColor = 'text-slate-400';
    statusBadge = (
      <View className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5">
        <Text className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
          Completado
        </Text>
      </View>
    );
  } else if (isInProgress) {
    dotBg = 'bg-[#00A3FF]/15';
    dotBorder = 'border-[#00A3FF]';
    lineBg = 'bg-white/5';
    titleColor = 'text-white font-black';
    descColor = 'text-slate-300';
    statusBadge = (
      <View className="rounded-full border border-[#00A3FF]/20 bg-[#00A3FF]/10 px-2 py-0.5 shadow-[0_0_8px_rgba(0,163,255,0.2)]">
        <Text className="text-[9px] font-black uppercase tracking-widest text-[#00A3FF]">
          En curso
        </Text>
      </View>
    );
  } else {
    // pending
    dotBg = 'bg-[#09090b]';
    dotBorder = 'border-white/5';
    lineBg = 'bg-white/5';
    titleColor = 'text-slate-600 font-bold';
    descColor = 'text-slate-600';
  }

  // Determine if this stage needs a dynamic interactive widget
  const isCVStage =
    step.action_type === 'cv' ||
    step.title.toLowerCase().includes('cv') ||
    step.title.toLowerCase().includes('vida') ||
    step.title.toLowerCase().includes('hoja');

  const isChatStage =
    step.action_type === 'chat' ||
    step.title.toLowerCase().includes('entrevista') ||
    step.title.toLowerCase().includes('inicial');

  return (
    <View className="flex-row">
      {/* Icon & Line Column */}
      <View className="mr-3 w-12 items-center">
        {/* Step Indicator Dot */}
        <View
          className={`h-9 w-9 items-center justify-center rounded-full border ${dotBg} ${dotBorder} ${isInProgress ? 'shadow-[0_0_12px_rgba(0,163,255,0.3)]' : ''}`}>
          {isCompleted ? (
            <Ionicons name="checkmark" size={18} color="white" />
          ) : isInProgress ? (
            <View className="h-3.5 w-3.5 rounded-full bg-[#00A3FF] shadow-[0_0_8px_#00A3FF]" />
          ) : (
            <View className="h-2.5 w-2.5 rounded-full bg-slate-800" />
          )}
        </View>

        {/* Vertical line connecting steps */}
        {!isLast && <View className={`h-full w-[2px] ${lineBg} absolute top-9 my-1`} />}
      </View>

      {/* Content Column */}
      <View className="flex-1 pb-10 pt-0.5">
        {/* Title & Status Badge Row */}
        <View className="mb-1.5 flex-row items-center justify-between pr-4">
          <Text className={`text-base font-bold tracking-tight ${titleColor}`}>{step.title}</Text>
          {statusBadge}
        </View>

        {/* Date / Helper Info */}
        <View className="mb-2 flex-row items-center">
          <Feather
            name="calendar"
            size={10}
            color={isCompleted || isInProgress ? '#94a3b8' : '#334155'}
          />
          <Text
            className={`ml-1.5 text-[11px] font-bold uppercase tracking-wider ${isCompleted || isInProgress ? 'text-slate-400' : 'text-slate-700'}`}>
            {step.date}
          </Text>
        </View>

        {/* Stage Description */}
        <Text className={`pr-6 text-[13px] font-medium leading-5 ${descColor}`}>
          {step.description}
        </Text>

        {/* DYNAMIC DOCK INTERACTIVE WIDGETS */}
        {isInProgress && (
          <View className="mr-5 mt-4 overflow-hidden rounded-2xl border border-white/5 bg-[#121214] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            {/* Ambient visual glow border indicator */}
            <View className="absolute bottom-0 left-0 top-0 w-1 bg-[#00A3FF]" />

            {isCVStage ? (
              <View>
                <Text className="mb-1 text-sm font-bold text-white">
                  Acción requerida: Cargar Hoja de Vida
                </Text>
                <Text className="mb-3.5 text-xs leading-4 text-slate-400">
                  El reclutador necesita tu currículum en formato PDF para avanzar al siguiente paso
                  del proceso.
                </Text>

                {isUploadingPDF ? (
                  <View className="flex-row items-center justify-center rounded-xl border border-[#00A3FF]/20 bg-[#00A3FF]/10 py-3.5">
                    <ActivityIndicator size="small" color="#00A3FF" className="mr-2" />
                    <Text className="text-xs font-black uppercase tracking-widest text-[#00A3FF]">
                      Subiendo PDF...
                    </Text>
                  </View>
                ) : uploadedPDFUrl ? (
                  <View className="flex-row items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-3">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" className="mr-2" />
                    <Text className="text-xs font-black uppercase tracking-widest text-emerald-400">
                      ¡Cargado con éxito!
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={onUploadPDF}
                    className="flex-row items-center justify-center rounded-xl bg-[#00A3FF] py-3.5 shadow-[0_4px_12px_rgba(0,163,255,0.25)]">
                    <Feather name="upload-cloud" size={16} color="white" className="mr-2" />
                    <Text className="text-xs font-black uppercase tracking-widest text-white">
                      Seleccionar y Subir PDF
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : isChatStage ? (
              <View>
                <Text className="mb-1 text-sm font-bold text-white">
                  Acción requerida: Iniciar Entrevista
                </Text>
                <Text className="mb-3.5 text-xs leading-4 text-slate-400">
                  El reclutador ha habilitado el chat para comenzar tu entrevista inicial.
                  ¡Pregúntale lo que necesites!
                </Text>

                <TouchableOpacity
                  onPress={onGoToChat}
                  className="flex-row items-center justify-center rounded-xl bg-[#00A3FF] py-3.5 shadow-[0_4px_12px_rgba(0,163,255,0.25)]">
                  <Ionicons name="chatbubbles" size={16} color="white" className="mr-2" />
                  <Text className="text-xs font-black uppercase tracking-widest text-white">
                    Ir al Chat de Reclutador
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="mb-1 text-sm font-bold text-white">
                  Tu proceso está en revisión
                </Text>
                <Text className="mb-3.5 text-xs leading-4 text-slate-400">
                  El reclutador está analizando tu progreso. Si tienes preguntas sobre esta etapa,
                  puedes consultar directamente al chat.
                </Text>

                <TouchableOpacity
                  onPress={onGoToChat}
                  className="flex-row items-center justify-center rounded-xl border border-white/5 bg-white/5 py-3.5">
                  <Feather name="message-circle" size={16} color="#00A3FF" className="mr-2" />
                  <Text className="text-xs font-black uppercase tracking-widest text-[#00A3FF]">
                    Consultar Reclutador
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};
