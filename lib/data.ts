// 1. Types for Core Entities
export type UserType = 'company' | 'candidate';

export interface BaseUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  isVerified?: boolean;
  type: UserType;
}

export interface Company extends BaseUser {
  type: 'company';
  description?: string;
  logoUri?: string;
  location?: string;
}

// 2. Types for Messaging
export type MessageType = 'text' | 'map' | 'file';

export interface MessageData {
  id: string;
  senderId: string;
  text?: string;
  timestamp: string;
  type: MessageType;
  mapData?: {
    title: string;
    address: string;
    imageUri: string;
  };
}

export interface ConversationData {
  id: string;
  companyId: string; // Linked to a Company
  participant: Company;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isArchived?: boolean;
  messages: MessageData[];
}

// 3. Types for Applications
export type TimelineStatus = 'completed' | 'in_progress' | 'pending';

export interface TimelineStepData {
  id: string;
  title: string;
  description: string;
  status: TimelineStatus;
}

export type ApplicationStatus = 'En revisión' | 'Entrevista' | 'Finalizado' | 'Recibida';

export interface ApplicationData {
  id: string;
  companyId: string; // Linked to a Company
  companyName: string;
  jobTitle: string;
  appliedDate: string;
  status: ApplicationStatus;
  statusColor: string;
  subtitle: string;
  buttonVariant: 'outline' | 'filled';
  buttonText: string;
  imageUri: string;
  logoUri?: string;
  timeline: TimelineStepData[];
}

// --- MOCK DATA ---

export const COMPANIES: Company[] = [
  {
    id: 'd1',
    name: 'D1 S.A.S.',
    type: 'company',
    isOnline: true,
    isVerified: true,
    logoUri: 'https://via.placeholder.com/100x100.png?text=D1',
    location: 'Bogotá, Colombia',
    description: 'Tiendas de descuento líderes en Colombia.',
  },
  {
    id: 'ara',
    name: 'Tiendas ARA',
    type: 'company',
    isOnline: false,
    logoUri: 'https://via.placeholder.com/100x100.png?text=ARA',
    location: 'Medellín, Colombia',
  },
  {
    id: 'homecenter',
    name: 'Homecenter',
    type: 'company',
    isOnline: false,
    logoUri: 'https://via.placeholder.com/100x100.png?text=Homecenter',
  },
  {
    id: 'exito',
    name: 'Éxito',
    type: 'company',
    isOnline: true,
    logoUri: 'https://via.placeholder.com/100x100.png?text=Exito',
  }
];

export const SHARED_APPLICATIONS: ApplicationData[] = [
  {
    id: 'app1',
    companyId: 'd1',
    companyName: 'D1 S.A.S.',
    jobTitle: 'Gerente de Tienda',
    appliedDate: 'Aplicado el 24 oct. 2023',
    status: 'En revisión',
    statusColor: 'bg-yellow-400',
    subtitle: 'Analizando hoja de vida',
    buttonVariant: 'outline',
    buttonText: 'Ver detalles',
    imageUri: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=600&auto=format&fit=crop',
    logoUri: 'https://via.placeholder.com/100x100.png?text=D1',
    timeline: [
        { id: 'ts1', title: 'Analizando hoja de vida', description: 'Tu perfil fue revisado.', status: 'completed' },
        { id: 'ts2', title: 'Proceso de selección', description: 'Estamos coordinando entrevistas.', status: 'in_progress' },
        { id: 'ts3', title: 'Resultado final', description: 'Pendiente.', status: 'pending' }
    ]
  },
  {
    id: 'app2',
    companyId: 'ara',
    companyName: 'Tiendas ARA',
    jobTitle: 'Supervisor de Zona',
    appliedDate: 'Aplicado el 15 oct. 2023',
    status: 'Entrevista',
    statusColor: 'bg-blue-500',
    subtitle: 'Proceso de selección',
    buttonVariant: 'outline',
    buttonText: 'Ver detalles',
    imageUri: 'https://images.unsplash.com/photo-1604719312566-f4129e93f429?q=80&w=600&auto=format&fit=crop',
    timeline: [
        { id: 'ts1', title: 'Revisión de perfil', description: 'Perfil aprobado.', status: 'completed' },
        { id: 'ts2', title: 'Entrevista', description: 'Programada.', status: 'in_progress' }
    ]
  }
];

export const SHARED_CONVERSATIONS: ConversationData[] = [
  {
    id: 'conv1',
    companyId: 'd1',
    participant: COMPANIES[0],
    lastMessage: 'Gracias por programar la entrevista...',
    timestamp: '10:30 AM',
    unreadCount: 1,
    messages: [
      { id: 'm1', senderId: 'd1', text: 'Hola, hemos revisado tu perfil.', timestamp: '09:15 AM', type: 'text' },
      { id: 'm2', senderId: 'me', text: '¡Hola! Muchas gracias.', timestamp: '09:22 AM', type: 'text' },
      { 
        id: 'm4', 
        senderId: 'd1', 
        type: 'map', 
        timestamp: '09:46 AM', 
        mapData: { title: 'Sede Principal D1', address: 'Av. Carrera 45 #108-27', imageUri: 'https://via.placeholder.com/300x150.png?text=Mapa' } 
      },
      { id: 'm5', senderId: 'd1', text: 'Gracias por su tiempo.', timestamp: '10:30 AM', type: 'text' }
    ]
  },
  {
    id: 'conv2',
    companyId: 'ara',
    participant: COMPANIES[1],
    lastMessage: 'Agendemos la llamada mañana.',
    timestamp: 'Ayer',
    unreadCount: 0,
    messages: []
  }
];
