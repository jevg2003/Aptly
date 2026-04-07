import { 
  BaseUser, 
  MessageData, 
  ConversationData, 
  SHARED_CONVERSATIONS 
} from '../../lib/data';

export type User = BaseUser;
export type Message = MessageData;
export type Conversation = ConversationData;

export const currentUser: User = {
  id: 'me',
  name: 'Tú',
  type: 'candidate',
};

export const mockConversations: Conversation[] = SHARED_CONVERSATIONS;
