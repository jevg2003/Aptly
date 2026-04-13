import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StatusBar, FlatList, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { mockConversations, Conversation } from './mockData';
import { SearchBar } from '../../components/chat/SearchBar';
import { FilterTabs, FilterParam } from '../../components/chat/FilterTabs';
import { ChatListItem } from '../../components/chat/ChatListItem';

import { ObsidianHeader } from '../../components/ObsidianHeader';
import { ObsidianSwitcher } from '../../components/ObsidianSwitcher';

export const InboxScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterParam>('All');
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const filteredConversations = useMemo(() => {
    let result = mockConversations;
    if (activeFilter === 'Unread') result = result.filter(c => c.unreadCount > 0);
    else if (activeFilter === 'Archived') result = result.filter(c => c.isArchived);
    else result = result.filter(c => !c.isArchived);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      
      <ObsidianHeader 
        title="Messages" 
        subtitle="Inbox"
        rightIcon="create-outline"
      />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      
      <ObsidianSwitcher 
        options={['All', 'Unread', 'Archived']}
        activeOption={activeFilter}
        onOptionChange={(opt) => setActiveFilter(opt as FilterParam)}
      />

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem conversation={item} onPress={handleConversationPress} />
        )}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
             <Feather name="message-circle" size={50} color="rgba(255,255,255,0.1)" />
             <Text style={{ color: '#475569', marginTop: 15, textAlign: 'center', paddingHorizontal: 40 }}>
               {searchQuery ? "No conversations found." : "You don't have any messages yet."}
             </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
