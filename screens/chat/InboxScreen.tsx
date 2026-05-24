import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [activeFilter, setActiveFilter] = useState<FilterParam>('Todos');
  const [refreshKey, setRefreshKey] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(
          `
          id,
          created_at,
          candidate_id,
          company_id,
          candidate:profiles!chat_rooms_candidate_id_fkey(full_name, avatar_url),
          company:profiles!chat_rooms_company_id_fkey(full_name, avatar_url),
          messages(id, content, sender_id, is_read, created_at)
        `
        )
        .or(`candidate_id.eq.${session.user.id},company_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Conversation[] = (data || []).map((room) => {
        const isCompany = session.user.id === room.company_id;
        // The other participant
        const oppositeNode = isCompany ? room.candidate : room.company;
        const oppositeProfile = Array.isArray(oppositeNode) ? oppositeNode[0] : oppositeNode;
        const oppositeUserId = isCompany ? room.candidate_id : room.company_id;

        // Sort messages manually (latest first)
        const msgs = Array.isArray(room.messages) ? room.messages : [];
        msgs.sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const lastMsg = msgs.length > 0 ? msgs[0] : null;

        // Unread = sent by opposite user AND not read
        const unreadCount = msgs.filter(
          (m: any) => m.sender_id === oppositeUserId && !m.is_read
        ).length;

        // Format Date
        const dateRaw = lastMsg ? lastMsg.created_at : room.created_at;
        const dateObj = new Date(dateRaw);
        const today = new Date();
        const isToday =
          dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth();
        const timestamp = isToday
          ? dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          : dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });

        return {
          id: room.id,
          roomId: room.id,
          companyId: room.company_id,
          participant: {
            id: oppositeUserId,
            name: oppositeProfile?.full_name || (isCompany ? 'Candidato' : 'Empresa'),
            avatar: oppositeProfile?.avatar_url,
            isOnline: false,
            isVerified: true,
            type: isCompany ? 'candidate' : 'company',
          },
          lastMessage: lastMsg?.content || 'Inicia la conversación',
          timestamp,
          unreadCount,
          isArchived: false,
          messages: [],
          _rawDate: lastMsg ? new Date(lastMsg.created_at).getTime() : new Date(room.created_at).getTime(),
        };
      });

      // Sort: unread first, then by most recent message date
      mapped.sort((a, b) => {
        const aUnread = a.unreadCount > 0 ? 1 : 0;
        const bUnread = b.unreadCount > 0 ? 1 : 0;
        if (aUnread !== bUnread) return bUnread - aUnread;
        return (b as any)._rawDate - (a as any)._rawDate;
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
      setRefreshKey((prev) => prev + 1);
      fetchChats();
    }, [fetchChats])
  );

  const filteredConversations = useMemo(() => {
    let result = conversations;
    if (activeFilter === 'No leídos') result = result.filter((c) => c.unreadCount > 0);
    else result = result; // 'Todos'

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.participant.name.toLowerCase().includes(lowerQuery) ||
          c.lastMessage.toLowerCase().includes(lowerQuery)
      );
    }
    return result;
  }, [searchQuery, activeFilter, refreshKey]);

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('ChatDetail', {
      roomId: conversation.id,
      oppositeUserId: conversation.participant.id,
      participant: conversation.participant,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      <ObsidianHeader title="Messages" subtitle="Inbox" />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <ObsidianSwitcher
        options={['Todos', 'No leídos']}
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
            <Text
              style={{
                color: '#475569',
                marginTop: 15,
                textAlign: 'center',
                paddingHorizontal: 40,
              }}>
              {searchQuery ? 'No se encontraron conversaciones.' : 'Aún no tienes ningún mensaje.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
