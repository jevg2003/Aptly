import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ObsidianHeader } from '../../../components/ObsidianHeader';
import { ObsidianModal } from '../../../components/ObsidianModal';
import { ObsidianConfirm } from '../../../components/common/ObsidianConfirm';
import { showToast } from '../../../components/common/ObsidianToast';
import { CandidateResumePreview } from '../../../components/profiles/CandidateResumePreview';
import { supabase } from '../../../lib/supabase';
import { SessionContext } from '../../../lib/SessionContext';
import { Modal } from 'react-native';

export const CandidatePipelineScreen = ({ route, navigation }: any) => {
  const { application, job, fromChat, conversationId } = route.params;
  const session = React.useContext(SessionContext);
  
  const [loading, setLoading] = React.useState(true);
  const [stages, setStages] = React.useState<any[]>([]);
  const [activeStageIndex, setActiveStageIndex] = React.useState(0);
  const [focusedStageIndex, setFocusedStageIndex] = React.useState(0);
  const [internalNotes, setInternalNotes] = React.useState('');
  const [savingNote, setSavingNote] = React.useState(false);
  
  const [resumeVisible, setResumeVisible] = React.useState(false);
  const [experiences, setExperiences] = React.useState<any[]>([]);

  // States for custom confirm
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [confirmData, setConfirmData] = React.useState<any>(null);
  const [currentApp, setCurrentApp] = React.useState(application);

  const profile = Array.isArray(application.profiles) ? application.profiles[0] : application.profiles;

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 0. Refrescar datos de la aplicación (especialmente chat_rooms)
      const { data: appData } = await supabase
        .from('applications')
        .select('*, chat_rooms(id)')
        .eq('id', application.id)
        .single();
      
      if (appData) setCurrentApp(appData);

      // 1. Obtener stages definidos para esta vacante
      let { data: jobStages, error: stagesError } = await supabase
        .from('job_pipeline_stages')
        .select('*')
        .eq('job_id', job.id)
        .order('order_index', { ascending: true });

      if (stagesError) throw stagesError;

      // 2. Si no hay stages, inicializarlos desde el default de la empresa o el sistema
      if (!jobStages || jobStages.length === 0) {
        const { data: settings } = await supabase
          .from('company_settings')
          .select('default_pipeline')
          .eq('company_id', session?.user?.id)
          .maybeSingle();

        const defaultStages = settings?.default_pipeline || [
          { name: 'Revisión de Perfil', order: 0, action: 'profile_review' },
          { name: 'Entrevista Inicial', order: 1, action: 'chat' },
          { name: 'Selección Final', order: 2, action: 'offer' }
        ];

        // Insertar estos stages para la vacante
        const toInsert = defaultStages.map((s: any, idx: number) => ({
          job_id: job.id,
          name: s.name,
          order_index: idx,
          action_type: s.action || 'generic'
        }));

        const { data: inserted, error: insError } = await supabase
          .from('job_pipeline_stages')
          .insert(toInsert)
          .select();
        
        if (insError) throw insError;
        jobStages = inserted;
      }

      // 3. Obtener el progreso del candidato
      const { data: progress } = await supabase
        .from('application_stages')
        .select('*')
        .eq('application_id', application.id);

      // Combinar info
      const enrichedStages = jobStages.map((js: any) => {
        const prog = progress?.find(p => p.stage_id === js.id);
        return {
          ...js,
          status: prog?.status || 'pending',
          completed_at: prog?.completed_at,
          notes: prog?.internal_notes
        };
      });

      setStages(enrichedStages);

      // 4. Obtener experiencias para el resume
      const { data: exps } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', profile.id)
        .order('start_date', { ascending: false });
      
      setExperiences(exps || []);

      // Determinar etapa actual (la primera no completada)
      const currentIdx = enrichedStages.findIndex(s => s.status === 'pending');
      const finalActiveIdx = currentIdx === -1 ? enrichedStages.length : currentIdx;
      
      setActiveStageIndex(finalActiveIdx);
      setFocusedStageIndex(prev => {
        // Solo resetear el foco si es la primera carga o si el foco estaba perdido
        return prev === -1 ? finalActiveIdx : prev;
      });
      
      // Cargar nota de la etapa enfocada
      const focusedStage = enrichedStages[focusedStageIndex === -1 ? finalActiveIdx : focusedStageIndex];
      if (focusedStage) {
        setInternalNotes(focusedStage.notes || '');
      }

    } catch (err) {
      console.error('Error in CandidatePipelineScreen:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [application.id, job.id]);

  const toggleStage = async (index: number) => {
    // Si el usuario toca el círculo, primero lo enfocamos
    setFocusedStageIndex(index);
    setInternalNotes(stages[index].notes || '');

    const stage = stages[index];
    const newStatus = stage.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from('application_stages')
        .upsert({
          application_id: application.id,
          stage_id: stage.id,
          status: newStatus,
          completed_at: completedAt
        }, { onConflict: 'application_id,stage_id' });

      if (error) throw error;

      // Actualizar también la tabla 'applications' para denotar la etapa actual en texto
      if (newStatus === 'completed') {
         await supabase.from('applications').update({
           current_stage: stages[index + 1]?.name || 'Proceso Finalizado'
         }).eq('id', application.id);
      } else {
         await supabase.from('applications').update({
           current_stage: stages[index].name
         }).eq('id', application.id);
      }

      fetchData();
      showToast(`Etapa marcada como ${newStatus === 'completed' ? 'completada' : 'pendiente'}`);
    } catch (err) {
      console.error('Error toggling stage:', err);
      showToast('No se pudo actualizar la etapa', 'error');
    }
  };

  const saveNote = async () => {
    const stageToSave = stages[focusedStageIndex];
    if (!stageToSave) return;

    try {
      setSavingNote(true);
      const { error } = await supabase
        .from('application_stages')
        .upsert({
          application_id: application.id,
          stage_id: stageToSave.id,
          internal_notes: internalNotes
        }, { onConflict: 'application_id,stage_id' });

      if (error) throw error;
      showToast('Observación guardada correctamente');
      
      // Actualizar localmente el array de stages
      setStages(prev => prev.map((s, idx) => 
        idx === focusedStageIndex ? { ...s, notes: internalNotes } : s
      ));
    } catch (err) {
      console.error('Error saving note:', err);
      showToast('Error al guardar la nota', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const getOrCreateRoomId = async () => {
    try {
      // 1. Verificar si ya existe en el estado actual
      let roomId = currentApp.chat_rooms?.[0]?.id;
      if (roomId) return roomId;

      // 2. Intentar buscar en DB por si acaso
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('application_id', currentApp.id)
        .maybeSingle();
      
      if (room?.id) return room.id;

      // 3. Crear nueva sala
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert([{
          application_id: currentApp.id,
          candidate_id: currentApp.candidate_id,
          company_id: session?.user?.id,
          status: 'active'
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      return newRoom.id;
    } catch (err) {
      console.error('Error in getOrCreateRoomId:', err);
      return null;
    }
  };

  const discardCandidate = async () => {
    try {
      setConfirmVisible(false);
      setLoading(true);
      // 1. Marcar la aplicación como rechazada
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', currentApp.id);
      
      if (error) throw error;

      // 2. Enviar mensaje automático
      const rejectionMsg = `Hola ${profile.full_name}, la empresa ha decidido cerrar tu proceso para ${job.title}. ¡Mucho éxito en tus próximas postulaciones!`;
      
      const roomId = await getOrCreateRoomId();

      if (roomId) {
        await supabase.from('messages').insert([{
          room_id: roomId,
          content: rejectionMsg,
          sender_id: session?.user?.id,
          is_system: true,
          type: 'system'
        }]);
      }

      showToast('Candidato descartado correctamente', 'info');
      navigation.goBack();
    } catch (err) {
      console.error('Error discarding candidate:', err);
      showToast('Error al descartar candidato', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'chat') {
      showToast('Iniciando conversación...', 'info', 1500);
      const roomId = await getOrCreateRoomId();
      
      if (!roomId) {
        showToast('No se pudo abrir el chat', 'error');
        return;
      }

      navigation.navigate('Chat', { 
        screen: 'BusinessChatDetail', 
        params: { 
          conversationId: roomId,
          autoMessage: `Hola ${profile.full_name}, me gustaría avanzar con tu proceso para la vacante de ${job.title}.`
        } 
      });
    } else if (action === 'cv') {
       setConfirmData({
         title: 'SOLICITAR CV',
         message: `¿Deseas enviar un mensaje automático a ${profile.full_name} solicitando su Hoja de Vida en PDF?`,
         onConfirm: async () => {
            setConfirmVisible(false);
            const roomId = await getOrCreateRoomId();
            if (roomId) {
               await supabase.from('messages').insert([{
                 room_id: roomId,
                 content: `Hola ${profile.full_name}, para avanzar con tu perfil nos gustaría revisarlo mas a fondo. ¿Podrías enviarnos tu Hoja de Vida en PDF por este medio?`,
                 sender_id: session?.user?.id
               }]);
               showToast('Solicitud enviada correctamente');
            }
         }
       });
       setConfirmVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FF005C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ObsidianHeader 
          title="Procesos" 
          subtitle="GUÍA DE CONTRATACIÓN"
          leftIcon="arrow-back"
          onLeftPress={() => {
            if (fromChat && conversationId) {
              navigation.navigate('Chat', { 
                screen: 'BusinessChatDetail', 
                params: { conversationId } 
              });
            } else {
              navigation.goBack();
            }
          }}
        />

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header del Candidato */}
          <View style={styles.candidateHeader}>
            <Image 
              source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' }} 
              style={styles.headerAvatar} 
            />
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{profile?.full_name}</Text>
              <Text style={styles.headerRole}>{profile?.professional_title}</Text>
              <TouchableOpacity onPress={() => setResumeVisible(true)} style={styles.viewProfileBtn}>
                 <Text style={styles.viewProfileText}>VER PERFIL DETALLADO</Text>
                 <Ionicons name="chevron-forward" size={12} color="#FF005C" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.chatFab} onPress={() => handleQuickAction('chat')}>
               <Ionicons name="chatbubble-ellipses" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Timeline de Etapas */}
          <View style={styles.pipelineContainer}>
            {stages.map((stage, index) => {
              const isCompleted = stage.status === 'completed';
              const isCurrent = index === activeStageIndex;
              const isFocused = index === focusedStageIndex;
              const isLast = index === stages.length - 1;

              return (
                <View key={stage.id} style={styles.timelineItem}>
                  {/* Línea vertical */}
                  {!isLast && (
                    <View style={[
                       styles.line, 
                       isCompleted ? styles.lineActive : null
                    ]} />
                  )}
                  
                  {/* Círculo indicador */}
                  <TouchableOpacity 
                    style={[
                      styles.dot, 
                      isCompleted ? styles.dotActive : isCurrent ? styles.dotCurrent : null,
                      isFocused && !isCurrent ? { borderColor: '#FF005C' } : null
                    ]}
                    onPress={() => {
                      setFocusedStageIndex(index);
                      setInternalNotes(stage.notes || '');
                    }}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <View style={isCurrent ? styles.innerDotCurrent : null} />
                    )}
                  </TouchableOpacity>

                  {/* Contenido de la etapa */}
                  <View style={[styles.stageContent, isFocused ? styles.stageContentFocused : null]}>
                    <TouchableOpacity 
                      onPress={() => {
                        setFocusedStageIndex(index);
                        setInternalNotes(stage.notes || '');
                      }}
                      style={styles.stageTop}
                    >
                        <Text style={[
                          styles.stageName, 
                          isCompleted ? styles.textDim : null,
                          isFocused ? { color: '#FF005C' } : null
                        ]}>
                          {stage.name}
                        </Text>
                        {isCompleted && (
                          <Text style={styles.completedLabel}>
                            {new Date(stage.completed_at).toLocaleDateString()}
                          </Text>
                        )}
                    </TouchableOpacity>
                    
                    {isFocused && (
                      <View style={styles.currentActions}>
                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                           <Text style={styles.actionPrompt}>Acciones para esta etapa:</Text>
                           <TouchableOpacity onPress={() => toggleStage(index)} style={styles.toggleBtn}>
                              <Text style={styles.toggleBtnText}>{isCompleted ? 'Marcar Pendiente' : 'Marcar Completada'}</Text>
                           </TouchableOpacity>
                         </View>
                         <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleQuickAction('chat')}>
                               <Ionicons name="videocam-outline" size={16} color="#FF005C" />
                               <Text style={styles.actionBtnText}>Entrevista</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleQuickAction('cv')}>
                               <Ionicons name="document-text-outline" size={16} color="#FF005C" />
                               <Text style={styles.actionBtnText}>Pedir PDF</Text>
                            </TouchableOpacity>
                         </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Notas Internas */}
          <View style={styles.notesContainer}>
            <View style={styles.notesHeader}>
               <Ionicons name="journal-outline" size={20} color="#FF005C" />
               <Text style={styles.notesTitle}>Bitácora de Evaluación</Text>
            </View>
            <Text style={styles.notesSub}>Estas notas solo son visibles por tu equipo.</Text>
            
            <TextInput
               style={styles.notesInput}
               placeholder="Escribe tus observaciones sobre el desempeño del candidato..."
               placeholderTextColor="#475569"
               multiline
               value={internalNotes}
               onChangeText={setInternalNotes}
            />
            
            <TouchableOpacity 
              style={[styles.saveBtn, internalNotes.length === 0 ? styles.saveBtnDisabled : null]}
              onPress={saveNote}
              disabled={savingNote || internalNotes.length === 0}
            >
               {savingNote ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.saveBtnText}>Guardar Observación</Text>}
            </TouchableOpacity>
          </View>
          
          {/* Botones de Finalización */}
          <View style={styles.footerActions}>
             <TouchableOpacity style={styles.rejectBtn} onPress={() => {
                setConfirmData({
                  title: 'DESCARTAR CANDIDATO',
                  message: `¿Estás seguro de cerrar el proceso para ${profile.full_name}? Se le notificará automáticamente que la posición ha sido ocupada.`,
                  onConfirm: discardCandidate,
                  type: 'danger'
                });
                setConfirmVisible(true);
             }}>
                <Text style={styles.rejectBtnText}>Descartar Candidato</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.hireBtn} onPress={() => Alert.alert('¡Felicidades!', 'Vas a marcar a este candidato como contratado.')}>
                <View style={styles.hireBtnGlow} />
                <Text style={styles.hireBtnText}>Finalizar Proceso</Text>
             </TouchableOpacity>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>

        <CandidateResumePreview 
          profile={profile}
          experiences={experiences}
          onClose={() => setResumeVisible(false)}
          isVisible={resumeVisible}
        />

      <ObsidianConfirm 
        visible={confirmVisible}
        title={confirmData?.title || ''}
        message={confirmData?.message || ''}
        onConfirm={confirmData?.onConfirm || (() => {})}
        onCancel={() => setConfirmVisible(false)}
        type={confirmData?.type}
      />
    </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  candidateHeader: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#121214',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  headerAvatar: { width: 80, height: 80, borderRadius: 20, borderWidth: 2, borderColor: '#FF005C' },
  headerInfo: { flex: 1, marginLeft: 16 },
  headerName: { color: 'white', fontSize: 22, fontWeight: '900' },
  headerRole: { color: '#64748b', fontSize: 13, fontWeight: '600', marginTop: 2 },
  viewProfileBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  viewProfileText: { color: '#FF005C', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  chatFab: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF005C', justifyContent: 'center', alignItems: 'center' },
  
  pipelineContainer: { padding: 30 },
  timelineItem: { flexDirection: 'row', marginBottom: 5 },
  line: {
    position: 'absolute',
    left: 14,
    top: 30,
    bottom: -10,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: -1
  },
  lineActive: { backgroundColor: '#FF005C' },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1A1A1C',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  dotActive: { backgroundColor: '#FF005C', borderColor: '#FF005C' },
  dotCurrent: { borderColor: '#FF005C', backgroundColor: 'rgba(255, 0, 92, 0.1)' },
  innerDotCurrent: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF005C' },
  
  stageContent: { flex: 1, marginLeft: 20, paddingBottom: 34 },
  stageContentFocused: { opacity: 1 },
  stageTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 24 },
  stageName: { color: 'white', fontSize: 17, fontWeight: '800' },
  textDim: { color: 'rgba(255,255,255,0.4)' },
  completedLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  
  toggleBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  toggleBtnText: { color: '#FF005C', fontSize: 9, fontWeight: '900' },
  
  currentActions: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 16 },
  actionPrompt: { color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)'
  },
  actionBtnText: { color: 'white', fontSize: 12, fontWeight: '800', marginLeft: 6 },
  
  notesContainer: { paddingHorizontal: 24, paddingVertical: 32, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notesTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  notesSub: { color: '#64748b', fontSize: 12, marginTop: 4, marginBottom: 16 },
  notesInput: {
    backgroundColor: '#121214',
    borderRadius: 16,
    padding: 16,
    color: 'white',
    fontSize: 14,
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  saveBtn: { 
    backgroundColor: '#FF005C', 
    marginTop: 16, 
    padding: 16, 
    borderRadius: 14, 
    alignItems: 'center',
    shadowColor: '#FF005C',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: 'white', fontWeight: '900', fontSize: 15 },
  
  footerActions: { paddingHorizontal: 24, gap: 12 },
  hireBtn: { 
    height: 60, 
    borderRadius: 18, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'relative',
    overflow: 'hidden'
  },
  hireBtnGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.05)' },
  hireBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  rejectBtn: { height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FF3B30' },
  rejectBtnText: { color: '#FF3B30', fontWeight: '800', fontSize: 14 }
});
