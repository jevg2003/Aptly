import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InboxScreen } from '../screens/chat/InboxScreen';
import { ChatDetailScreen } from '../screens/chat/ChatDetailScreen';

const Stack = createNativeStackNavigator();

export const ChatNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Inbox" component={InboxScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
};
