import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { BusinessHomeScreen } from '../screens/business/BusinessHomeScreen';
import { BusinessVacantesScreen } from '../screens/business/BusinessVacantesScreen';
import { CreateVacanteScreen } from '../screens/business/CreateVacanteScreen';
import { JobDetailScreen } from '../screens/business/JobDetailScreen';
import { BusinessInboxScreen } from '../screens/business/BusinessInboxScreen';
import { BusinessChatDetailScreen } from '../screens/business/BusinessChatDetailScreen';
import { BusinessProfileScreen } from '../screens/business/BusinessProfileScreen';
import { EditBusinessProfileScreen } from '../screens/business/EditBusinessProfileScreen';

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
    <BusinessStack.Screen name="BusinessHome" component={BusinessHomeScreen} />
  </BusinessStack.Navigator>
);

const BusinessChatNavigator = () => (
  <BusinessStack.Navigator screenOptions={{ headerShown: false }}>
    <BusinessStack.Screen name="BusinessInbox" component={BusinessInboxScreen} />
    <BusinessStack.Screen name="BusinessChatDetail" component={BusinessChatDetailScreen} />
  </BusinessStack.Navigator>
);

const BusinessProfileNavigator = () => (
  <BusinessStack.Navigator screenOptions={{ headerShown: false }}>
    <BusinessStack.Screen name="BusinessProfileView" component={BusinessProfileScreen} />
    <BusinessStack.Screen name="EditBusinessProfile" component={EditBusinessProfileScreen} />
  </BusinessStack.Navigator>
);

// Custom TabBar for Candidates
const CandidateTabBar = ({ state, descriptors, navigation }: any) => {
  const tabs = [
    { name: 'Inicio', icon: 'home', iconActive: 'home', label: 'Inicio' },
    { name: 'Chat', icon: 'chatbubble-outline', iconActive: 'chatbubble', label: 'Chat' },
    { name: 'Postulaciones', icon: 'briefcase-outline', iconActive: 'briefcase', label: 'Postulaciones' },
    { name: 'Profile', icon: 'person-outline', iconActive: 'person', label: 'Perfil' },
  ];
  return (
    <View style={tabStyles.bar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = tabs.find(t => t.name === route.name) || tabs[0];
        const iconName: any = isFocused ? tab.iconActive : tab.icon;
        const color = isFocused ? '#00A3FF' : '#475569';
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={tabStyles.tabBtn}
            activeOpacity={0.7}
          >
            {isFocused && <View style={[tabStyles.glow, { shadowColor: '#00A3FF' }]} />}
            <Ionicons name={iconName} size={22} color={color} />
            <Text style={[tabStyles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

import { BusinessChatProvider, useBusinessChat } from '../lib/BusinessChatContext';

// ... (other navigators)

// Custom TabBar for Business
const BusinessTabBar = ({ state, descriptors, navigation }: any) => {
  const { totalUnreadCount } = useBusinessChat();

  const tabs = [
    { name: 'Vacantes', icon: 'layers-outline', iconActive: 'layers', label: 'Vacantes' },
    { name: 'Chat', icon: 'chatbubble-outline', iconActive: 'chatbubble', label: 'Chat', badge: totalUnreadCount },
    { name: 'Profile', icon: 'business-outline', iconActive: 'business', label: 'Empresa' },
  ];

  return (
    <View style={tabStyles.bar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = tabs.find(t => t.name === route.name) || tabs[0];
        const iconName: any = isFocused ? tab.iconActive : tab.icon;
        const color = isFocused ? '#FF005C' : '#475569';
        
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={tabStyles.tabBtn}
            activeOpacity={0.7}
          >
            {isFocused && <View style={[tabStyles.glow, { shadowColor: '#FF005C' }]} />}
            <View>
              <Ionicons name={iconName} size={22} color={color} />
              {tab.badge > 0 && (
                <View style={tabStyles.badge}>
                  <Text style={tabStyles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[tabStyles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    height: 75,
    paddingBottom: 12,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 16,
    paddingVertical: 4,
  },
  glow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF005C',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0A0A0B',
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '900',
  }
});

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CandidateTabBar {...props} />}
      screenOptions={{ headerShown: false }}
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
      tabBar={(props) => <BusinessTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Vacantes" component={BusinessVacantesNavigator} />
      <Tab.Screen name="Chat" component={BusinessChatNavigator} />
      <Tab.Screen name="Profile" component={BusinessProfileNavigator} />
    </Tab.Navigator>
  );
};

