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
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';

import { useBusinessChat } from '../../lib/BusinessChatContext';

export const BusinessChatDetailScreen = ({ route, navigation }: any) => {
  const { conversation: initialConversation } = route.params;
  const { conversations, sendMessage } = useBusinessChat();
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Find the live conversation object from context
  const conversation = conversations.find(c => c.id === initialConversation.id) || initialConversation;
  const messages = conversation.messages || [];

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(conversation.id, message);
    setMessage('');
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === 'me';
    
    return (
      <View className={`flex-row mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <View className="w-8 h-8 rounded-full bg-slate-200 mr-2 overflow-hidden self-end mb-1">
             {conversation.participant.avatar && (
                 <Image source={{ uri: conversation.participant.avatar }} className="w-full h-full" />
             )}
          </View>
        )}
        <View 
          className={`max-w-[80%] p-4 rounded-[25px] ${
            isMe 
              ? 'bg-blue-600 rounded-br-none' 
              : 'bg-slate-100 dark:bg-slate-800 rounded-bl-none'
          }`}
          style={{
            shadowColor: isMe ? '#2563eb' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isMe ? 0.3 : 0.05,
            shadowRadius: 5,
            elevation: isMe ? 4 : 1
          }}
        >
          <Text className={`${isMe ? 'text-white' : 'text-slate-800 dark:text-slate-200'} text-sm leading-5`}>
            {item.text}
          </Text>
          <Text className={`text-[9px] mt-1 ${isMe ? 'text-white/70 text-right' : 'text-slate-400'}`}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Header */}
        <View className="px-5 py-3 flex-row items-center border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1e293b" className="dark:text-white" />
          </TouchableOpacity>
          
          <View className="flex-row flex-1 items-center">
             <View className="relative">
                <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center overflow-hidden">
                    {conversation.participant.avatar ? (
                        <Image source={{ uri: conversation.participant.avatar }} className="w-full h-full" />
                    ) : (
                        <Text className="text-slate-400 font-bold">
                            {conversation.participant.name.charAt(0)}
                        </Text>
                    )}
                </View>
                {conversation.participant.isOnline && (
                    <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
             </View>
             
             <View className="ml-3">
                <Text className="text-slate-900 dark:text-white font-bold text-base">{conversation.participant.name}</Text>
                <Text className="text-blue-600 text-[10px] font-black uppercase tracking-tighter">{conversation.participant.role}</Text>
             </View>
          </View>

          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Feather name="more-vertical" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />

          {/* Footer Input */}
          <View className="p-4 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 mb-2">
            <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-[30px] border border-slate-100 dark:border-slate-700">
              <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-sm mr-2">
                <Ionicons name="add" size={24} color="#3b82f6" />
              </TouchableOpacity>
              
              <TextInput
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#94a3b8"
                className="flex-1 text-slate-800 dark:text-white text-sm px-2"
                value={message}
                onChangeText={setMessage}
                multiline
              />
              
              <TouchableOpacity 
                onPress={handleSend}
                disabled={!message.trim()}
                className={`w-10 h-10 items-center justify-center rounded-full ${message.trim() ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <Ionicons name="send" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

      </SafeAreaView>
    </View>
  );
};
