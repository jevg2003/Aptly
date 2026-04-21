import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Conversation } from '../../screens/chat/mockData';
import { BusinessConversation } from '../../lib/BusinessChatContext';

interface ChatListItemProps {
  conversation: Conversation | BusinessConversation;
  onPress: (conversation: any) => void;
}

export const ChatListItem = ({ conversation, onPress }: ChatListItemProps) => {
  const { participant, lastMessage, timestamp, unreadCount } = conversation;
  
  // Extract initials for fallback avatar
  const initials = participant.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity 
      onPress={() => onPress(conversation)}
      className="flex-row items-center bg-[#121214] mx-4 my-1.5 p-4 rounded-[24px] border border-white/5"
      activeOpacity={0.7}
    >
      <View className="w-14 h-14 rounded-full bg-slate-800 items-center justify-center overflow-hidden border border-white/5">
        {participant.avatar ? (
           <Image source={{ uri: participant.avatar }} className="w-full h-full" />
        ) : (
          <Text className="text-slate-400 font-bold text-lg">{initials}</Text>
        )}
      </View>
      
      <View className="flex-1 ml-4 justify-center">
        <View className="flex-row justify-between items-start mb-0.5">
          <View className="flex-1 mr-2">
            <Text className="text-white font-bold text-base" numberOfLines={1}>
              {participant.name}
            </Text>
            {(conversation as BusinessConversation).jobTitle && (
              <Text className="text-[#FF005C] text-[10px] font-black uppercase tracking-widest mt-0.5" numberOfLines={1}>
                {(conversation as BusinessConversation).jobTitle}
              </Text>
            )}
          </View>
          <View className="items-end">
            <Text className="text-slate-500 text-[11px] mt-1">
              {timestamp}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center pr-1">
           <Text 
             className={`text-sm flex-1 mr-2 ${unreadCount > 0 ? 'text-white font-black' : 'text-slate-500'}`}
             numberOfLines={1}
           >
              {lastMessage}
           </Text>
           {unreadCount > 0 && (
             <View className="bg-[#FF005C] rounded-full min-w-[20px] h-[20px] items-center justify-center px-1.5 shadow-[0_0_10px_rgba(255,0,92,0.3)]">
               <Text className="text-white text-[10px] font-black">{unreadCount > 99 ? '99+' : unreadCount}</Text>
             </View>
           )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
