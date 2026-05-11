import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
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
    deletedAt?: string | null;
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

/**
 * Formatea un mensaje crudo de Supabase al formato interno.
 * Reutilizable tanto en el fetch inicial como en los eventos Realtime.
 */
const formatMessage = (m: any, myId: string) => ({
  id: m.id,
  text: m.deleted_at ? 'Este mensaje fue eliminado' : m.content,
  senderId: m.sender_id === myId ? 'me' : m.sender_id,
  timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  type: m.type as any,
  metadata: m.metadata,
  replyToId: m.reply_to_id,
  deletedAt: m.deleted_at,
  isSystem: m.is_system,
  isRead: m.is_read,
});

export const BusinessChatProvider = ({ children }: { children: ReactNode }) => {
  const session = useContext(SessionContext);
  const [conversations, setConversations] = useState<BusinessConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<any>(null);

  // Ref para acceder al userId sin agregarlo como dependencia en callbacks de Realtime
  const userIdRef = useRef<string | undefined>(undefined);
  userIdRef.current = session?.user?.id;

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH INICIAL: se llama UNA sola vez al montar (o al cambiar de usuario)
  // ─────────────────────────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) return;

    try {
      setLoading(true);

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
          candidate:profiles!chat_rooms_candidate_id_fkey(id, full_name, avatar_url, deleted_at)
        `)
        .eq('company_id', userId);

      if (roomsError) throw roomsError;

      // N queries de mensajes — solo ocurre en la carga inicial
      const mappedRooms = await Promise.all((rooms || []).map(async (room) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('id, content, sender_id, created_at, is_read, type, metadata, reply_to_id, deleted_at, is_system')
          .eq('room_id', room.id)
          .order('created_at', { ascending: true });

        const profileData = room.candidate;
        const profile: any = Array.isArray(profileData) ? profileData[0] : profileData;

        const appData: any = room.application;
        const application = Array.isArray(appData) ? appData[0] : appData;
        const job = application?.job;
        const jobTitle = Array.isArray(job) ? job[0]?.title : job?.title;
        const jobId = Array.isArray(job) ? job[0]?.id : job?.id;

        const formattedMessages = (messages || []).map(m => formatMessage(m, userId));
        const lastMsg = formattedMessages.length > 0 ? formattedMessages[formattedMessages.length - 1] : null;
        const unreadCount = (messages || []).filter(m => !m.is_read && m.sender_id !== userId).length;

        return {
          id: room.id,
          applicationId: room.application_id,
          jobTitle: jobTitle || 'Ninguna vacante',
          jobId: jobId,
          participant: {
            id: profile?.id || room.candidate_id,
            name: profile?.deleted_at ? 'Usuario Eliminado' : (profile?.full_name || 'Candidato'),
            avatar: profile?.deleted_at ? null : (profile?.avatar_url || null),
            isOnline: true,
            role: 'Candidato',
            deletedAt: profile?.deleted_at || null,
          },
          messages: formattedMessages,
          lastMessage: lastMsg ? (lastMsg.deletedAt ? 'Mensaje eliminado' : lastMsg.text) : 'Sin mensajes aún',
          timestamp: lastMsg?.timestamp || 'Ahora',
          unreadCount,
        };
      }));

      setConversations(mappedRooms);
    } catch (err) {
      console.error('Error fetching business chats:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias: solo se recrea si el componente se desmonta

  // ─────────────────────────────────────────────────────────────────────────
  // REALTIME: mutación quirúrgica — CERO queries adicionales a Supabase
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;

    fetchConversations();

    const subscription = supabase
      .channel(`business-chat:${session.user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as any;
        const userId = userIdRef.current;
        if (!userId) return;

        // Notificación solo si el mensaje viene de otro
        if (newMsg.sender_id !== userId) {
          setNotification({
            visible: true,
            title: 'Nuevo Mensaje',
            body: newMsg.content.substring(0, 50) + (newMsg.content.length > 50 ? '...' : ''),
          });
        }

        // ✅ Insertar el mensaje en la conversación correcta SIN llamar a Supabase
        const formatted = formatMessage(newMsg, userId);
        setConversations(prev => prev.map(conv => {
          if (conv.id !== newMsg.room_id) return conv;
          
          const isFromMe = newMsg.sender_id === userId;
          let updatedMessages = [...conv.messages];

          if (isFromMe) {
            // Buscamos si existe un mensaje temporal que coincida en contenido para REEMPLAZARLO
            const tempIdx = [...updatedMessages].reverse().findIndex(m => 
              m.id.startsWith('temp-') && m.text === newMsg.content
            );

            if (tempIdx !== -1) {
              // Reemplazar el temporal con el real (que tiene el ID definitivo de la DB)
              const actualIdx = updatedMessages.length - 1 - tempIdx;
              updatedMessages[actualIdx] = formatted;
            } else if (!updatedMessages.some(m => m.id === newMsg.id)) {
              updatedMessages.push(formatted);
            }
          } else {
            // Si es de otro, solo evitamos duplicados por ID
            if (!updatedMessages.some(m => m.id === newMsg.id)) {
              updatedMessages.push(formatted);
            }
          }

          return {
            ...conv,
            messages: updatedMessages,
            lastMessage: newMsg.deleted_at ? 'Mensaje eliminado' : newMsg.content,
            timestamp: formatted.timestamp,
            unreadCount: !isFromMe ? conv.unreadCount + 1 : conv.unreadCount,
          };
        }));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const updated = payload.new as any;
        const userId = userIdRef.current;
        if (!userId) return;

        // ✅ Actualizar el mensaje en memoria (ej: borrado, leído) SIN query
        setConversations(prev => prev.map(conv => {
          if (conv.id !== updated.room_id) return conv;
          return {
            ...conv,
            messages: conv.messages.map(m =>
              m.id === updated.id ? formatMessage(updated, userId) : m
            ),
          };
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [session?.user?.id, fetchConversations]);

  // ─────────────────────────────────────────────────────────────────────────
  // ENVIAR MENSAJE — Optimistic Update
  // ─────────────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (convId: string, text: string, options?: { type?: string, metadata?: any, replyToId?: string }) => {
    const userId = userIdRef.current;
    if (!userId) return;

    const { type = 'text', metadata = {}, replyToId = null } = options || {};

    // Mostrar el mensaje inmediatamente en la UI
    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setConversations(prev => prev.map(conv => {
      if (conv.id !== convId) return conv;
      return {
        ...conv,
        messages: [...conv.messages, {
          id: tempId,
          text,
          senderId: 'me',
          timestamp,
          type: type as any,
          metadata,
          replyToId: replyToId as any,
        }],
        lastMessage: type === 'text' ? text : `[${type.toUpperCase()}]`,
        timestamp,
      };
    }));

    try {
      const { error } = await supabase.from('messages').insert([{
        room_id: convId,
        content: text,
        sender_id: userId,
        type,
        metadata,
        reply_to_id: replyToId,
      }]);

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      setConversations(prev => prev.map(conv => {
        if (conv.id !== convId) return conv;
        return { ...conv, messages: conv.messages.filter(m => m.id !== tempId) };
      }));
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // BORRAR MENSAJE
  // ─────────────────────────────────────────────────────────────────────────
  const deleteMessage = useCallback(async (messageId: string, forEveryone: boolean) => {
    const userId = userIdRef.current;
    if (!userId) return;

    // ✅ Si el ID es temporal (aún no guardado en DB), solo borrar localmente
    if (messageId.startsWith('temp-')) {
      setConversations(prev => prev.map(conv => ({
        ...conv,
        messages: conv.messages.filter(m => m.id !== messageId)
      })));
      return;
    }

    if (forEveryone) {
      setConversations(prev => prev.map(conv => ({
        ...conv,
        messages: conv.messages.map(m =>
          m.id === messageId ? { ...m, text: 'Este mensaje fue eliminado', deletedAt: new Date().toISOString() } : m
        ),
      })));

      try {
        const { error } = await supabase
          .from('messages')
          .update({ deleted_at: new Date().toISOString(), content: 'Este mensaje fue eliminado' })
          .eq('id', messageId);
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting message:', err);
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // MARCAR COMO LEÍDO
  // ─────────────────────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (convId: string) => {
    const userId = userIdRef.current;
    if (!userId) return;

    // Actualización local inmediata
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId && conv.unreadCount > 0) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    }));

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('room_id', convId)
        .neq('sender_id', userId);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, []);

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
      refreshConversations: fetchConversations,
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
