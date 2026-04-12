import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BusinessConversation {
  id: string;
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
  }[];
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface BusinessChatContextType {
  conversations: BusinessConversation[];
  sendMessage: (convId: string, text: string) => void;
}

const BusinessChatContext = createContext<BusinessChatContextType | undefined>(undefined);

const INITIAL_CONVERSATIONS: BusinessConversation[] = [
  {
    id: 'c1',
    participant: {
      id: 'p1',
      name: 'Maria Garcia',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
      isOnline: true,
      role: 'Programador'
    },
    messages: [
      {
        id: '1',
        text: 'Hola Maria Garcia, vimos tu perfil y nos interesó mucho para la vacante de Programador.',
        senderId: 'me',
        timestamp: '10:00 AM'
      },
      {
        id: '2',
        text: 'Hola, ¡muchas gracias! Me encantaría saber más sobre el proyecto.',
        senderId: 'p1',
        timestamp: '10:15 AM'
      }
    ],
    lastMessage: 'Hola, ¡muchas gracias! Me encantaría saber más sobre el proyecto.',
    timestamp: '10:20 AM',
    unreadCount: 2
  },
  {
    id: 'c2',
    participant: {
      id: 'p2',
      name: 'Juan Perez',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
      isOnline: false,
      role: 'Vendedor'
    },
    messages: [
      {
        id: 'm1',
        text: 'Hola Juan Perez, vimos tu perfil y nos interesó mucho para la vacante de Vendedor.',
        senderId: 'me',
        timestamp: '9:30 AM'
      },
      {
        id: 'm2',
        text: 'Adjunto mi portafolio actualizado.',
        senderId: 'p2',
        timestamp: 'Ayer'
      }
    ],
    lastMessage: 'Adjunto mi portafolio actualizado.',
    timestamp: 'Ayer',
    unreadCount: 0
  },
  {
    id: 'c3',
    participant: {
      id: 'p3',
      name: 'Carlos Rodriguez',
      avatar: null,
      isOnline: true,
      role: 'Aux. Tienda'
    },
    messages: [
      {
        id: 'r1',
        text: 'Hola Carlos Rodriguez, vimos tu perfil y nos interesó mucho para la vacante de Aux. Tienda.',
        senderId: 'me',
        timestamp: 'Lunes'
      }
    ],
    lastMessage: 'Hola Carlos Rodriguez, vimos tu perfil y nos interesó mucho para la vacante de Aux. Tienda.',
    timestamp: '23 May',
    unreadCount: 0
  }
];

export const BusinessChatProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<BusinessConversation[]>(INITIAL_CONVERSATIONS);

  const sendMessage = (convId: string, text: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        const newMessage = {
          id: Date.now().toString(),
          text: text,
          senderId: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: text,
          timestamp: newMessage.timestamp,
          unreadCount: 0
        };
      }
      return conv;
    }));
  };

  return (
    <BusinessChatContext.Provider value={{ conversations, sendMessage }}>
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
