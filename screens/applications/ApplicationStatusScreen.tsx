import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Application } from './mockData';
import { TimelineStep } from '../../components/applications/TimelineStep';
import { SHARED_CONVERSATIONS } from '../../lib/data';

export const ApplicationStatusScreen = ({ route, navigation }: any) => {
  const { application } = route.params as { application: Application };

  const handleContactRecruiter = () => {
     // Find the conversation for this company
     const conversation = SHARED_CONVERSATIONS.find(c => c.companyId === application.companyId);
     
     if (conversation) {
        navigation.navigate('Chat', {
          screen: 'ChatDetail',
          params: { conversation }
        });
     } else {
        navigation.navigate('Chat');
     }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-none bg-white dark:bg-slate-950">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <Feather name="arrow-left" size={24} color="#0f172a" className="dark:text-white" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white pr-6">
          Estado de Aplicación
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
         
         {/* Top Card */}
         <View className="flex-row items-center bg-white dark:bg-slate-900 mx-5 my-4 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <View className="w-16 h-16 rounded-2xl bg-[#f5ebd9] items-center justify-center mr-4 overflow-hidden">
               {application.logoUri ? (
                  <Image source={{ uri: application.logoUri }} className="w-full h-full opacity-60" resizeMode="cover" />
               ) : (
                  <Text className="text-slate-400 font-bold text-lg">D1</Text>
               )}
            </View>
            <View className="flex-1 justify-center">
               <Text className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">{application.jobTitle}</Text>
               <Text className="text-blue-600 dark:text-blue-400 font-semibold mb-1">{application.companyName}</Text>
               <Text className="text-slate-500 text-xs">{application.appliedDate}</Text>
            </View>
         </View>

         {/* Timeline Section */}
         <View className="px-6 mt-4">
            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-6">Progreso de la Aplicación</Text>
            
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
           className="bg-blue-600 flex-row items-center justify-center mx-5 py-4 rounded-full mt-6 mb-8"
         >
            <Feather name="message-square" size={20} color="white" className="mr-2" />
            <Text className="text-white font-bold text-base">Contactar reclutador</Text>
         </TouchableOpacity>

         {/* FAQ Banner */}
         <View className="mx-5 p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700/50">
            <View className="flex-row items-start">
               <Feather name="info" size={20} color="#4f46e5" className="mt-0.5 mr-3" />
               <View className="flex-1">
                  <Text className="font-bold text-slate-900 dark:text-white mb-1">¿Tienes dudas sobre el proceso?</Text>
                  <Text className="text-slate-500 leading-5 text-[13px]">
                     Revisa nuestras preguntas frecuentes o contacta al reclutador asignado.
                  </Text>
               </View>
            </View>
         </View>

      </ScrollView>
    </SafeAreaView>
  );
};
