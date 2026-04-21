import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StatusBar, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SearchBar } from '../../components/chat/SearchBar';
import { ChatListItem } from '../../components/chat/ChatListItem';

import { useBusinessChat } from '../../lib/BusinessChatContext';

import { ObsidianHeader } from '../../components/ObsidianHeader';
import { StyleSheet } from 'react-native';

export const BusinessInboxScreen = ({ navigation }: any) => {
  const { conversations } = useBusinessChat();
  const [searchQuery, setSearchQuery] = useState('');

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <ObsidianHeader 
        title="Messages" 
        subtitle="Candidate Chat"
      />

      <View style={{ paddingHorizontal: 10, marginTop: 5 }}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
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
          <View style={styles.emptyContainer}>
             <Ionicons name="chatbubbles-outline" size={60} color="rgba(255,255,255,0.05)" />
             <Text style={styles.emptyText}>No hay conversaciones con candidatos todavía.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#475569',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  }
});
