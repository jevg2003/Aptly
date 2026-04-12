import React, { createContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';

import { HomeScreen } from '../screens/HomeScreen';
import { MatchesScreen } from '../screens/MatchesScreen';
import { ChatNavigator } from './ChatNavigator';
import { ApplicationsNavigator } from './ApplicationsNavigator';
import { MatchProvider } from '../lib/MatchContext';
import { ProfileNavigator } from './ProfileNavigator';

// 1. Crear Contexto Global Seguro
export const SessionContext = createContext<Session | null>(null);

const Tab = createBottomTabNavigator();

// 2. Tab Navigator sin props o callbacks (100% estático)
export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Matches') iconName = 'users';
          if (route.name === 'Chat') iconName = 'message-square';
          if (route.name === 'Postulaciones') iconName = 'briefcase';
          if (route.name === 'Profile') iconName = 'user';
          return <Feather name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen name="Postulaciones" component={ApplicationsNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};

// 3. Wrapper final para pasar contexto
export const RootNavigator = ({ session }: { session: Session | null }) => {
  return (
    <SessionContext.Provider value={session}>
      <MatchProvider>
        <MainTabNavigator />
      </MatchProvider>
    </SessionContext.Provider>
  );
};
