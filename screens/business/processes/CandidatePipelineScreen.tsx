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
  Alert,
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

  // States for custom confirm
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [confirmData, setConfirmData] = React.useState<any>(null);
  const [currentApp, setCurrentApp] = React.useState(application);

  // Advanced Hiring Action States
  const [interviewModalVisible, setInterviewModalVisible] = React.useState(false);
  const [interviewDate, setInterviewDate] = React.useState('');
  const [interviewTime, setInterviewTime] = React.useState('10:00');
  const [interviewPlatform, setInterviewPlatform] = React.useState('Google Meet');
  const [interviewLink, setInterviewLink] = React.useState('https://meet.google.com/abc-defg-hij');
  const [scheduling, setScheduling] = React.useState(false);

  // Custom stage states
  const [customStageModalVisible, setCustomStageModalVisible] = React.useState(false);
  const [newStageName, setNewStageName] = React.useState('');
  const [applyToAll, setApplyToAll] = React.useState(false);
  const [addingStage, setAddingStage] = React.useState(false);

  const rawProfile = Array.isArray(application.profiles)
    ? application.profiles[0]
    : application.profiles;
  const isDeletedUser = !!rawProfile?.deleted_at;

  const profile = isDeletedUser
    ? {
        ...rawProfile,
        full_name: 'Usuario Eliminado',
        avatar_url: null,
        resume_url: null,
        bio: 'Esta cuenta ha sido desactivada.',
      }
    : rawProfile;

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
          { name: 'Selección Final', order: 2, action: 'offer' },
        ];

        // Insertar estos stages para la vacante
        const toInsert = defaultStages.map((s: any, idx: number) => ({
          job_id: job.id,
          name: s.name,
          order_index: idx,
          action_type: s.action || 'generic',
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
        const prog = progress?.find((p) => p.stage_id === js.id);
        return {
          ...js,
          status: prog?.status || 'pending',
          completed_at: prog?.completed_at,
          notes: prog?.internal_notes,
        };
      });

      setStages(enrichedStages);

      // Determinar etapa actual (la primera no completada)
      const currentIdx = enrichedStages.findIndex((s) => s.status === 'pending');
      const finalActiveIdx = currentIdx === -1 ? enrichedStages.length : currentIdx;

      setActiveStageIndex(finalActiveIdx);
      setFocusedStageIndex((prev) => {
        return prev === -1 ? finalActiveIdx : prev;
      });

      // Cargar nota de la etapa enfocada
      const focusedStage =
        enrichedStages[focusedStageIndex === -1 ? finalActiveIdx : focusedStageIndex];
      if (focusedStage) {
        setInternalNotes(focusedStage.notes || '');
      }

      // Pre-cargar fecha en modal
      if (!interviewDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setInterviewDate(
          tomorrow.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
        );
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
    setFocusedStageIndex(index);
    setInternalNotes(stages[index].notes || '');

    const stage = stages[index];
    const newStatus = stage.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    // Optimistic UI updates
    const oldStages = [...stages];
    const oldActiveIndex = activeStageIndex;
    
    setStages(prev => prev.map((s, idx) => {
      if (idx === index) {
        return { ...s, status: newStatus, completed_at: completedAt };
      }
      return s;
    }));

    if (newStatus === 'completed') {
      setActiveStageIndex(index + 1);
    } else {
      setActiveStageIndex(index);
    }

    try {
      const { error } = await supabase.from('application_stages').upsert(
        {
          application_id: application.id,
          stage_id: stage.id,
          status: newStatus,
          completed_at: completedAt,
        },
        { onConflict: 'application_id,stage_id' }
      );

      if (error) throw error;

      // Actualizar también la tabla 'applications' para denotar la etapa actual en texto
      if (newStatus === 'completed') {
        await supabase
          .from('applications')
          .update({
            current_stage: stages[index + 1]?.name || 'Proceso Finalizado',
          })
          .eq('id', application.id);
      } else {
        await supabase
          .from('applications')
          .update({
            current_stage: stages[index].name,
          })
          .eq('id', application.id);
      }

      fetchData();
      showToast(`Etapa marcada como ${newStatus === 'completed' ? 'completada' : 'pendiente'}`);
    } catch (err) {
      console.error('Error toggling stage:', err);
      // Revert on error
      setStages(oldStages);
      setActiveStageIndex(oldActiveIndex);
      showToast('No se pudo actualizar la etapa', 'error');
    }
  };

  const saveNote = async () => {
    const stageToSave = stages[focusedStageIndex];
    if (!stageToSave) return;

    try {
      setSavingNote(true);
      const { error } = await supabase.from('application_stages').upsert(
        {
          application_id: application.id,
          stage_id: stageToSave.id,
          internal_notes: internalNotes,
        },
        { onConflict: 'application_id,stage_id' }
      );

      if (error) throw error;
      showToast('Observación guardada correctamente');

      setStages((prev) =>
        prev.map((s, idx) => (idx === focusedStageIndex ? { ...s, notes: internalNotes } : s))
      );
    } catch (err) {
      console.error('Error saving note:', err);
      showToast('Error al guardar la nota', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const getOrCreateRoomId = async () => {
    try {
      let roomId = currentApp.chat_rooms?.[0]?.id;
      if (roomId) return roomId;

      const { data: room } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('application_id', currentApp.id)
        .maybeSingle();

      if (room?.id) return room.id;

      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert([
          {
            application_id: currentApp.id,
            candidate_id: currentApp.candidate_id,
            company_id: session?.user?.id,
            status: 'active',
          },
        ])
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
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', currentApp.id);

      if (error) throw error;

      const rejectionMsg = `Hola ${profile.full_name}, la empresa ha decidido cerrar tu proceso para ${job.title}. ¡Mucho éxito en tus próximas postulaciones!`;
      const roomId = await getOrCreateRoomId();

      if (roomId) {
        await supabase.from('messages').insert([
          {
            room_id: roomId,
            content: rejectionMsg,
            sender_id: session?.user?.id,
            is_system: true,
            type: 'system',
          },
        ]);
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
          autoMessage: `Hola ${profile.full_name}, me gustaría avanzar con tu proceso para la vacante de ${job.title}.`,
        },
      });
    } else if (action === 'cv') {
      setConfirmData({
        title: 'SOLICITAR CV',
        message: `¿Deseas enviar un mensaje automático a ${profile.full_name} solicitando su Hoja de Vida en PDF?`,
        onConfirm: async () => {
          setConfirmVisible(false);
          const roomId = await getOrCreateRoomId();
          if (roomId) {
            await supabase.from('messages').insert([
              {
                room_id: roomId,
                content: `Hola ${profile.full_name}, para avanzar con tu perfil nos gustaría revisarlo mas a fondo. ¿Podrías enviarnos tu Hoja de Vida en PDF por este medio?`,
                sender_id: session?.user?.id,
              },
            ]);
            showToast('Solicitud enviada correctamente');
          }
        },
      });
      setConfirmVisible(true);
    } else if (action === 'assessment') {
      setConfirmData({
        title: 'ENVIAR PRUEBA TÉCNICA',
        message: `¿Deseas enviar una prueba interactiva a ${profile.full_name} para evaluar sus aptitudes técnicas?`,
        onConfirm: async () => {
          setConfirmVisible(false);
          const roomId = await getOrCreateRoomId();
          if (roomId) {
            await supabase.from('messages').insert([
              {
                room_id: roomId,
                content: `Hola ${profile.full_name}, te hemos asignado una evaluación de aptitud técnica para avanzar con tu postulación. Puedes completarla ingresando en: https://aptly.app/test/dev-assessment-101. ¡Mucho éxito!`,
                sender_id: session?.user?.id,
              },
            ]);
            showToast('Prueba técnica enviada correctamente');
          }
        },
      });
      setConfirmVisible(true);
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewDate.trim() || !interviewTime.trim()) {
      Alert.alert('Campos Vacíos', 'Por favor, completa la fecha y la hora.');
      return;
    }

    try {
      setScheduling(true);
      const roomId = await getOrCreateRoomId();

      if (roomId) {
        const inviteMsg = `🗓️ ENTREVISTA PROGRAMADA:\nHola ${profile.full_name}, nos encantaría agendar una entrevista contigo para la vacante de ${job.title}.\nFecha: ${interviewDate}\nHora: ${interviewTime}\nPlataforma: ${interviewPlatform}\nEnlace de conexión: ${interviewLink}\n¡Nos vemos pronto!`;

        await supabase.from('messages').insert([
          {
            room_id: roomId,
            sender_id: session?.user?.id,
            content: inviteMsg,
          },
        ]);

        // Auto-guardar detalles de la cita programada en la bitácora de la etapa de entrevista
        const currentFocusedStage = stages[focusedStageIndex];
        if (currentFocusedStage) {
          const updatedNotes =
            `[Entrevista Programada]\nFecha: ${interviewDate} a las ${interviewTime}\nPlataforma: ${interviewPlatform}\nEnlace: ${interviewLink}\n-------------------\n` +
            (currentFocusedStage.notes || '');

          await supabase.from('application_stages').upsert(
            {
              application_id: application.id,
              stage_id: currentFocusedStage.id,
              internal_notes: updatedNotes,
            },
            { onConflict: 'application_id,stage_id' }
          );
        }

        showToast('Entrevista programada con éxito');
        setInterviewModalVisible(false);
        fetchData();
      } else {
        showToast('Error al acceder al chat', 'error');
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
      showToast('No se pudo programar', 'error');
    } finally {
      setScheduling(false);
    }
  const handleAddCustomStage = async () => {
    if (!newStageName.trim()) {
      Alert.alert('Campo Vacío', 'Por favor, escribe el nombre de la etapa.');
      return;
    }

    try {
      setAddingStage(true);

      // 1. Insert into current vacancy pipeline stages
      const { data: insertedStage, error: insertError } = await supabase
        .from('job_pipeline_stages')
        .insert({
          job_id: job.id,
          name: newStageName.trim(),
          order_index: stages.length,
          action_type: 'generic',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. If 'applyToAll' is true, update company_settings default_pipeline
      if (applyToAll && session?.user?.id) {
        const { data: settings } = await supabase
          .from('company_settings')
          .select('default_pipeline')
          .eq('company_id', session.user.id)
          .maybeSingle();

        const currentPipeline = settings?.default_pipeline || [
          { name: 'Revisión de Perfil', order: 0, action: 'profile_review' },
          { name: 'Entrevista Inicial', order: 1, action: 'chat' },
          { name: 'Selección Final', order: 2, action: 'offer' },
        ];

        const updatedPipeline = [
          ...currentPipeline,
          { name: newStageName.trim(), order: currentPipeline.length, action: 'generic' }
        ];

        await supabase
          .from('company_settings')
          .upsert({
            company_id: session.user.id,
            default_pipeline: updatedPipeline,
          }, { onConflict: 'company_id' });
      }

      showToast('Nueva etapa añadida con éxito');
      setNewStageName('');
      setCustomStageModalVisible(false);
      fetchData();
    } catch (err) {
      console.error('Error adding custom stage:', err);
      showToast('Error al añadir la etapa', 'error');
    } finally {
      setAddingStage(false);
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
                params: { conversationId },
              });
            } else {
              navigation.goBack();
            }
          }}
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header del Candidato */}
          <View style={styles.candidateHeader}>
            <Image
              source={{
                uri:
                  profile?.avatar_url ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
              }}
              style={styles.headerAvatar}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{profile?.full_name}</Text>
              <Text style={styles.headerRole}>{profile?.professional_title}</Text>
              <TouchableOpacity
                onPress={() => setResumeVisible(true)}
                style={styles.viewProfileBtn}>
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

              const isCV =
                stage.action_type === 'cv' ||
                stage.name.toLowerCase().includes('cv') ||
                stage.name.toLowerCase().includes('vida');
              const isChat =
                stage.action_type === 'chat' || stage.name.toLowerCase().includes('entrevista');
              const isTest =
                stage.action_type === 'assessment' ||
                stage.name.toLowerCase().includes('evaluación') ||
                stage.name.toLowerCase().includes('prueba');

              return (
                <View key={stage.id} style={styles.timelineItem}>
                  {/* Línea vertical */}
                  {!isLast && (
                    <View style={[styles.line, isCompleted ? styles.lineActive : null]} />
                  )}

                  {/* Círculo indicador */}
                  <TouchableOpacity
                    style={[
                      styles.dot,
                      isCompleted ? styles.dotActive : isCurrent ? styles.dotCurrent : null,
                      isFocused && !isCurrent ? { borderColor: '#FF005C' } : null,
                    ]}
                    onPress={() => {
                      setFocusedStageIndex(index);
                      setInternalNotes(stage.notes || '');
                    }}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <View style={isCurrent ? styles.innerDotCurrent : null} />
                    )}
                  </TouchableOpacity>

                  {/* Contenido de la etapa */}
                  <View
                    style={[styles.stageContent, isFocused ? styles.stageContentFocused : null]}>
                    <TouchableOpacity
                      onPress={() => {
                        setFocusedStageIndex(index);
                        setInternalNotes(stage.notes || '');
                      }}
                      style={styles.stageTop}>
                      <Text
                        style={[
                          styles.stageName,
                          isCompleted ? styles.textDim : null,
                          isFocused ? { color: '#FF005C' } : null,
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
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 12,
                          }}>
                          <Text style={styles.actionPrompt}>Acciones de Reclutamiento:</Text>
                          {!isDeletedUser && (
                            <TouchableOpacity
                              onPress={() => toggleStage(index)}
                              style={styles.toggleBtn}>
                              <Text style={styles.toggleBtnText}>
                                {isCompleted ? 'Marcar Pendiente' : 'Marcar Completada'}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleQuickAction('chat')}>
                            <Ionicons name="chatbubbles-outline" size={15} color="#FF005C" />
                            <Text style={styles.actionBtnText}>Chat</Text>
                          </TouchableOpacity>

                          {isCV && (
                            <TouchableOpacity
                              style={styles.actionBtn}
                              onPress={() => handleQuickAction('cv')}>
                              <Ionicons name="document-text-outline" size={15} color="#FF005C" />
                              <Text style={styles.actionBtnText}>Pedir PDF</Text>
                            </TouchableOpacity>
                          )}

                          {isChat && (
                            <TouchableOpacity
                              style={styles.actionBtn}
                              onPress={() => setInterviewModalVisible(true)}>
                              <Ionicons name="calendar-outline" size={15} color="#FF005C" />
                              <Text style={styles.actionBtnText}>Agendar</Text>
                            </TouchableOpacity>
                          )}

                          {isTest && (
                            <TouchableOpacity
                              style={styles.actionBtn}
                              onPress={() => handleQuickAction('assessment')}>
                              <Ionicons name="clipboard-outline" size={15} color="#FF005C" />
                              <Text style={styles.actionBtnText}>Prueba</Text>
                            </TouchableOpacity>
                          )}

                          {!isCV && !isChat && !isTest && (
                            <TouchableOpacity
                              style={styles.actionBtn}
                              onPress={() => handleQuickAction('cv')}>
                              <Ionicons name="document-text-outline" size={15} color="#FF005C" />
                              <Text style={styles.actionBtnText}>Solicitar Doc</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {!isDeletedUser && (
              <TouchableOpacity
                onPress={() => setCustomStageModalVisible(true)}
                style={styles.addStageCta}>
                <Ionicons name="add-circle" size={18} color="#FF005C" style={{ marginRight: 6 }} />
                <Text style={styles.addStageCtaText}>Añadir Etapa Personalizada</Text>
              </TouchableOpacity>
            )}
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
              disabled={savingNote || isDeletedUser}
              style={[styles.saveBtn, (savingNote || isDeletedUser) && { opacity: 0.5 }]}
              onPress={saveNote}>
              <Text style={styles.saveBtnText}>
                {savingNote ? 'Guardando...' : 'Guardar Bitácora'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botones de Finalización */}
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={[styles.rejectBtn, isDeletedUser && { opacity: 0.3 }]}
              onPress={() => {
                setConfirmData({
                  title: 'DESCARTAR CANDIDATO',
                  message: `¿Estás seguro de cerrar el proceso para ${profile.full_name}? Se le notificará automáticamente que la posición ha sido ocupada.`,
                  onConfirm: discardCandidate,
                  type: 'danger',
                });
                setConfirmVisible(true);
              }}
              disabled={isDeletedUser}>
              <Text style={styles.rejectBtnText}>Descartar Candidato</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.hireBtn}
              onPress={() =>
                Alert.alert('¡Felicidades!', 'Vas a marcar a este candidato como contratado.')
              }>
              <View style={styles.hireBtnGlow} />
              <Text style={styles.hireBtnText}>Finalizar Proceso</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <CandidateResumePreview
          profile={profile}
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

        {/* MODAL PARA AGENDAR ENTREVISTA */}
        <ObsidianModal
          isVisible={interviewModalVisible}
          onClose={() => setInterviewModalVisible(false)}
          title="Agendar Entrevista"
          message={`Configura una reunión con ${profile.full_name} para la vacante de ${job.title}.`}
          iconName="calendar"
          iconColor="#FF005C"
          confirmText={scheduling ? 'Agendando...' : 'Enviar Cita'}
          cancelText="Cancelar"
          onConfirm={handleScheduleInterview}
          loading={scheduling}>
          <View style={styles.modalForm}>
            <Text style={styles.inputLabel}>Fecha del Evento</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 24 de Mayo, 2026"
              placeholderTextColor="#475569"
              value={interviewDate}
              onChangeText={setInterviewDate}
            />

            <Text style={styles.inputLabel}>Hora del Evento</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 10:30 AM"
              placeholderTextColor="#475569"
              value={interviewTime}
              onChangeText={setInterviewTime}
            />

            <Text style={styles.inputLabel}>Plataforma de Conexión</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Google Meet, Zoom, Teams"
              placeholderTextColor="#475569"
              value={interviewPlatform}
              onChangeText={setInterviewPlatform}
            />

            <Text style={styles.inputLabel}>Enlace de Reunión</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. https://meet.google.com/abc-defg-hij"
              placeholderTextColor="#475569"
              autoCapitalize="none"
              value={interviewLink}
              onChangeText={setInterviewLink}
            />
          </View>
        </ObsidianModal>

        {/* MODAL PARA AÑADIR ETAPA PERSONALIZADA */}
        <ObsidianModal
          isVisible={customStageModalVisible}
          onClose={() => setCustomStageModalVisible(false)}
          title="Añadir Etapa"
          message="Define una nueva etapa de evaluación para este proceso."
          iconName="git-branch"
          iconColor="#FF005C"
          confirmText={addingStage ? 'Añadiendo...' : 'Añadir Etapa'}
          cancelText="Cancelar"
          onConfirm={handleAddCustomStage}
          loading={addingStage}>
          <View style={styles.modalForm}>
            <Text style={styles.inputLabel}>Nombre de la Etapa</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Examen de Idioma, Prueba Médica"
              placeholderTextColor="#475569"
              value={newStageName}
              onChangeText={setNewStageName}
            />

            <Text style={styles.inputLabel}>Configuración de Aplicación</Text>
            <View style={{ gap: 10, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setApplyToAll(false)}
                style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.radioCircle, { borderColor: !applyToAll ? '#FF005C' : '#475569' }]}>
                  {!applyToAll && <View style={[styles.radioInner, { backgroundColor: '#FF005C' }]} />}
                </View>
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                  Solo en este proceso de vacante
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setApplyToAll(true)}
                style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.radioCircle, { borderColor: applyToAll ? '#FF005C' : '#475569' }]}>
                  {applyToAll && <View style={[styles.radioInner, { backgroundColor: '#FF005C' }]} />}
                </View>
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                  En todas las vacantes creadas (Predeterminado)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ObsidianModal>
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
    borderBottomColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  headerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF005C',
    shadowColor: '#FF005C',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  headerInfo: { flex: 1, marginLeft: 16 },
  headerName: { color: 'white', fontSize: 22, fontWeight: '900' },
  headerRole: { color: '#64748b', fontSize: 13, fontWeight: '600', marginTop: 2 },
  viewProfileBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  viewProfileText: { color: '#FF005C', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  chatFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF005C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF005C',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  pipelineContainer: { padding: 30 },
  timelineItem: { flexDirection: 'row', marginBottom: 5 },
  line: {
    position: 'absolute',
    left: 14,
    top: 30,
    bottom: -10,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    zIndex: -1,
  },
  lineActive: {
    backgroundColor: '#FF005C',
    shadowColor: '#FF005C',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1A1A1C',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  dotActive: { backgroundColor: '#FF005C', borderColor: '#FF005C' },
  dotCurrent: { borderColor: '#FF005C', backgroundColor: 'rgba(255, 0, 92, 0.1)' },
  innerDotCurrent: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF005C' },

  stageContent: { flex: 1, marginLeft: 20, paddingBottom: 34 },
  stageContentFocused: { opacity: 1 },
  stageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 24,
  },
  stageName: { color: 'white', fontSize: 17, fontWeight: '800' },
  textDim: { color: 'rgba(255,255,255,0.3)' },
  completedLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  toggleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  toggleBtnText: { color: '#FF005C', fontSize: 10, fontWeight: '900' },

  currentActions: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 0, 92, 0.02)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 92, 0.08)',
  },
  actionPrompt: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  actionBtnText: { color: 'white', fontSize: 12, fontWeight: '800', marginLeft: 6 },

  notesContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
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
    borderColor: 'rgba(255,255,255,0.08)',
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
    elevation: 5,
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
    overflow: 'hidden',
  },
  hireBtnGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.05)' },
  hireBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  rejectBtn: {
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  rejectBtnText: { color: '#FF3B30', fontWeight: '800', fontSize: 14 },

  // Scheduling Modal Inputs
  modalForm: { width: '100%', marginTop: 15, gap: 12 },
  inputLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  modalInput: {
    backgroundColor: '#09090b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    width: '100%',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF005C',
  },
  addStageCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 0, 92, 0.3)',
    backgroundColor: 'rgba(255, 0, 92, 0.02)',
    marginTop: 10,
    marginBottom: 20,
  },
  addStageCtaText: {
    color: '#FF005C',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
