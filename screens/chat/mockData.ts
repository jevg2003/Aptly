export type User = {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  type?: 'company' | 'candidate';
  isVerified?: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  text?: string;
  timestamp: string;
  type: 'text' | 'map' | 'file';
  mapData?: {
    title: string;
    address: string;
    imageUri: string;
  };
};

export type Conversation = {
  id: string;
  participant: User;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isArchived?: boolean;
  messages: Message[];
};

export const currentUser: User = {
  id: 'me',
  name: 'Tú',
};

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participant: {
      id: 'd1',
      name: 'D1 S.A.S',
      isOnline: true,
      type: 'company',
      isVerified: true,
    },
    lastMessage: 'Gracias por programar la entrevista...',
    timestamp: '10:30 AM',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        senderId: 'd1',
        text: 'Hola, hemos revisado tu perfil para la vacante de Analista. ¿Tienes disponibilidad para una entrevista mañana?',
        timestamp: '09:15 AM',
        type: 'text',
      },
      {
        id: 'm2',
        senderId: 'me',
        text: 'Hola, ¡muchas gracias! Sí, tengo disponibilidad total en la mañana. Me encantaría conocer más sobre el rol.',
        timestamp: '09:22 AM',
        type: 'text',
      },
      {
        id: 'm3',
        senderId: 'd1',
        text: 'Perfecto, te agendaré a las 10:00 AM. Te adjunto la ubicación de nuestras oficinas principales.',
        timestamp: '09:45 AM',
        type: 'text',
      },
      {
        id: 'm4',
        senderId: 'd1',
        type: 'map',
        timestamp: '09:46 AM',
        mapData: {
          title: 'Sede Principal D1',
          address: 'Av. Carrera 45 #108-27, Bogotá',
          imageUri: 'https://via.placeholder.com/300x150.png?text=Mapa+Bogota'
        }
      },
      {
        id: 'm5',
        senderId: 'd1',
        text: 'Gracias por programar la entrevista con nosotros. Nos vemos pronto.',
        timestamp: '10:30 AM',
        type: 'text',
      }
    ],
  },
  {
    id: 'conv2',
    participant: {
      id: 'mc',
      name: 'Michael Chen',
      isOnline: false,
      type: 'company',
    },
    lastMessage: 'Can we reschedule our call to Tuesday?',
    timestamp: 'Yesterday',
    unreadCount: 0,
    messages: [],
  },
  {
    id: 'conv3',
    participant: {
      id: 'ed',
      name: 'Emily Davis',
      isOnline: true,
      type: 'company',
    },
    lastMessage: "I've attached my updated portfolio.",
    timestamp: 'Tue',
    unreadCount: 0,
    messages: [],
  },
  {
    id: 'conv4',
    participant: {
      id: 'dw',
      name: 'David Wilson',
      isOnline: false,
      type: 'company',
    },
    lastMessage: 'Sounds good, talk to you then.',
    timestamp: 'Mon',
    unreadCount: 0,
    messages: [],
  },
  {
    id: 'conv5',
    participant: {
      id: 'aj',
      name: 'Alex Johnson',
      isOnline: false,
      type: 'company',
    },
    lastMessage: 'Is the position still open?',
    timestamp: 'Last week',
    unreadCount: 0,
    messages: [],
  },
];
