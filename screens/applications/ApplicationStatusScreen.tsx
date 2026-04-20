import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Application } from './mockData';
import { TimelineStep } from '../../components/applications/TimelineStep';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { Alert } from 'react-native';

export const ApplicationStatusScreen = ({ route, navigation }: any) => {
  const { application, userRole } = route.params as { application: Application, userRole: string };
  const session = React.useContext(SessionContext);

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
            <Text className="text-xs font-black text-slate-500 uppercase tracking-[3px] mb-8">Progreso de la Aplicación</Text>
            
            <View>
               {application.timeline.map((step, index) => (
                  <TimelineStep 
                    key={step.id} 
                    step={step} 
                    isLast={index === application.timeline.length - 1} 
                  />
               ))}
            </View>
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
