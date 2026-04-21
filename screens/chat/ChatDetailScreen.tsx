import React, { useRef, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, TextInput, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Conversation, Message } from './mockData';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';

export const ChatDetailScreen = ({ route, navigation }: any) => {
  const { roomId, oppositeUserId, participant } = route.params;
  const session = React.useContext(SessionContext);
  const currentUserId = session?.user?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Fetch initial messages and set up subscription
  useEffect(() => {
    if (!roomId || !currentUserId) return;

    // 1. Fetch histórico
    const fetchMessages = async () => {
       const { data, error } = await supabase
         .from('messages')
         .select('*')
         .eq('room_id', roomId)
         .order('created_at', { ascending: true }); // older first for chat view
         
       if (!error && data) {
          const mapped: Message[] = data.map(m => ({
             id: m.id,
             senderId: m.sender_id,
             text: m.content || '',
             timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             type: 'text'
          }));
          setMessages(mapped);
          
          // Mark as read
          await supabase.from('messages').update({ is_read: true }).eq('room_id', roomId).neq('sender_id', currentUserId);
       }
    };
    
    fetchMessages();

    // 2. Suscripción en Tiempo Real
    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const newMsg = payload.new;
          // Avoid duplicating if we sent it
          setMessages(prev => {
             // Basic deduplication if id matches
             if (prev.find(m => m.id === newMsg.id)) return prev;
             
             return [...prev, {
                id: newMsg.id,
                senderId: newMsg.sender_id,
                text: newMsg.content || '',
                timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'text'
             }];
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
          is_read: false
       });
       
       setTimeout(() => {
         flatListRef.current?.scrollToEnd({ animated: true });
       }, 100);
    } catch (e) { console.error('Send error:', e); }
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isMe = item.senderId === currentUserId;
    const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId === currentUserId);

    return (
      <View className={`flex-row mb-4 px-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
           <View className="w-8 mr-2 justify-end pb-1">
             {showAvatar && (
                <View className="w-8 h-8 rounded-full bg-slate-800 justify-center items-center overflow-hidden border border-white/5">
                    {participant.avatar ? 
                       <Image source={{uri: participant.avatar}} className="w-full h-full" />
                     : <Text className="text-slate-400 font-bold text-xs">{participant.name[0]}</Text>
                    }
                </View>
             )}
           </View>
        )}
        
        <View className={`max-w-[75%] rounded-[20px] p-3.5 ${isMe ? 'bg-[#00A3FF] rounded-br-none' : 'bg-[#121214] border border-white/5 rounded-bl-none'}`}>
          {item.type === 'text' && (
            <Text className={`text-[15px] leading-5 ${isMe ? 'text-white' : 'text-slate-200'}`}>
              {item.text}
            </Text>
          )}
          
          {item.type === 'map' && item.mapData && (
             <View className="w-64 rounded-xl overflow-hidden bg-[#1a1a1c] border border-white/10">
                <Image source={{ uri: item.mapData.imageUri }} className="w-full h-32" resizeMode="cover" />
                <View className="p-3 bg-[#121214]">
                   <Text className="font-bold text-white mb-1">{item.mapData.title}</Text>
                   <Text className="text-slate-500 text-xs mb-3">{item.mapData.address}</Text>
                   <TouchableOpacity className="flex-row items-center justify-center py-2 bg-white/5 rounded-lg border border-white/5">
                      <Feather name="navigation" size={14} color="#00A3FF" className="mr-1" />
                      <Text className="text-[#00A3FF] font-black text-sm uppercase tracking-tighter">Ver en Mapas</Text>
                   </TouchableOpacity>
                </View>
             </View>
          )}
          
          <Text className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-slate-500'}`}>
             {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#050505]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-[#050505] border-b border-white/5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-1">
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row items-center flex-1">
           <View className="w-10 h-10 rounded-full bg-slate-800 justify-center items-center mr-3 border border-white/5">
              <Text className="text-slate-400 font-bold">{participant.name.substring(0, 2).toUpperCase()}</Text>
           </View>
           <View>
              <Text className="font-bold text-base text-white flex-row items-center">
                 {participant.name}
                 {participant.isVerified && <Ionicons name="checkmark-circle" size={14} color="#00A3FF" className="ml-1" />}
              </Text>
              {participant.isOnline && (
                 <Text className="text-green-500 text-[10px] font-black uppercase tracking-widest">En línea</Text>
              )}
           </View>
        </View>
        
        <TouchableOpacity className="p-2 ml-2">
            <Feather name="phone" size={20} color="#94a3b8" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 ml-1">
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
          <View className="items-center mb-6">
            <View className="bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest">HOY</Text>
            </View>
          </View>
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View className="flex-row items-center bg-[#050505] px-4 py-4 border-t border-white/5">
           <TouchableOpacity className="p-2">
              <Feather name="plus-circle" size={24} color="#64748b" />
           </TouchableOpacity>
           
           <View className="flex-1 bg-[#121214] rounded-[24px] px-4 py-2 mx-2 flex-row items-center border border-white/5">
              <TextInput
                className="flex-1 text-slate-200 text-base max-h-24 pt-0 pb-0"
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
           
           <TouchableOpacity 
             className={`w-11 h-11 rounded-full items-center justify-center ${inputText.trim() ? 'bg-[#00A3FF]' : 'bg-[#121214]'}`}
             onPress={sendMessage}
             disabled={!inputText.trim()}
           >
              <Feather name="send" size={18} color={inputText.trim() ? "white" : "#475569"} className="mr-0.5 mt-0.5" />
           </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
