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
      className="mx-4 my-1.5 flex-row items-center rounded-[24px] border border-white/5 bg-[#121214] p-4"
      activeOpacity={0.7}>
      <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/5 bg-slate-800">
        {participant.avatar ? (
          <Image source={{ uri: participant.avatar }} className="h-full w-full" />
        ) : (
          <Text className="text-lg font-bold text-slate-400">{initials}</Text>
        )}
      </View>

      <View className="ml-4 flex-1 justify-center">
        <View className="mb-0.5 flex-row items-start justify-between">
          <View className="mr-2 flex-1">
            <Text className="text-base font-bold text-white" numberOfLines={1}>
              {participant.name}
            </Text>
            {(conversation as BusinessConversation).jobTitle && (
              <Text
                className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#FF005C]"
                numberOfLines={1}>
                {(conversation as BusinessConversation).jobTitle}
              </Text>
            )}
          </View>
          <View className="items-end">
            <Text className="mt-1 text-[11px] text-slate-500">{timestamp}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between pr-1">
          <Text
            className={`mr-2 flex-1 text-sm ${unreadCount > 0 ? 'font-black text-white' : 'text-slate-500'}`}
            numberOfLines={1}>
            {lastMessage}
          </Text>
          {unreadCount > 0 && (
            <View className="h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#FF005C] px-1.5 shadow-[0_0_10px_rgba(255,0,92,0.3)]">
              <Text className="text-[10px] font-black text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
