import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { BusinessHomeScreen } from '../screens/business/BusinessHomeScreen';
import { BusinessVacantesScreen } from '../screens/business/BusinessVacantesScreen';
import { CreateVacanteScreen } from '../screens/business/CreateVacanteScreen';
import { JobDetailScreen } from '../screens/business/JobDetailScreen';
import { BusinessInboxScreen } from '../screens/business/BusinessInboxScreen';
import { BusinessChatDetailScreen } from '../screens/business/BusinessChatDetailScreen';

import { MatchesScreen } from '../screens/MatchesScreen';
import { ChatNavigator } from './ChatNavigator';
import { ApplicationsNavigator } from './ApplicationsNavigator';
import { ProfileNavigator } from './ProfileNavigator';

const Tab = createBottomTabNavigator();
const BusinessStack = createNativeStackNavigator();

// Stack para la gestión de vacantes de empresa
const BusinessVacantesNavigator = () => (
  <BusinessStack.Navigator screenOptions={{ headerShown: false }}>
    <BusinessStack.Screen name="VacantesList" component={BusinessVacantesScreen} />
    <BusinessStack.Screen name="CreateVacante" component={CreateVacanteScreen} />
    <BusinessStack.Screen name="JobDetail" component={JobDetailScreen} />
  </BusinessStack.Navigator>
);

const BusinessChatNavigator = () => (
  <BusinessStack.Navigator screenOptions={{ headerShown: false }}>
    <BusinessStack.Screen name="BusinessInbox" component={BusinessInboxScreen} />
    <BusinessStack.Screen name="BusinessChatDetail" component={BusinessChatDetailScreen} />
  </BusinessStack.Navigator>
);

// 2. Tab Navigator para Candidatos
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
          if (route.name === 'Chat') iconName = 'message-square';
          if (route.name === 'Postulaciones') iconName = 'briefcase';
          if (route.name === 'Perfil') iconName = 'user';
          return <Feather name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen name="Postulaciones" component={ApplicationsNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};

// 3. Business Tab Navigator para Empresas
export const BusinessTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#506FC0',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Vacantes') iconName = 'briefcase';
          if (route.name === 'Chat') iconName = 'message-square';
          if (route.name === 'Profile') iconName = 'user';
          return <Feather name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Panel" component={BusinessHomeScreen} />
      <Tab.Screen name="Vacantes" component={BusinessVacantesNavigator} /> 
      <Tab.Screen name="Chat" component={BusinessChatNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};
