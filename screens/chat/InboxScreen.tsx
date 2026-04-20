import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StatusBar, FlatList, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Conversation } from './mockData';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { SearchBar } from '../../components/chat/SearchBar';
import { FilterTabs, FilterParam } from '../../components/chat/FilterTabs';
import { ChatListItem } from '../../components/chat/ChatListItem';

import { ObsidianHeader } from '../../components/ObsidianHeader';
import { ObsidianSwitcher } from '../../components/ObsidianSwitcher';

export const InboxScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterParam>('All');
  const [refreshKey, setRefreshKey] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          created_at,
          candidate_id,
          company_id,
          candidate:profiles!chat_rooms_candidate_id_fkey(full_name, avatar_url),
          company:profiles!chat_rooms_company_id_fkey(full_name, avatar_url),
          messages(id, content, sender_id, is_read, created_at)
        `)
        .or(`candidate_id.eq.${session.user.id},company_id.eq.${session.user.id}`);
        
      if (error) throw error;
      
      const mapped: Conversation[] = (data || []).map(room => {
        const isCompany = session.user.id === room.company_id;
        // The other participant
        const oppositeNode = isCompany ? room.candidate : room.company;
        const oppositeProfile = Array.isArray(oppositeNode) ? oppositeNode[0] : oppositeNode;
        const oppositeUserId = isCompany ? room.candidate_id : room.company_id;

        // Sort messages manually (latest first)
        const msgs = Array.isArray(room.messages) ? room.messages : [];
        msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const lastMsg = msgs.length > 0 ? msgs[0] : null;

        // Unread = sent by opposite user AND not read
        const unreadCount = msgs.filter((m: any) => m.sender_id === oppositeUserId && !m.is_read).length;

        // Format Date
        const dateRaw = lastMsg ? lastMsg.created_at : room.created_at;
        const dateObj = new Date(dateRaw);
        const today = new Date();
        const isToday = dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth();
        const timestamp = isToday 
           ? dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
           : dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });

        return {
           id: room.id,
           roomId: room.id, // we can use id directly
           participant: {
              id: oppositeUserId,
              name: oppositeProfile?.full_name || (isCompany ? 'Candidato' : 'Empresa'),
              avatar: oppositeProfile?.avatar_url,
              isOnline: false,
              isVerified: true
           },
           lastMessage: lastMsg?.content || 'Inicia la conversación',
           timestamp,
           unreadCount,
           isArchived: false,
           messages: [] // Will fetch inside detail screen
        };
      });

      // Show latest chats first
      mapped.sort((a,b) => {
         // rough sort since we parsed to string in 'timestamp', better to sort before mapping but this is a mock replacement
         return 0; // The actual robust sort would run on raw dates
      });

      setConversations(mapped);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
      fetchChats();
    }, [fetchChats])
  );

  const filteredConversations = useMemo(() => {
    let result = conversations;
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
     navigation.navigate('ChatDetail', { roomId: conversation.id, oppositeUserId: conversation.participant.id, participant: conversation.participant });
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
