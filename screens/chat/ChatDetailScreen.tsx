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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Conversation, Message } from './mockData';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { uploadAvatar, uploadDocument } from '../../lib/storageUtils';

export const ChatDetailScreen = ({ route, navigation }: any) => {
  const { roomId, oppositeUserId, participant } = route.params;
  const session = React.useContext(SessionContext);
  const currentUserId = session?.user?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAttachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
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
              },
            ];
          });

          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
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

    try {
      await supabase.from('messages').insert({
        room_id: roomId,
        sender_id: currentUserId,
        content: textToSend,
        is_read: false,
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

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === currentUserId;
    const showAvatar =
      !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId === currentUserId);

    return (
      <View className={`mb-4 flex-row px-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <View className="mr-2 w-8 justify-end pb-1">
            {showAvatar && (
              <View className="h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/5 bg-slate-800">
                {participant.avatar ? (
                  <Image source={{ uri: participant.avatar }} className="h-full w-full" />
                ) : (
                  <Text className="text-xs font-bold text-slate-400">{participant.name[0]}</Text>
                )}
              </View>
            )}
          </View>
        )}

        <View
          className={`max-w-[75%] rounded-[20px] p-3.5 ${isMe ? 'rounded-br-none bg-[#00A3FF]' : 'rounded-bl-none border border-white/5 bg-[#121214]'}`}>
          {item.type === 'text' && (
            <Text className={`text-[15px] leading-5 ${isMe ? 'text-white' : 'text-slate-200'}`}>
              {item.text}
            </Text>
          )}

          {item.type === 'image' && item.mediaUrl && (
            <View>
              <Image
                source={{ uri: item.mediaUrl }}
                className="mb-1 h-48 w-48 rounded-lg"
                resizeMode="cover"
              />
              <Text className={`text-[12px] italic ${isMe ? 'text-white/80' : 'text-slate-400'}`}>
                Foto
              </Text>
            </View>
          )}

          {item.type === 'file' && item.mediaUrl && (
            <TouchableOpacity
              className="flex-row items-center rounded-lg bg-black/20 p-2"
              onPress={() => Linking.openURL(item.mediaUrl!)}>
              <Feather
                name="file-text"
                size={24}
                color={isMe ? 'white' : '#f97316'}
                className="mr-2"
              />
              <Text
                className={`shrink text-sm font-bold ${isMe ? 'text-white' : 'text-slate-200'}`}
                numberOfLines={1}>
                Ver Documento {item.mediaUrl?.toLowerCase().endsWith('.docx') || item.mediaUrl?.toLowerCase().endsWith('.doc') ? '(Word)' : '(PDF)'}
              </Text>
            </TouchableOpacity>
          )}

          {item.type === 'map' && item.mapData && (
            <View className="w-64 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1c]">
              <Image
                source={{ uri: item.mapData.imageUri }}
                className="h-32 w-full"
                resizeMode="cover"
              />
              <View className="bg-[#121214] p-3">
                <Text className="mb-1 font-bold text-white">{item.mapData.title}</Text>
                <Text className="mb-3 text-xs text-slate-500">{item.mapData.address}</Text>
                <TouchableOpacity className="flex-row items-center justify-center rounded-lg border border-white/5 bg-white/5 py-2">
                  <Feather name="navigation" size={14} color="#00A3FF" className="mr-1" />
                  <Text className="text-sm font-black uppercase tracking-tighter text-[#00A3FF]">
                    Ver en Mapas
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text
            className={`mt-1 text-right text-[10px] ${isMe ? 'text-white/70' : 'text-slate-500'}`}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#050505]" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View className="flex-row items-center border-b border-white/5 bg-[#050505] px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-1">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-slate-800">
              <Text className="font-bold text-slate-400">
                {participant.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text className="flex-row items-center text-base font-bold text-white">
                {participant.name}
                {participant.isVerified && (
                  <Ionicons name="checkmark-circle" size={14} color="#00A3FF" className="ml-1" />
                )}
              </Text>
              {participant.isOnline && (
                <Text className="text-[10px] font-black uppercase tracking-widest text-green-500">
                  En línea
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity className="ml-2 p-2">
            <Feather name="phone" size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity className="ml-1 p-2">
            <Feather name="more-vertical" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Chat messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListHeaderComponent={
            <View className="mb-6 items-center">
              <View className="rounded-full border border-white/5 bg-white/5 px-3 py-1">
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  HOY
                </Text>
              </View>
            </View>
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input area */}
        <View className="flex-row items-center border-t border-white/5 bg-[#050505] px-4 py-4">
          <TouchableOpacity className="p-2" onPress={() => setAttachmentMenuVisible(true)}>
            <Feather name="plus-circle" size={24} color="#64748b" />
          </TouchableOpacity>

          <View className="mx-2 flex-1 flex-row items-center rounded-[24px] border border-white/5 bg-[#121214] px-4 py-2">
            <TextInput
              className="max-h-24 flex-1 pb-0 pt-0 text-base text-slate-200"
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#475569"
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity className="ml-2 p-1">
              <Feather name="smile" size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          {isUploading ? (
            <View className="h-11 w-11 items-center justify-center">
              <ActivityIndicator size="small" color="#00A3FF" />
            </View>
          ) : (
            <TouchableOpacity
              className={`h-11 w-11 items-center justify-center rounded-full ${inputText.trim() ? 'bg-[#00A3FF]' : 'bg-[#121214]'}`}
              onPress={sendMessage}
              disabled={!inputText.trim()}>
              <Feather
                name="send"
                size={18}
                color={inputText.trim() ? 'white' : '#475569'}
                className="mr-0.5 mt-0.5"
              />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Modal */}
      <Modal
        visible={isAttachmentMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAttachmentMenuVisible(false)}>
        <Pressable
          className="flex-1 justify-end bg-black/60"
          onPress={() => setAttachmentMenuVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            className="rounded-t-3xl border-t border-white/10 bg-[#121214] p-6 pb-10">
            <Text className="mb-6 text-center text-lg font-bold text-white">Adjuntar archivo</Text>

            <View className="flex-row justify-around">
              <TouchableOpacity className="items-center" onPress={() => handleAttachImage(true)}>
                <View className="mb-2 h-14 w-14 items-center justify-center rounded-full bg-[#00A3FF]/20">
                  <Feather name="camera" size={24} color="#00A3FF" />
                </View>
                <Text className="text-xs text-slate-300">Cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center" onPress={() => handleAttachImage(false)}>
                <View className="mb-2 h-14 w-14 items-center justify-center rounded-full bg-purple-500/20">
                  <Feather name="image" size={24} color="#a855f7" />
                </View>
                <Text className="text-xs text-slate-300">Fototeca</Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center" onPress={() => handleAttachDocument()}>
                <View className="mb-2 h-14 w-14 items-center justify-center rounded-full bg-orange-500/20">
                  <Feather name="file-text" size={24} color="#f97316" />
                </View>
                <Text className="text-xs text-slate-300">Archivo</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};
