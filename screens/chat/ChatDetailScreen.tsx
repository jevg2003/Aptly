import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TextInput,
  Image,
  Modal,
  Pressable,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Vibration,
  LayoutAnimation,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Message } from './mockData';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { uploadAvatar, uploadDocument } from '../../lib/storageUtils';
import { showToast } from '../../components/common/ObsidianToast';
import { ObsidianConfirm } from '../../components/common/ObsidianConfirm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACCENT_COLOR = '#00A3FF'; // Candidate blue

export const ChatDetailScreen = ({ route, navigation }: any) => {
  const { roomId, oppositeUserId, participant } = route.params;
  const session = React.useContext(SessionContext);
  const currentUserId = session?.user?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isAttachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmData, setConfirmData] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuData, setMenuData] = useState<{ message: any; x: number; y: number } | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const quickEmojis = ['👍', '❤️', '😂', '😮', '🙏', '🔥', '💼', '👏', '✅', '🙌', '🚀', '💡'];

  useEffect(() => {
    if (!roomId || !currentUserId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const mapped: Message[] = data.map((m) => {
          const content = m.content || '';
          let type: any = 'text';
          let mediaUrl = undefined;
          let text = content;

          if (content.startsWith('[IMAGE]')) {
            type = 'image';
            mediaUrl = content.replace('[IMAGE]', '');
            text = 'Imagen adjunta';
          } else if (content.startsWith('[DOCUMENT]')) {
            type = 'file';
            mediaUrl = content.replace('[DOCUMENT]', '');
            text = 'Documento adjunto';
          }

          return {
            id: m.id,
            senderId: m.sender_id,
            text,
            mediaUrl,
            timestamp: new Date(m.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            type,
            replyToId: m.reply_to_id,
            deletedAt: m.deleted_at,
          };
        });
        setMessages(mapped);

        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('room_id', roomId)
          .neq('sender_id', currentUserId);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const eventType = payload.eventType;
          if (eventType === 'INSERT') {
            const newMsg = payload.new;
            const content = newMsg.content || '';
            let type: any = 'text';
            let mediaUrl = undefined;
            let text = content;
            if (content.startsWith('[IMAGE]')) {
              type = 'image';
              mediaUrl = content.replace('[IMAGE]', '');
              text = 'Imagen adjunta';
            } else if (content.startsWith('[DOCUMENT]')) {
              type = 'file';
              mediaUrl = content.replace('[DOCUMENT]', '');
              text = 'Documento adjunto';
            }

            setMessages((prev) => {
              if (prev.find((m) => m.id === newMsg.id)) return prev;
              return [
                ...prev,
                {
                  id: newMsg.id,
                  senderId: newMsg.sender_id,
                  text,
                  mediaUrl,
                  timestamp: new Date(newMsg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  type,
                  replyToId: newMsg.reply_to_id,
                  deletedAt: newMsg.deleted_at,
                },
              ];
            });

            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          } else if (eventType === 'UPDATE') {
            const updatedMsg = payload.new;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === updatedMsg.id
                  ? { ...m, deletedAt: updatedMsg.deleted_at }
                  : m
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, currentUserId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !currentUserId) return;
    const textToSend = inputText.trim();
    setInputText('');
    const replyId = replyingTo?.id || null;
    setReplyingTo(null);

    try {
      await supabase.from('messages').insert({
        room_id: roomId,
        sender_id: currentUserId,
        content: textToSend,
        is_read: false,
        reply_to_id: replyId,
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (e) {
      console.error('Send error:', e);
    }
  };

  const handleAttachImage = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Necesitamos acceso a tu cámara para tomar fotos.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Necesitamos acceso a tu galería para seleccionar fotos.');
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });

      setAttachmentMenuVisible(false);

      if (!result.canceled && currentUserId) {
        setIsUploading(true);
        try {
          const uri = result.assets[0].uri;
          const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );

          const uploadedUrl = await uploadAvatar(manipResult.uri, currentUserId);

          if (uploadedUrl) {
            await supabase.from('messages').insert({
              room_id: roomId,
              sender_id: currentUserId,
              content: `[IMAGE]${uploadedUrl}`,
              is_read: false,
            });
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (e) {
      console.error('Error al seleccionar imagen', e);
      setAttachmentMenuVisible(false);
    }
  };

  const handleAttachDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
        ],
      });
      setAttachmentMenuVisible(false);

      if (!result.canceled && currentUserId) {
        setIsUploading(true);
        try {
          const asset = result.assets[0];
          const uploadedUrl = await uploadDocument(asset.uri, currentUserId, asset.name);
          if (uploadedUrl) {
            await supabase.from('messages').insert({
              room_id: roomId,
              sender_id: currentUserId,
              content: `[DOCUMENT]${uploadedUrl}`,
              is_read: false,
            });
          }
        } catch (error) {
          console.error('Error uploading document:', error);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (e) {
      console.error('Error al seleccionar documento', e);
      setAttachmentMenuVisible(false);
    }
  };

  const handleHeaderPress = async () => {
    if (!roomId) return;
    try {
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('application_id')
        .eq('id', roomId)
        .single();

      if (roomError || !roomData?.application_id) {
        console.error('Room is not linked to an application:', roomError);
        alert('Este chat no está vinculado a una postulación activa.');
        return;
      }

      const { data: app, error: appError } = await supabase
        .from('applications')
        .select(`
          id, 
          status,
          created_at,
          candidate_id,
          jobs (
            id,
            title,
            company_id,
            company_profile:profiles!jobs_company_id_fkey(full_name, avatar_url)
          )
        `)
        .eq('id', roomData.application_id)
        .single();

      if (appError || !app) {
        console.error('Error fetching application:', appError);
        return;
      }

      const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
      const compProf = job?.company_profile
        ? Array.isArray(job.company_profile)
          ? job.company_profile[0]
          : job.company_profile
        : null;

      let statusString = 'Recibida';
      if (app.status === 'pending') statusString = 'Recibida';
      if (app.status === 'reviewed') statusString = 'En revisión';
      if (app.status === 'interview') statusString = 'En Proceso';
      if (app.status === 'rejected') statusString = 'Rechazado';
      if (app.status === 'accepted') statusString = 'Aceptado';
      if (app.status === 'closed') statusString = 'Finalizado';

      const baseTimeline = [
        {
          id: 't1',
          title: 'Aplicación recibida',
          date: new Date(app.created_at).toLocaleDateString(),
          completed: true,
        },
        {
          id: 't2',
          title: 'En revisión',
          date: 'Pendiente',
          completed: app.status !== 'pending',
        },
        {
          id: 't3',
          title: 'Entrevista',
          date: 'Pendiente',
          completed: app.status === 'interview' || app.status === 'accepted',
        },
        {
          id: 't4',
          title: 'Decisión final',
          date: 'Pendiente',
          completed: app.status === 'rejected' || app.status === 'accepted',
        },
      ];

      const mappedApp = {
        id: app.id,
        jobId: job?.id || '',
        jobTitle: job?.title || 'Vacante',
        companyId: job?.company_id || '',
        companyName: compProf?.full_name || participant.name,
        logoUri: compProf?.avatar_url || participant.avatar,
        imageUri: compProf?.avatar_url || participant.avatar || '',
        status: statusString,
        statusColor: '',
        subtitle: '',
        buttonVariant: 'outline',
        buttonText: 'Ver detalles',
        appliedDate: new Date(app.created_at).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
        }),
        timeline: baseTimeline,
      };

      navigation.navigate('Postulaciones', {
        screen: 'ApplicationStatus',
        params: {
          application: mappedApp,
          userRole: 'candidate',
        },
      });
    } catch (e) {
      console.error('Error navigating to application progress:', e);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString(), content: '[DELETED]' })
        .eq('id', messageId);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, deletedAt: new Date().toISOString(), text: 'Este mensaje fue eliminado' } : m
        )
      );
    } catch (e) {
      console.error('Delete message error:', e);
    }
  };

  const MessageBubble = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUserId;
    const isDeleted = !!item.deletedAt;

    const translateX = useSharedValue(0);
    const context = useSharedValue({ x: 0 });

    const gesture = Gesture.Pan()
      .activeOffsetX([0, 10])
      .failOffsetY([-5, 5])
      .onStart(() => {
        context.value = { x: translateX.value };
      })
      .onUpdate((event) => {
        if (event.translationX > 0) {
          translateX.value = Math.min(event.translationX, 100);
        }
      })
      .onEnd(() => {
        if (translateX.value > 60) {
          runOnJS(Vibration.vibrate)(15);
          runOnJS(setReplyingTo)(item);
        }
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    const replyIconStyle = useAnimatedStyle(() => ({
      opacity: interpolate(translateX.value, [0, 50], [0, 1]),
      transform: [{ scale: interpolate(translateX.value, [0, 50], [0.5, 1]) }],
    }));

    const handleLongPress = (event: any) => {
      if (isDeleted) return;
      const { pageX, pageY } = event.nativeEvent;
      const menuX = pageX > SCREEN_WIDTH * 0.6 ? pageX - 160 : pageX;
      const menuY = pageY > 450 ? pageY - 140 : pageY;

      runOnJS(setMenuData)({ message: item, x: menuX, y: menuY });
      runOnJS(setMenuVisible)(true);
    };

    const parentMessage = item.replyToId
      ? messages.find((m) => m.id === item.replyToId)
      : null;

    return (
      <View style={styles.msgWrapper}>
        <Animated.View style={[styles.replyIndicator, replyIconStyle]}>
          <Ionicons name="arrow-undo" size={20} color={ACCENT_COLOR} />
        </Animated.View>

        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[styles.msgContainer, isMe ? styles.msgMe : styles.msgOther, animatedStyle]}>
            <TouchableOpacity
              onLongPress={(e) => handleLongPress(e)}
              activeOpacity={0.9}
              disabled={isDeleted}
              delayLongPress={350}>
              
              {parentMessage && (
                <View
                  style={[
                    styles.replyContext,
                    isMe ? styles.replyContextMe : styles.replyContextOther,
                  ]}>
                  <Text style={styles.replyName} numberOfLines={1}>
                    {parentMessage.senderId === currentUserId ? 'Tú' : participant.name}
                  </Text>
                  <Text style={styles.replyText} numberOfLines={1}>
                    {parentMessage.text}
                  </Text>
                </View>
              )}

              {item.type === 'image' && !isDeleted && item.mediaUrl && (
                <Image source={{ uri: item.mediaUrl }} style={styles.msgImage} resizeMode="cover" />
              )}

              {item.type === 'file' && !isDeleted && item.mediaUrl && (
                <TouchableOpacity
                  style={styles.fileContainer}
                  onPress={() => Linking.openURL(item.mediaUrl!)}>
                  <Feather name="file-text" size={32} color={isMe ? 'white' : ACCENT_COLOR} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'white' }} numberOfLines={1}>
                      {item.mediaUrl.split('/').pop() || 'Archivo'}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#94a3b8' }}>
                      {item.mediaUrl.toLowerCase().endsWith('.docx') || item.mediaUrl.toLowerCase().endsWith('.doc')
                        ? 'Documento Word'
                        : 'Documento PDF'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {item.type !== 'image' && item.type !== 'file' && (
                <Text
                  style={[
                    styles.msgText,
                    isMe ? styles.textMe : styles.textOther,
                    isDeleted ? styles.textDeleted : null,
                  ]}>
                  {isDeleted ? 'Este mensaje fue eliminado' : item.text}
                </Text>
              )}

              <Text style={[styles.timestamp, isMe ? styles.tsMe : styles.tsOther]}>
                {item.timestamp}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.participantInfo}
            onPress={handleHeaderPress}
            activeOpacity={0.7}>
            <View style={styles.avatarContainer}>
              {participant.avatar && participant.avatar.trim() !== '' ? (
                <Image source={{ uri: participant.avatar }} style={styles.headerAvatar} />
              ) : (
                <View style={[styles.headerAvatar, { alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={styles.avatarInitial}>
                    {participant.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {participant.isOnline && <View style={styles.onlineDot} />}
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.participantName}>{participant.name}</Text>
              <Text style={styles.participantRole}>
                {participant.isOnline ? 'En línea' : 'Desconectado'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => <MessageBubble item={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />

          {replyingTo && (
            <View style={styles.replyPreview}>
              <View style={styles.replyBar} />
              <View style={{ flex: 1, paddingHorizontal: 15 }}>
                <Text style={styles.replyPreviewName}>
                  Respondiendo a{' '}
                  {replyingTo.senderId === currentUserId ? 'ti mismo' : participant.name}
                </Text>
                <Text style={styles.replyPreviewText} numberOfLines={1}>
                  {replyingTo.text}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.closeReply}>
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            {showEmojiPicker && (
              <View style={styles.emojiContainer}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={quickEmojis}
                  keyExtractor={(item) => item}
                  contentContainerStyle={styles.emojiScroll}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.emojiItem}
                      onPress={() => {
                        setInputText((prev) => prev + item);
                      }}>
                      <Text style={styles.emojiText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.attachmentBtn}
                onPress={() => setAttachmentMenuVisible(true)}>
                <Ionicons name="add" size={24} color={ACCENT_COLOR} />
              </TouchableOpacity>

              <TextInput
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#64748b"
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />

              <TouchableOpacity
                style={{ padding: 8, marginRight: 4 }}
                onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
                <Ionicons name="happy-outline" size={22} color={showEmojiPicker ? ACCENT_COLOR : '#64748b'} />
              </TouchableOpacity>

              {isUploading ? (
                <View style={styles.sendBtn}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={!inputText.trim()}
                  style={[
                    styles.sendBtn,
                    { backgroundColor: inputText.trim() ? ACCENT_COLOR : '#333' },
                  ]}>
                  <Ionicons name="send" size={18} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>

        <ObsidianConfirm
          visible={confirmVisible}
          title={confirmData?.title || ''}
          message={confirmData?.message || ''}
          onConfirm={confirmData?.onConfirm || (() => {})}
          onCancel={() => setConfirmVisible(false)}
          type={confirmData?.type}
        />

        {menuVisible && menuData && (
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}>
            <View style={[styles.contextMenu, { top: menuData.y, left: menuData.x }]}>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setReplyingTo(menuData.message);
                  setMenuVisible(false);
                }}>
                <Ionicons name="arrow-undo-outline" size={18} color="white" />
                <Text style={styles.menuOptionText}>Responder</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  showToast('Mensaje copiado', 'success');
                  setMenuVisible(false);
                }}>
                <Ionicons name="copy-outline" size={18} color="white" />
                <Text style={styles.menuOptionText}>Copiar</Text>
              </TouchableOpacity>

              {menuData.message.senderId === currentUserId && (
                <>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity
                    style={styles.menuOption}
                    onPress={() => {
                      setMenuVisible(false);
                      setConfirmData({
                        title: 'ELIMINAR MENSAJE',
                        message: '¿Borrar para todos?',
                        onConfirm: () => {
                          deleteMessage(menuData.message.id);
                          setConfirmVisible(false);
                        },
                        type: 'danger',
                      });
                      setConfirmVisible(true);
                    }}>
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    <Text style={[styles.menuOptionText, { color: '#FF3B30' }]}>Eliminar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        )}

        <Modal
          visible={isAttachmentMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAttachmentMenuVisible(false)}>
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setAttachmentMenuVisible(false)}>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                backgroundColor: '#121214',
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.1)',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 24,
                paddingBottom: 40,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 24,
                  textAlign: 'center',
                }}>
                Adjuntar archivo
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => handleAttachImage(true)}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: 'rgba(0,163,255,0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}>
                    <Feather name="camera" size={24} color="#00A3FF" />
                  </View>
                  <Text style={{ color: '#cbd5e1', fontSize: 12 }}>Cámara</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => handleAttachImage(false)}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: 'rgba(168,85,247,0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}>
                    <Feather name="image" size={24} color="#a855f7" />
                  </View>
                  <Text style={{ color: '#cbd5e1', fontSize: 12 }}>Fototeca</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => handleAttachDocument()}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: 'rgba(249,115,22,0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}>
                    <Feather name="file-text" size={24} color="#f97316" />
                  </View>
                  <Text style={{ color: '#cbd5e1', fontSize: 12 }}>Archivo</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    backgroundColor: '#1A1A1C',
  },
  backBtn: { marginRight: 12 },
  participantInfo: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155' },
  avatarInitial: { color: '#94a3b8', fontWeight: 'bold' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: '#22c55e',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1A1A1C',
  },
  participantName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  participantRole: {
    color: ACCENT_COLOR,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  msgWrapper: { position: 'relative', marginBottom: 16 },
  replyIndicator: { position: 'absolute', left: -40, top: '40%' },
  msgContainer: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  msgMe: { alignSelf: 'flex-end', backgroundColor: ACCENT_COLOR, borderBottomRightRadius: 4 },
  msgOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#121214',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  msgText: { fontSize: 14, lineHeight: 20 },
  textMe: { color: 'white' },
  textOther: { color: 'white' },
  textDeleted: { fontStyle: 'italic', opacity: 0.5 },
  timestamp: { fontSize: 9, marginTop: 4 },
  tsMe: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  tsOther: { color: '#64748b' },

  replyContext: { padding: 8, borderRadius: 12, marginBottom: 8, borderLeftWidth: 3 },
  replyContextMe: { backgroundColor: 'rgba(0,0,0,0.2)', borderLeftColor: 'white' },
  replyContextOther: { backgroundColor: 'rgba(255,255,255,0.05)', borderLeftColor: ACCENT_COLOR },
  replyName: { fontSize: 11, fontWeight: '900', color: ACCENT_COLOR },
  replyText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  msgImage: { width: 240, height: 180, borderRadius: 16, marginBottom: 8 },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },

  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
    backgroundColor: '#1A1A1C',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121214',
    padding: 6,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  attachmentBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#1A1A1C',
  },
  input: { flex: 1, color: 'white', fontSize: 14, paddingHorizontal: 12, maxHeight: 100 },
  sendBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },

  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#0F0F10',
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
  },
  replyBar: {
    width: 4,
    height: 32,
    backgroundColor: ACCENT_COLOR,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  replyPreviewName: { color: ACCENT_COLOR, fontWeight: '900', fontSize: 11 },
  replyPreviewText: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  closeReply: { padding: 10 },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  contextMenu: {
    position: 'absolute',
    width: 170,
    backgroundColor: '#1E1E20',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuOptionText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 12,
  },
  emojiContainer: {
    paddingVertical: 10,
    backgroundColor: '#0c0c0e',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    marginBottom: 8,
  },
  emojiScroll: {
    paddingHorizontal: 8,
    gap: 12,
  },
  emojiItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emojiText: {
    fontSize: 20,
  },
});
