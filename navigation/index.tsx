import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { MainTabNavigator, BusinessTabNavigator } from './AppNavigator';
import { SessionContext } from '../lib/SessionContext';
import { MatchProvider } from '../lib/MatchContext';
import { BusinessChatProvider } from '../lib/BusinessChatContext';
import { BusinessProfileProvider } from '../lib/BusinessProfileContext';
import { NotificationBanner } from '../components/common/NotificationBanner';
import { ObsidianToast } from '../components/common/ObsidianToast';

const Stack = createNativeStackNavigator();

export const RootNavigator = ({ session }: { session: Session | null }) => {
  const role = session?.user?.user_metadata?.role || 'candidate';

  return (
    <SessionContext.Provider value={session}>
      <BusinessProfileProvider>
        <BusinessChatProvider>
          <NotificationBanner />
          <ObsidianToast />
          <MatchProvider>
            <Stack.Navigator 
              screenOptions={{ 
                headerShown: false,
                animation: 'fade_from_bottom',
                contentStyle: { backgroundColor: '#050505' } // Force darkest background
              }}
            >
              {!session ? (
                <>
                  <Stack.Screen name="Welcome">
                    {(props) => <WelcomeScreen {...props} onFinish={() => {}} />}
                  </Stack.Screen>
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                </>
              ) : (
                <Stack.Screen name="Main">
                  {() => role === 'company' ? <BusinessTabNavigator /> : <MainTabNavigator />}
                </Stack.Screen>
              )}
            </Stack.Navigator>
          </MatchProvider>
        </BusinessChatProvider>
      </BusinessProfileProvider>
    </SessionContext.Provider>
  );
};
