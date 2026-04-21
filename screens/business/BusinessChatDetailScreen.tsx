import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  interpolate
} from 'react-native-reanimated';

import { useBusinessChat } from '../../lib/BusinessChatContext';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/common/ObsidianToast';
import { ObsidianConfirm } from '../../components/common/ObsidianConfirm';
import { CandidateResumePreview } from '../../components/profiles/CandidateResumePreview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BusinessChatDetailScreen = ({ route, navigation }: any) => {
  const { conversation: initialConversation, conversationId, autoMessage } = route.params || {};
  const { conversations, sendMessage, markAsRead, deleteMessage } = useBusinessChat();
  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmData, setConfirmData] = useState<any>(null);
  const [resumeVisible, setResumeVisible] = useState(false);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuData, setMenuData] = useState<{ message: any, x: number, y: number } | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Find the live conversation object from context
  const conversation = conversations?.find((c: any) => 
    c.id === (initialConversation?.id || conversationId)
  ) || initialConversation;

  const messages = conversation?.messages || [];

  // Timeout for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!conversation) {
        setLoadingError(true);
      }
    }, 3500); 
    return () => clearTimeout(timer);
  }, [conversation]);

  // Auto-send message if provided via params
  useEffect(() => {
    if (autoMessage && conversation?.id && messages.length === 0) {
      sendMessage(conversation.id, autoMessage);
    }
  }, [autoMessage, conversation?.id]);

  useEffect(() => {
    if (conversation?.id) {
      markAsRead(conversation.id);
    }
  }, [messages.length, conversation?.id, markAsRead]);

  const fetchExperiences = async () => {
    if (!conversation?.participant.id) return;
    try {
      const { data } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', conversation.participant.id)
        .order('start_date', { ascending: false });
      setExperiences(data || []);
    } catch (err) {
      console.error('Error fetching experiences:', err);
    }
  };

  useEffect(() => {
    if (resumeVisible) {
      fetchExperiences();
    }
  }, [resumeVisible]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    
    const options: any = {};
    if (replyingTo) {
      options.replyToId = replyingTo.id;
    }

    if (conversation?.id) {
      sendMessage(conversation.id, messageText, options);
      setMessageText('');
      setReplyingTo(null);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadFile(result.assets[0].uri, 'image');
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.assets) {
      uploadFile(result.assets[0].uri, 'file', result.assets[0].name);
    }
  };

  const uploadFile = async (uri: string, type: 'image' | 'file', name?: string) => {
    try {
      setUploading(true);
      const filename = name || `${Date.now()}.${type === 'image' ? 'jpg' : 'pdf'}`;
      const path = `${conversation.id}/${filename}`;

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: filename,
        type: type === 'image' ? 'image/jpeg' : 'application/pdf',
      } as any);

      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(path, formData);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(path);

      sendMessage(conversation.id, type === 'image' ? 'Sent an image' : `Document: ${filename}`, {
        type,
        metadata: { url: publicUrl, name: filename }
      });

    } catch (err) {
      console.error('Upload error:', err);
      showToast('No se pudo subir el archivo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const MessageBubble = ({ item }: { item: any }) => {
    const isMe = item.senderId === 'me';
    const isDeleted = !!item.deletedAt;
    
    // Gesture for Swipe to Reply
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
      .onEnd((event) => {
        if (translateX.value > 60) {
          runOnJS(setReplyingTo)(item);
        }
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }]
    }));

    const replyIconStyle = useAnimatedStyle(() => ({
      opacity: interpolate(translateX.value, [0, 50], [0, 1]),
      transform: [{ scale: interpolate(translateX.value, [0, 50], [0.5, 1]) }]
    }));

    const handleLongPress = (event: any) => {
      if (isDeleted) return;
      
      const { pageX, pageY } = event.nativeEvent;
      // Localized position calculation
      const menuX = pageX > SCREEN_WIDTH * 0.6 ? pageX - 160 : pageX;
      const menuY = pageY > 450 ? pageY - 140 : pageY;

      runOnJS(setMenuData)({ message: item, x: menuX, y: menuY });
      runOnJS(setMenuVisible)(true);
    };
    const parentMessage = item.replyToId ? messages.find(m => m.id === item.replyToId) : null;

    return (
      <View style={styles.msgWrapper}>
        <Animated.View style={[styles.replyIndicator, replyIconStyle]}>
           <Ionicons name="arrow-undo" size={20} color="#FF005C" />
        </Animated.View>

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.msgContainer, isMe ? styles.msgMe : styles.msgOther, animatedStyle]}>
            <TouchableOpacity 
              onLongPress={(e) => handleLongPress(e)} 
              activeOpacity={0.9} 
              disabled={isDeleted}
              delayLongPress={350}
            >
              
              {/* Replying to Context */}
              {parentMessage && (
                <View style={[styles.replyContext, isMe ? styles.replyContextMe : styles.replyContextOther]}>
                   <Text style={styles.replyName} numberOfLines={1}>
                     {parentMessage.senderId === 'me' ? 'Tú' : conversation.participant.name}
                   </Text>
                   <Text style={styles.replyText} numberOfLines={1}>{parentMessage.text}</Text>
                </View>
              )}

              {/* Multimedia Content */}
              {item.type === 'image' && !isDeleted && (
                <Image source={{ uri: item.metadata?.url }} style={styles.msgImage} resizeMode="cover" />
              )}
              
              {item.type === 'file' && !isDeleted && (
                <TouchableOpacity style={styles.fileContainer} onPress={() => showToast('Abriendo archivo...', 'info')}>
                   <Ionicons name="document-text" size={32} color={isMe ? 'white' : '#FF005C'} />
                   <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.fileName, { color: isMe ? 'white' : 'white' }]}>{item.metadata?.name}</Text>
                      <Text style={styles.fileSize}>PDF Document</Text>
                   </View>
                </TouchableOpacity>
              )}

              {/* Text Content */}
              <Text style={[
                styles.msgText, 
                isMe ? styles.textMe : styles.textOther,
                isDeleted ? styles.textDeleted : null
              ]}>
                {isDeleted ? 'Este mensaje fue eliminado' : item.text}
              </Text>
              
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
      <View style={{ flex: 1, backgroundColor: '#050505' }}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            {conversation ? (
              <TouchableOpacity 
                style={styles.participantInfo} 
                onPress={() => setResumeVisible(true)}
                activeOpacity={0.7}
              >
                 <View style={styles.avatarContainer}>
                    {conversation.participant.avatar ? (
                        <Image source={{ uri: conversation.participant.avatar }} style={styles.headerAvatar} />
                    ) : (
                        <Text style={styles.avatarInitial}>{conversation.participant.name.charAt(0)}</Text>
                    )}
                 </View>
                 <View style={{ marginLeft: 12 }}>
                    <Text style={styles.participantName}>{conversation.participant.name}</Text>
                    <Text style={styles.participantRole}>
                      {conversation.jobTitle || conversation.participant.role}
                    </Text>
                 </View>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center' }}>
                 {loadingError ? (
                   <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center' }}>Error al cargar chat</Text>
                 ) : (
                   <ActivityIndicator size="small" color="#FF005C" />
                 )}
              </View>
            )}

            <TouchableOpacity style={styles.moreBtn}>
              <Feather name="more-vertical" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => <MessageBubble item={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />

            {/* Replying Preview Area */}
            {replyingTo && (
              <View style={styles.replyPreview}>
                 <View style={styles.replyBar} />
                 <View style={{ flex: 1, paddingHorizontal: 15 }}>
                    <Text style={styles.replyPreviewName}>Respondiendo a {replyingTo.senderId === 'me' ? 'ti mismo' : conversation.participant.name}</Text>
                    <Text style={styles.replyPreviewText} numberOfLines={1}>{replyingTo.text}</Text>
                 </View>
                 <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.closeReply}>
                    <Ionicons name="close" size={20} color="#94a3b8" />
                 </TouchableOpacity>
              </View>
            )}

            {/* Footer Input */}
            <View style={styles.footer}>
              <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.attachmentBtn} onPress={() => {
                  // Simplified for brevity, could use a custom bottom sheet
                  pickImage();
                }}>
                  <Ionicons name="add" size={24} color="#FF005C" />
                </TouchableOpacity>
                
                <TextInput
                  placeholder="Escribe un mensaje..."
                  placeholderTextColor="#64748b"
                  style={styles.input}
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                />
                
                <TouchableOpacity 
                  onPress={handleSend}
                  disabled={!messageText.trim() && !uploading}
                  style={[styles.sendBtn, { backgroundColor: messageText.trim() ? '#FF005C' : '#333' }]}
                >
                  {uploading ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="send" size={18} color="white" />}
                </TouchableOpacity>
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

          {/* Context Menu Overlay */}
          {menuVisible && menuData && (
            <TouchableOpacity 
              style={styles.menuOverlay} 
              activeOpacity={1} 
              onPress={() => setMenuVisible(false)}
            >
               <View 
                 style={[
                   styles.contextMenu, 
                   { top: menuData.y, left: menuData.x }
                 ]}
               >
                  <TouchableOpacity 
                    style={styles.menuOption} 
                    onPress={() => {
                      setReplyingTo(menuData.message);
                      setMenuVisible(false);
                    }}
                  >
                     <Ionicons name="arrow-undo-outline" size={18} color="white" />
                     <Text style={styles.menuOptionText}>Responder</Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity 
                    style={styles.menuOption} 
                    onPress={() => {
                      showToast('Mensaje copiado', 'success');
                      setMenuVisible(false);
                    }}
                  >
                     <Ionicons name="copy-outline" size={18} color="white" />
                     <Text style={styles.menuOptionText}>Copiar</Text>
                  </TouchableOpacity>

                  {menuData.message.senderId === 'me' && (
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
                              deleteMessage(menuData.message.id, true);
                              setConfirmVisible(false);
                            },
                            type: 'danger'
                          });
                          setConfirmVisible(true);
                        }}
                      >
                         <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                         <Text style={[styles.menuOptionText, { color: '#FF3B30' }]}>Eliminar</Text>
                      </TouchableOpacity>
                    </>
                  )}
               </View>
            </TouchableOpacity>
          )}

          {/* Profile Modal */}
          {conversation && (
            <CandidateResumePreview 
              profile={{
                id: conversation.participant.id,
                full_name: conversation.participant.name,
                avatar_url: conversation.participant.avatar,
                professional_title: conversation.participant.role
              }}
              experiences={experiences}
              onClose={() => setResumeVisible(false)}
              isVisible={resumeVisible}
            />
          )}
        </SafeAreaView>
      </View>
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
    backgroundColor: '#1A1A1C'
  },
  backBtn: { marginRight: 12 },
  participantInfo: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155' },
  avatarInitial: { color: '#94a3b8', fontWeight: 'bold' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, backgroundColor: '#22c55e', borderRadius: 6, borderSize: 2, borderColor: '#1A1A1C' },
  participantName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  participantRole: { color: '#FF005C', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  moreBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  
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
    elevation: 3
  },
  msgMe: { alignSelf: 'flex-end', backgroundColor: '#FF005C', borderBottomRightRadius: 4 },
  msgOther: { alignSelf: 'flex-start', backgroundColor: '#121214', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#1e1e1e' },
  msgText: { fontSize: 14, lineHeight: 20 },
  textMe: { color: 'white' },
  textOther: { color: 'white' },
  textDeleted: { fontStyle: 'italic', opacity: 0.5 },
  timestamp: { fontSize: 9, marginTop: 4 },
  tsMe: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  tsOther: { color: '#64748b' },
  
  replyContext: { padding: 8, borderRadius: 12, marginBottom: 8, borderLeftWidth: 3 },
  replyContextMe: { backgroundColor: 'rgba(0,0,0,0.2)', borderLeftColor: 'white' },
  replyContextOther: { backgroundColor: 'rgba(255,255,255,0.05)', borderLeftColor: '#FF005C' },
  replyName: { fontSize: 11, fontWeight: '900', color: '#FF005C' },
  replyText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  
  msgImage: { width: 240, height: 180, borderRadius: 16, marginBottom: 8 },
  fileContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)', padding: 12, borderRadius: 16, marginBottom: 8 },
  fileName: { fontSize: 13, fontWeight: 'bold' },
  fileSize: { fontSize: 10, color: '#94a3b8' },

  footer: { padding: 16, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#1e1e1e', backgroundColor: '#1A1A1C' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#121214', 
    padding: 6, 
    borderRadius: 30, 
    borderWidth: 1, 
    borderColor: '#333' 
  },
  attachmentBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#1A1A1C' },
  input: { flex: 1, color: 'white', fontSize: 14, paddingHorizontal: 12, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  
  replyPreview: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    backgroundColor: '#0F0F10', 
    borderTopWidth: 1, 
    borderTopColor: '#1e1e1e' 
  },
  replyBar: { width: 4, height: 32, backgroundColor: '#FF005C', borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  replyPreviewName: { color: '#FF005C', fontWeight: '900', fontSize: 11 },
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
});
