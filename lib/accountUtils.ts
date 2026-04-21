import { supabase } from './supabase';

export const handleAccountSoftDelete = async (userId: string) => {
  try {
    // 1. Mark as deleted
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 2. We need to notify all active chats
    // A profile can be a company or a candidate. Let's find all chat_rooms where they participate
    const { data: chatRooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('id')
      .or(`company_id.eq.${userId},candidate_id.eq.${userId}`);

    if (roomsError) throw roomsError;

    if (chatRooms && chatRooms.length > 0) {
      // 3. Inject system message into each room
      const messagesToInsert = chatRooms.map(room => ({
        room_id: room.id,
        sender_id: userId,
        content: 'Este usuario ha eliminado su cuenta de Aptly. El proceso se da por cerrado.',
        type: 'system',
        is_system: true,
        metadata: { action: 'account_deleted' }
      }));

      await supabase.from('messages').insert(messagesToInsert);
    }

    // 4. Sign out
    await supabase.auth.signOut();
    return true;

  } catch (error) {
    console.error('Error soft-deleting account:', error);
    throw error;
  }
};
