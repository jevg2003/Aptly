import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StatusBar, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SearchBar } from '../../components/chat/SearchBar';
import { ChatListItem } from '../../components/chat/ChatListItem';

import { useBusinessChat } from '../../lib/BusinessChatContext';

export const BusinessInboxScreen = ({ navigation }: any) => {
  const { conversations } = useBusinessChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredConversations = useMemo(() => {
    let result = conversations;

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.participant.name.toLowerCase().includes(lowerQuery) || 
        c.lastMessage.toLowerCase().includes(lowerQuery)
      );
    }

    return result;
  }, [searchQuery, conversations]);

  const handleConversationPress = (conversation: any) => {
    navigation.navigate('BusinessChatDetail', { conversation });
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
        <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Empresa</Text>
            <Text className="text-3xl font-black text-slate-900 dark:text-white">Mensajes</Text>
        </View>
        <TouchableOpacity className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl items-center justify-center">
          <Feather name="filter" size={20} color="#1e293b" className="dark:text-slate-200" />
        </TouchableOpacity>
      </View>

      <View className="px-2">
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      
      <View className="flex-row px-6 mb-4 mt-2">
         {['All', 'Unread', 'Matches'].map((f) => (
             <TouchableOpacity 
                key={f}
                onPress={() => setActiveFilter(f)}
                className={`mr-3 px-5 py-2 rounded-full ${activeFilter === f ? 'bg-blue-600' : 'bg-slate-100 dark:bg-slate-900'}`}
             >
                <Text className={`text-xs font-bold ${activeFilter === f ? 'text-white' : 'text-slate-500'}`}>{f}</Text>
             </TouchableOpacity>
         ))}
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem conversation={item} onPress={handleConversationPress} />
        )}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
             <Feather name="message-circle" size={48} color="#cbd5e1" />
             <Text className="text-slate-500 mt-4 text-center px-8">No hay conversaciones con candidatos todavía.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
