import React, { useRef, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, TextInput, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Conversation, Message, currentUser } from './mockData';

export const ChatDetailScreen = ({ route, navigation }: any) => {
  const { conversation } = route.params as { conversation: Conversation };
  const { participant } = conversation;
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Clear unread count when opening the chat
  useEffect(() => {
    if (conversation.unreadCount > 0) {
      conversation.unreadCount = 0;
    }
  }, [conversation]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    // Mutate the global mock object so it persists across navigations
    conversation.messages.push(newMessage);
    conversation.lastMessage = newMessage.text || 'Message sent';
    conversation.timestamp = newMessage.timestamp;

    setMessages([...conversation.messages]);
    setInputText('');
    
    // Simulate auto scroll
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isMe = item.senderId === currentUser.id;
    const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId === currentUser.id);

    return (
      <View className={`flex-row mb-4 px-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
           <View className="w-8 mr-2 justify-end pb-1">
             {showAvatar && (
                <View className="w-8 h-8 rounded-full bg-slate-200 justify-center items-center overflow-hidden">
                    {participant.avatar ? 
                       <Image source={{uri: participant.avatar}} className="w-full h-full" />
                     : <Text className="text-slate-600 font-bold text-xs">{participant.name[0]}</Text>
                    }
                </View>
             )}
           </View>
        )}
        
        <View className={`max-w-[75%] rounded-2xl p-3 ${isMe ? 'bg-blue-600 rounded-br-sm' : 'bg-white border border-slate-100 shadow-sm rounded-bl-sm dark:bg-slate-800 dark:border-slate-700'}`}>
          {item.type === 'text' && (
            <Text className={`text-[15px] leading-5 ${isMe ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
              {item.text}
            </Text>
          )}
          
          {item.type === 'map' && item.mapData && (
             <View className="w-64 rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                <Image source={{ uri: item.mapData.imageUri }} className="w-full h-32" resizeMode="cover" />
                <View className="p-3 bg-white">
                   <Text className="font-bold text-slate-900 mb-1">{item.mapData.title}</Text>
                   <Text className="text-slate-500 text-xs mb-3">{item.mapData.address}</Text>
                   <TouchableOpacity className="flex-row items-center justify-center py-2 bg-blue-50 rounded-lg">
                      <Feather name="navigation" size={14} color="#2563eb" className="mr-1" />
                      <Text className="text-blue-600 font-medium text-sm">Ver en Mapas</Text>
                   </TouchableOpacity>
                </View>
             </View>
          )}
          
          <Text className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
             {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-1">
          <Feather name="arrow-left" size={24} color="#0f172a" className="dark:text-white" />
        </TouchableOpacity>
        
        <View className="flex-row items-center flex-1">
           <View className="w-10 h-10 rounded-full bg-orange-100 justify-center items-center mr-3">
              <Text className="text-orange-600 font-bold">{participant.name.substring(0, 2).toUpperCase()}</Text>
           </View>
           <View>
              <Text className="font-bold text-base text-slate-900 dark:text-white flex-row items-center">
                 {participant.name}
                 {participant.isVerified && <Ionicons name="checkmark-circle" size={14} color="#10b981" className="ml-1" />}
              </Text>
              {participant.isOnline && (
                 <Text className="text-green-500 text-xs font-medium">En línea</Text>
              )}
           </View>
        </View>
        
        <TouchableOpacity className="p-2 ml-2">
            <Feather name="phone" size={20} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 ml-1">
            <Feather name="more-vertical" size={20} color="#64748b" />
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
            <View className="bg-slate-200/50 dark:bg-slate-800 px-3 py-1 rounded-full">
              <Text className="text-slate-500 font-medium text-xs">HOY</Text>
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
        <View className="flex-row items-center bg-white dark:bg-slate-900 px-4 py-3 border-t border-slate-200 dark:border-slate-800">
           <TouchableOpacity className="p-2">
              <Feather name="plus-circle" size={24} color="#64748b" />
           </TouchableOpacity>
           
           <View className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 mx-2 flex-row items-center border border-slate-200 dark:border-slate-700">
              <TextInput
                className="flex-1 text-slate-800 dark:text-slate-200 text-base max-h-24 pt-0 pb-0"
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#94a3b8"
                multiline
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity className="ml-2 p-1">
                 <Feather name="smile" size={20} color="#94a3b8" />
              </TouchableOpacity>
           </View>
           
           <TouchableOpacity 
             className={`w-11 h-11 rounded-full items-center justify-center ${inputText.trim() ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}
             onPress={sendMessage}
             disabled={!inputText.trim()}
           >
              <Feather name="send" size={18} color={inputText.trim() ? "white" : "#94a3b8"} className="mr-0.5 mt-0.5" />
           </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
