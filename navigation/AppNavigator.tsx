import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';

import { HomeScreen } from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();

// Pantallas Temporales (Placeholders)
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
    <Text className="text-2xl font-bold text-slate-800 dark:text-slate-200">{title}</Text>
  </View>
);

const ChatScreen = () => <PlaceholderScreen title="Mensajes" />;
const JobApplicationsScreen = () => <PlaceholderScreen title="Tus Postulaciones" />;
const ProfileScreen = () => <PlaceholderScreen title="Tu Perfil" />;

interface MainTabProps {
  session: Session | null;
  onLogout: () => void;
}

export const MainTabNavigator = ({ session, onLogout }: MainTabProps) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff', // Fondo blanco
          borderTopColor: '#e2e8f0', // border-slate-200
          borderTopWidth: 1,
          height: 65, // Altura cómoda para dedos
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: '#3b82f6', // Azul
        tabBarInactiveTintColor: '#64748b', // Azul grisáceo (slate-500)
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Inicio') iconName = 'home';
          else if (route.name === 'Chat') iconName = 'message-square';
          else if (route.name === 'Postulaciones') iconName = 'briefcase';
          else if (route.name === 'Profile') iconName = 'user';

          return <Feather name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio">
        {props => <HomeScreen {...props} session={session} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Postulaciones" component={JobApplicationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
