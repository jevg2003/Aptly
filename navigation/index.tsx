import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { MainTabNavigator, BusinessTabNavigator } from './AppNavigator';
import { useApp } from '../lib/AppContext';
import { SessionContext } from '../lib/SessionContext';
import { MatchProvider } from '../lib/MatchContext';
import { BusinessChatProvider } from '../lib/BusinessChatContext';
import { BusinessProfileProvider } from '../lib/BusinessProfileContext';

const Stack = createNativeStackNavigator();

export const RootNavigator = ({ session }: { session: Session | null }) => {
  const { currentScreen, setCurrentScreen, isBusiness } = useApp();
  const role = session?.user?.user_metadata?.role || 'candidate';

  const handleWelcomeFinish = () => {
    setCurrentScreen(session ? 'home' : 'login');
  };

  return (
    <SessionContext.Provider value={session}>
      <BusinessProfileProvider>
        <BusinessChatProvider>
          <MatchProvider>
            <Stack.Navigator 
              key={session ? 'app' : `${currentScreen}-${isBusiness}`}
              screenOptions={{ headerShown: false }}
              initialRouteName={session ? 'Main' : (currentScreen === 'welcome' ? 'Welcome' : 'Login')}
            >
              {!session ? (
                <>
                  <Stack.Screen name="Welcome">
                    {(props) => <WelcomeScreen {...props} onFinish={handleWelcomeFinish} />}
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
