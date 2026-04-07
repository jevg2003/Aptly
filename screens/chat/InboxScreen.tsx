import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StatusBar, FlatList, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { mockConversations, Conversation } from './mockData';
import { SearchBar } from '../../components/chat/SearchBar';
import { FilterTabs, FilterParam } from '../../components/chat/FilterTabs';
import { ChatListItem } from '../../components/chat/ChatListItem';

export const InboxScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterParam>('All');
  const [refreshKey, setRefreshKey] = useState(0);

  // Force re-render when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const filteredConversations = useMemo(() => {
    let result = mockConversations;

    if (activeFilter === 'Unread') {
      result = result.filter(c => c.unreadCount > 0);
    } else if (activeFilter === 'Archived') {
       result = result.filter(c => c.isArchived); // Assuming we'll add isArchived
    } else {
       result = result.filter(c => !c.isArchived);
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.participant.name.toLowerCase().includes(lowerQuery) || 
        c.lastMessage.toLowerCase().includes(lowerQuery)
      );
    }

    return result;
  }, [searchQuery, activeFilter, refreshKey]);

  const handleConversationPress = (conversation: Conversation) => {
     navigation.navigate('ChatDetail', { conversation });
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center bg-white dark:bg-slate-950">
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">Messages</Text>
        <TouchableOpacity className="p-2">
          <Feather name="edit" size={22} color="#1e293b" className="dark:text-slate-200" />
        </TouchableOpacity>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      
      <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

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
             <Text className="text-slate-500 mt-4 text-center px-8">
               {searchQuery ? "No conversations found." : "You don't have any messages yet."}
             </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
