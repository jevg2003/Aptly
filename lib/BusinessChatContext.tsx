import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { SessionContext } from './SessionContext';

export interface BusinessConversation {
  id: string;
  applicationId?: string;
  jobTitle?: string;
  jobId?: string;
  participant: {
    id: string;
    name: string;
    avatar: string | null;
    isOnline: boolean;
    role: string;
  };
  messages: {
    id: string;
    text: string;
    senderId: string;
    timestamp: string;
    type?: 'text' | 'image' | 'file' | 'system';
    metadata?: any;
    replyToId?: string;
    deletedAt?: string;
    isSystem?: boolean;
    isRead?: boolean;
  }[];
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface BusinessChatContextType {
  conversations: BusinessConversation[];
  sendMessage: (convId: string, text: string, options?: { type?: string, metadata?: any, replyToId?: string }) => Promise<void>;
  markAsRead: (convId: string) => Promise<void>;
  deleteMessage: (messageId: string, forEveryone: boolean) => Promise<void>;
  loading: boolean;
  totalUnreadCount: number;
  notification: { visible: boolean; title: string; body: string } | null;
  setNotification: (val: any) => void;
  refreshConversations: () => void;
}

const BusinessChatContext = createContext<BusinessChatContextType | undefined>(undefined);

export const BusinessChatProvider = ({ children }: { children: ReactNode }) => {
  const session = useContext(SessionContext);
  const [conversations, setConversations] = useState<BusinessConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<any>(null);

  const fetchConversations = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      // 1. Obtener salas de chat donde participa la empresa
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          candidate_id,
          application_id,
          application:applications(
            id,
            job:jobs(id, title)
          ),
          candidate:profiles!chat_rooms_candidate_id_fkey(id, full_name, avatar_url)
        `)
        .eq('company_id', session.user.id);

      if (roomsError) throw roomsError;

      // 2. Para cada sala, obtener los mensajes
      const mappedRooms = await Promise.all((rooms || []).map(async (room) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('id, content, sender_id, created_at, is_read, type, metadata, reply_to_id, deleted_at, is_system')
          .eq('room_id', room.id)
          .order('created_at', { ascending: true });

        const profileData = room.candidate;
        const profile = Array.isArray(profileData) ? profileData[0] : profileData;
        
        // Handle nested application/job data
        const appData: any = room.application;
        const application = Array.isArray(appData) ? appData[0] : appData;
        const job = application?.job;
        const jobTitle = Array.isArray(job) ? job[0]?.title : job?.title;
        const jobId = Array.isArray(job) ? job[0]?.id : job?.id;

        const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1] : null;

        // Calcular mensajes no leídos (mensajes del candidato donde is_read es falso)
        const unreadCount = (messages || []).filter(m => !m.is_read && m.sender_id !== session.user.id).length;

        return {
          id: room.id,
          applicationId: room.application_id,
          jobTitle: jobTitle || 'Ninguna vacante',
          jobId: jobId,
          participant: {
            id: profile?.id || room.candidate_id,
            name: profile?.full_name || 'Candidato',
            avatar: profile?.avatar_url || null,
            isOnline: true,
            role: 'Candidato'
          },
          messages: (messages || []).map(m => ({
            id: m.id,
            text: m.deleted_at ? 'Este mensaje fue eliminado' : m.content,
            senderId: m.sender_id === session.user.id ? 'me' : m.sender_id,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: m.type as any,
            metadata: m.metadata,
            replyToId: m.reply_to_id,
            deletedAt: m.deleted_at,
            isSystem: m.is_system,
            isRead: m.is_read
          })),
          lastMessage: lastMsg?.deleted_at ? 'Mensaje eliminado' : lastMsg?.content || 'Sin mensajes aún',
          timestamp: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora',
          unreadCount: unreadCount
        };
      }));

      setConversations(mappedRooms);
    } catch (err) {
      console.error('Error fetching business chats:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchConversations();
    
    // Suscripción en tiempo real a mensajes (INSERT y UPDATE para borrados)
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMsg = payload.new;
          if (newMsg.sender_id !== session?.user?.id) {
             setNotification({
               visible: true,
               title: 'Nuevo Mensaje',
               body: newMsg.content.substring(0, 50) + (newMsg.content.length > 50 ? '...' : '')
             });
          }
        }
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [session?.user?.id, fetchConversations]);

  const sendMessage = async (convId: string, text: string, options?: { type?: string, metadata?: any, replyToId?: string }) => {
    if (!session?.user?.id) return;

    const { type = 'text', metadata = {}, replyToId = null } = options || {};

    // Optimistic Update
    const tempId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        const newMessage = {
          id: tempId,
          text: text,
          senderId: 'me',
          timestamp: timestamp,
          type: type as any,
          metadata: metadata,
          replyToId: replyToId as any
        };
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: type === 'text' ? text : `[${type.toUpperCase()}]`,
          timestamp: timestamp
        };
      }
      return conv;
    }));

    try {
      const { error } = await supabase.from('messages').insert([
        {
          room_id: convId,
          content: text,
          sender_id: session.user.id,
          type,
          metadata,
          reply_to_id: replyToId
        }
      ]);

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      fetchConversations();
    }
  };

  const deleteMessage = async (messageId: string, forEveryone: boolean) => {
    if (!session?.user?.id) return;

    try {
      if (forEveryone) {
        const { error } = await supabase
          .from('messages')
          .update({ 
            deleted_at: new Date().toISOString(),
            content: 'Este mensaje fue eliminado' 
          })
          .eq('id', messageId);
        if (error) throw error;
      } else {
        // En una app real usaríamos una tabla 'message_visibility'
        // Para este MVP, solo lo marcamos localmente o ignoramos
        console.log('Borrado local no implementado en DB para simplificar');
      }
      fetchConversations();
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const markAsRead = async (convId: string) => {
    if (!session?.user?.id) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('room_id', convId)
        .neq('sender_id', session.user.id);
      
      if (error) throw error;
      
      // Actualizar estado local
      setConversations(prev => prev.map(conv => 
        conv.id === convId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const totalUnreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  return (
    <BusinessChatContext.Provider value={{ 
      conversations, 
      sendMessage, 
      markAsRead,
      deleteMessage,
      loading, 
      totalUnreadCount,
      notification,
      setNotification,
      refreshConversations: fetchConversations 
    }}>
      {children}
    </BusinessChatContext.Provider>
  );
};

export const useBusinessChat = () => {
  const context = useContext(BusinessChatContext);
  if (context === undefined) {
    throw new Error('useBusinessChat must be used within a BusinessChatProvider');
  }
  return context;
};
