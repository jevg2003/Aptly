import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Application } from './mockData';
import { TimelineStep } from '../../components/applications/TimelineStep';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';

import * as DocumentPicker from 'expo-document-picker';
import { uploadDocument } from '../../lib/storageUtils';

export const ApplicationStatusScreen = ({ route, navigation }: any) => {
  const { application, userRole } = route.params as { application: Application; userRole: string };
  const session = React.useContext(SessionContext);

  const [loading, setLoading] = React.useState(true);
  const [pipeline, setPipeline] = React.useState<any[]>([]);

  // Real-time states
  const [showBanner, setShowBanner] = React.useState(false);
  const [bannerMessage, setBannerMessage] = React.useState('');
  const [isUploadingPDF, setIsUploadingPDF] = React.useState(false);
  const [uploadedPDFUrl, setUploadedPDFUrl] = React.useState<string | null>(null);

  const triggerUpdateBanner = (msg = '¡Proceso actualizado en tiempo real!') => {
    setBannerMessage(msg);
    setShowBanner(true);
    setTimeout(() => {
      setShowBanner(false);
    }, 4500);
  };

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
          const prog = progress?.find((p) => p.stage_id === js.id);
          const isCompleted = prog?.status === 'completed';

          return {
            id: js.id,
            title: js.name,
            description: isCompleted
              ? 'Completado con éxito'
              : prog?.internal_notes ||
                js.default_message ||
                'Pendiente de revisión por parte del reclutador.',
            date: prog?.completed_at
              ? new Date(prog.completed_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : index === 0
                ? 'En curso'
                : 'Próximamente',
            status: isCompleted
              ? 'completed'
              : progress?.filter((p) => p.status === 'completed').length === index
                ? 'in_progress'
                : 'pending',
            action_type: js.action_type || 'generic',
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
            date: new Date(application.appliedDate).toLocaleDateString(),
            status: 'completed',
            action_type: 'generic',
          },
          {
            id: '2',
            title: 'En revisión',
            description: 'El reclutador está evaluando tu perfil y currículum.',
            date: dbStatus === 'pending' ? 'En curso' : 'Completado',
            status: dbStatus === 'pending' ? 'in_progress' : 'completed',
            action_type: 'cv',
          },
          {
            id: '3',
            title: 'Proceso de Selección',
            description: 'Fase de entrevistas y pruebas rápidas.',
            date: dbStatus === 'reviewed' || dbStatus === 'interview' ? 'En curso' : 'Próximamente',
            status:
              dbStatus === 'reviewed' || dbStatus === 'interview'
                ? 'in_progress'
                : isAccepted || isRejected
                  ? 'completed'
                  : 'pending',
            action_type: 'chat',
          },
          {
            id: '4',
            title: isRejected
              ? 'Aplicación Cerrada'
              : isAccepted
                ? '¡Seleccionado!'
                : 'Decisión Final',
            description: isRejected
              ? 'El proceso ha finalizado para esta vacante.'
              : isAccepted
                ? 'Felicidades, fuiste seleccionado.'
                : 'La empresa tomará una decisión pronto.',
            date: isAccepted || isRejected ? 'Finalizado' : 'Próximamente',
            status: isAccepted || isRejected ? 'completed' : 'pending',
            action_type: 'generic',
          },
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

    // SUSCRIPCIÓN EN TIEMPO REAL CON SUPABASE
    if (!application.id) return;

    // Escuchar cambios en las etapas de la postulación
    const stagesChannel = supabase
      .channel(`app_stages_change_${application.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'application_stages',
          filter: `application_id=eq.${application.id}`,
        },
        (payload) => {
          console.log('Realtime event on application_stages:', payload);
          triggerUpdateBanner('¡El reclutador ha actualizado una etapa del proceso!');
          fetchApplicationProgress();
        }
      )
      .subscribe();

    // Escuchar cambios en el estado global de la aplicación
    const appChannel = supabase
      .channel(`app_general_change_${application.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `id=eq.${application.id}`,
        },
        (payload) => {
          console.log('Realtime event on applications:', payload);
          const newStatus = payload.new.status;
          let msg = '¡Tu postulación ha recibido una actualización!';
          if (newStatus === 'accepted') msg = '🎉 ¡Felicidades! Tu postulación ha sido Aceptada.';
          if (newStatus === 'rejected')
            msg = 'Tu proceso de selección ha finalizado para esta vacante.';
          if (newStatus === 'interview')
            msg = '🗓️ ¡El reclutador te ha avanzado a fase de Entrevista!';

          triggerUpdateBanner(msg);
          fetchApplicationProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stagesChannel);
      supabase.removeChannel(appChannel);
    };
  }, [application.id]);

  const handleContactRecruiter = async () => {
    try {
      setLoading(true);
      const companyId = application.companyId;
      const candidateId = userRole === 'candidate' ? session?.user?.id : application.companyId; // Opposite participant

      if (!companyId || !session?.user?.id) {
        Alert.alert('Error', 'Información de sesión o empresa no disponible.');
        setLoading(false);
        return;
      }

      // 1. Buscar si ya existe una sala vinculada a esta aplicación
      let { data: room, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('application_id', application.id)
        .maybeSingle();

      // 2. Si no se encuentra, intentar buscar por empresa y candidato
      if (!room) {
        let { data: roomByUsers } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('company_id', companyId)
          .eq('candidate_id', candidateId)
          .maybeSingle();

        room = roomByUsers;
      }

      // 3. Si no existe, crearla inmediatamente
      if (!room) {
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            application_id: application.id,
            company_id: companyId,
            candidate_id: candidateId,
          })
          .select('*')
          .single();

        if (createError) throw createError;
        room = newRoom;
      }

      setLoading(false);

      // 4. Navegar a ChatDetail con la información del room
      if (userRole === 'candidate') {
        navigation.navigate('Chat', {
          screen: 'ChatDetail',
          params: {
            roomId: room.id,
            oppositeUserId: companyId,
            participant: {
              id: companyId,
              name: application.companyName,
              avatar: application.logoUri,
              isOnline: false,
              isVerified: true,
              type: 'company',
            },
          },
        });
      } else {
        navigation.navigate('Chat', {
          screen: 'BusinessChatDetail',
          params: {
            conversationId: room.id,
            oppositeUserId: candidateId,
          },
        });
      }
    } catch (err) {
      console.error('Error starting chat:', err);
      setLoading(false);
      Alert.alert('Error', 'No se pudo iniciar el chat.');
    }
  };

  const handleUploadPDF = async () => {
    if (!session?.user?.id) return;
    try {
      // 1. Seleccionar archivo PDF local
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });

      if (result.canceled) return;

      setIsUploadingPDF(true);
      const asset = result.assets[0];

      // 2. Subir a Supabase Storage
      const uploadedUrl = await uploadDocument(asset.uri, session.user.id, asset.name);

      if (!uploadedUrl) {
        Alert.alert('Error', 'No se pudo cargar el documento.');
        setIsUploadingPDF(false);
        return;
      }

      setUploadedPDFUrl(uploadedUrl);
      triggerUpdateBanner('Currículum subido. Vinculando con reclutamiento...');

      // 3. Crear sala si no existe y mandar mensaje interactivo al chat de empresa
      let { data: room } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('application_id', application.id)
        .maybeSingle();

      if (!room) {
        const { data: newRoom } = await supabase
          .from('chat_rooms')
          .insert({
            application_id: application.id,
            company_id: application.companyId,
            candidate_id: session.user.id,
          })
          .select('*')
          .single();
        room = newRoom;
      }

      if (room) {
        await supabase.from('messages').insert({
          room_id: room.id,
          sender_id: session.user.id,
          content: `[DOCUMENT]${uploadedUrl}`,
          is_read: false,
        });
      }

      // 4. Buscar cuál es la etapa de tipo 'cv' actualmente activa y marcarla como completada
      const cvStep = pipeline.find(
        (s) =>
          s.status === 'in_progress' &&
          (s.action_type === 'cv' ||
            s.title.toLowerCase().includes('cv') ||
            s.title.toLowerCase().includes('vida') ||
            s.title.toLowerCase().includes('hoja'))
      );

      if (cvStep) {
        // Marcar la etapa en la base de datos
        await supabase.from('application_stages').upsert(
          {
            application_id: application.id,
            stage_id: cvStep.id,
            status: 'completed',
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'application_id,stage_id' }
        );

        // Avanzar current_stage en la tabla principal
        const currentIndex = pipeline.findIndex((s) => s.id === cvStep.id);
        const nextStageName = pipeline[currentIndex + 1]?.title || 'Proceso Finalizado';

        await supabase
          .from('applications')
          .update({
            current_stage: nextStageName,
          })
          .eq('id', application.id);
      }

      await fetchApplicationProgress();
      Alert.alert('¡Enviado!', 'Tu hoja de vida ha sido enviada con éxito al reclutador.');
    } catch (err) {
      console.error('Error in handleUploadPDF:', err);
      Alert.alert('Error', 'Ocurrió un error al procesar el currículum.');
    } finally {
      setIsUploadingPDF(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#050505]" edges={['top', 'left', 'right']}>
      {/* Floating real-time update banner toast */}
      {showBanner && (
        <View className="absolute left-5 right-5 top-16 z-50 flex-row items-center justify-between rounded-2xl border border-[#00A3FF]/20 bg-[#00A3FF] px-5 py-4 shadow-[0_8px_30px_rgba(0,163,255,0.45)]">
          <View className="mr-3 flex-1 flex-row items-center">
            <Ionicons name="sparkles" size={20} color="white" className="mr-2" />
            <Text className="flex-1 text-xs font-black leading-4 text-white">{bannerMessage}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowBanner(false)} className="p-1">
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View className="flex-row items-center border-b border-white/5 bg-[#050505] px-4 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 pr-6 text-center text-sm font-black uppercase tracking-widest text-white">
          Estado de Aplicación
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {/* Top Card */}
        <View className="relative mx-5 my-6 flex-row items-center overflow-hidden rounded-[32px] border border-white/5 bg-[#121214] p-5">
          {/* Ambient subtle cyan glow behind logo */}
          <View className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-[#00A3FF]/10 blur-2xl" />

          <View className="mr-4 h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-slate-800">
            {application.logoUri ? (
              <Image
                source={{ uri: application.logoUri }}
                className="h-full w-full opacity-80"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-xl font-black text-[#00A3FF]">AP</Text>
            )}
          </View>
          <View className="flex-1 justify-center">
            <Text className="mb-0.5 text-lg font-bold text-white">{application.jobTitle}</Text>
            <Text className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#00A3FF]">
              {application.companyName}
            </Text>
            <Text className="text-[11px] font-medium text-slate-500">
              {application.appliedDate}
            </Text>
          </View>
        </View>

        {/* Timeline Section */}
        <View className="mt-2 px-6">
          <Text className="mb-8 text-xs font-black uppercase tracking-[3px] text-slate-500">
            Progreso de tu Selección
          </Text>

          {loading && pipeline.length === 0 ? (
            <ActivityIndicator color="#00A3FF" />
          ) : (
            <View>
              {pipeline.map((step, index) => (
                <TimelineStep
                  key={step.id || index.toString()}
                  step={step}
                  isLast={index === pipeline.length - 1}
                  onUploadPDF={handleUploadPDF}
                  onGoToChat={handleContactRecruiter}
                  isUploadingPDF={isUploadingPDF}
                  uploadedPDFUrl={uploadedPDFUrl}
                />
              ))}
            </View>
          )}
        </View>

        {/* Contact Recruiter Button */}
        <TouchableOpacity
          onPress={handleContactRecruiter}
          className="mx-5 mb-8 mt-6 flex-row items-center justify-center rounded-[20px] border border-[#00A3FF]/20 bg-[#00A3FF]/10 py-4 shadow-[0_4px_12px_rgba(0,163,255,0.02)]">
          <Ionicons name="chatbubble-ellipses" size={18} color="#00A3FF" className="mr-2" />
          <Text className="text-[11px] font-black uppercase tracking-widest text-[#00A3FF]">
            Preguntar a la Empresa
          </Text>
        </TouchableOpacity>

        {/* FAQ Banner */}
        <View className="mx-5 rounded-[24px] border border-white/5 bg-[#121214] p-6">
          <View className="flex-row items-start">
            <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <Feather name="info" size={20} color="#00A3FF" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-base font-bold text-white">
                ¿Tienes dudas sobre el proceso?
              </Text>
              <Text className="text-[13px] leading-5 text-slate-500">
                Revisa nuestras preguntas frecuentes o contacta al reclutador asignado directamente
                por medio de la mensajería interna.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
