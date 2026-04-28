import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Application } from './mockData';
import { TimelineStep } from '../../components/applications/TimelineStep';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { Alert, ActivityIndicator } from 'react-native';

export const ApplicationStatusScreen = ({ route, navigation }: any) => {
  const { application, userRole } = route.params as { application: Application, userRole: string };
  const session = React.useContext(SessionContext);

  const [loading, setLoading] = React.useState(true);
  const [pipeline, setPipeline] = React.useState<any[]>([]);

  const fetchApplicationProgress = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener stages definidos para esta vacante
      const { data: jobStages, error: stagesError } = await supabase
        .from('job_pipeline_stages')
        .select('*')
        .eq('job_id', application.jobId)
        .order('order_index', { ascending: true });

      if (stagesError) throw stagesError;

      // 2. Obtener mi progreso en esas etapas
      const { data: progress } = await supabase
        .from('application_stages')
        .select('*')
        .eq('application_id', application.id);

      // Obtener el estado actual general de la postulación
      const { data: appData } = await supabase
        .from('applications')
        .select('status, created_at')
        .eq('id', application.id)
        .single();
        
      const dbStatus = appData?.status || 'pending';

      // 3. Mapear al formato de TimelineStep
      if (jobStages && jobStages.length > 0) {
        const steps = jobStages.map((js: any, index: number) => {
          const prog = progress?.find(p => p.stage_id === js.id);
          const isCompleted = prog?.status === 'completed';
          
          return {
            id: js.id,
            title: js.name,
            description: isCompleted ? 'Completado con éxito' : 'Pendiente de realizar',
            date: prog?.completed_at ? new Date(prog.completed_at).toLocaleDateString() : (index === 0 ? 'En curso' : 'Próximamente'),
            status: isCompleted ? 'completed' : (progress?.filter(p => p.status === 'completed').length === index ? 'in_progress' : 'pending'),
            icon: js.action_type === 'chat' ? 'message-circle' : 'activity'
          };
        });
        setPipeline(steps);
      } else {
        // Fallback: Generar timeline determinístico basado en 'status'
        const isRejected = dbStatus === 'rejected';
        const isAccepted = dbStatus === 'accepted';
        
        const fallbackSteps = [
           {
              id: '1',
              title: 'Aplicación Enviada',
              description: 'Tu perfil fue enviado a la empresa.',
              status: 'completed'
           },
           {
              id: '2',
              title: 'En revisión',
              description: 'El reclutador está evaluando tu perfil.',
              status: dbStatus === 'pending' ? 'in_progress' : 'completed'
           },
           {
              id: '3',
              title: 'Proceso de Selección',
              description: 'Fase de entrevistas y pruebas.',
              status: (dbStatus === 'reviewed' || dbStatus === 'interview') ? 'in_progress' : (isAccepted || isRejected ? 'completed' : 'pending')
           },
           {
              id: '4',
              title: isRejected ? 'Aplicación Cerrada' : (isAccepted ? '¡Seleccionado!' : 'Decisión Final'),
              description: isRejected ? 'El proceso ha finalizado para esta vacante.' : (isAccepted ? 'Felicidades, fuiste seleccionado.' : 'La empresa tomará una decisión pronto.'),
              status: (isAccepted || isRejected) ? 'completed' : 'pending'
           }
        ];
        
        setPipeline(fallbackSteps);
      }

    } catch (err) {
      console.error('Error fetching application progress:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchApplicationProgress();
  }, [application.id]);

  const handleContactRecruiter = async () => {
     if (userRole === 'candidate') {
        Alert.alert(
           "Chat Bloqueado", 
           "De acuerdo con nuestras políticas, debes esperar a que la empresa dé el primer paso y te envíe un mensaje para habilitar el chat."
        );
        return;
     }

     // User is company, create or fetch chat room
     try {
        const companyId = session?.user?.id;
        const candidateId = application.companyId; // Para la empresa, companyId en Application es el candidateId
        
        if (!companyId || !candidateId) return;

        // Buscar si existe la sala
        let { data: room, error } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('company_id', companyId)
          .eq('candidate_id', candidateId)
          .single();

        // Si no existe, crearla
        if (!room) {
           const { data: newRoom, error: createError } = await supabase
             .from('chat_rooms')
             .insert({
                company_id: companyId,
                candidate_id: candidateId,
                job_id: application.jobId
             })
             .select('*')
             .single();
             
           if (createError) throw createError;
           room = newRoom;
        }

        // Navegar a ChatDetail con la información del room
        navigation.navigate('Chat', {
          screen: 'ChatDetail',
          params: { roomId: room.id, oppositeUserId: candidateId }
        });

     } catch (err) {
        console.error('Error starting chat:', err);
        Alert.alert("Error", "No se pudo iniciar el chat.");
     }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#050505]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-white/5 bg-[#050505]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-sm font-black text-white uppercase tracking-widest pr-6">
          Estado de Aplicación
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
         
         {/* Top Card */}
         <View className="flex-row items-center bg-[#121214] mx-5 my-6 p-5 rounded-[32px] border border-white/5">
            <View className="w-16 h-16 rounded-2xl bg-slate-800 items-center justify-center mr-4 overflow-hidden border border-white/5">
               {application.logoUri ? (
                  <Image source={{ uri: application.logoUri }} className="w-full h-full opacity-80" resizeMode="cover" />
               ) : (
                  <Text className="text-slate-500 font-bold text-lg">AP</Text>
               )}
            </View>
            <View className="flex-1 justify-center">
               <Text className="text-lg font-bold text-white mb-0.5">{application.jobTitle}</Text>
               <Text className="text-[#00A3FF] font-black uppercase text-[10px] tracking-widest mb-1">{application.companyName}</Text>
               <Text className="text-slate-500 text-[11px] font-medium">{application.appliedDate}</Text>
            </View>
         </View>

          {/* Timeline Section */}
          <View className="px-6 mt-2">
            <Text className="text-xs font-black text-slate-500 uppercase tracking-[3px] mb-8">Progreso de tu Selección</Text>
            
            {loading ? (
               <ActivityIndicator color="#00A3FF" />
            ) : (
               <View>
                  {pipeline.map((step, index) => (
                     <TimelineStep 
                       key={step.id} 
                       step={step} 
                       isLast={index === pipeline.length - 1} 
                     />
                  ))}
               </View>
            )}
          </View>

         {/* Contact Recruiter Button */}
         <TouchableOpacity 
           onPress={handleContactRecruiter}
           style={{ opacity: userRole === 'candidate' ? 0.5 : 1 }}
           className="bg-[#00A3FF] flex-row items-center justify-center mx-5 py-5 rounded-[24px] mt-8 mb-8 shadow-[0_8px_30px_rgba(0,163,255,0.3)]"
         >
            <Feather name="message-square" size={20} color="white" className="mr-2" />
            <Text className="text-white font-black uppercase tracking-widest text-sm">
               {userRole === 'candidate' ? 'Esperando Contacto...' : 'Iniciar Conversación'}
            </Text>
         </TouchableOpacity>

         {/* FAQ Banner */}
         <View className="mx-5 p-6 rounded-[24px] bg-[#121214] border border-white/5">
            <View className="flex-row items-start">
               <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center mr-4">
                  <Feather name="info" size={20} color="#00A3FF" />
               </View>
               <View className="flex-1">
                  <Text className="font-bold text-white mb-1 text-base">¿Tienes dudas sobre el proceso?</Text>
                  <Text className="text-slate-500 leading-5 text-[13px]">
                     Revisa nuestras preguntas frecuentes o contacta al reclutador asignado directamente.
                  </Text>
               </View>
            </View>
         </View>

      </ScrollView>
    </SafeAreaView>
  );
};
