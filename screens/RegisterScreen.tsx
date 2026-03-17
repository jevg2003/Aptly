import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  TouchableOpacity, 
  Platform, 
  Image,
  StatusBar,
  useColorScheme,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { supabase } from '../lib/supabase';

export const RegisterScreen = ({ 
  onNavigate,
  isBusiness,
  setIsBusiness
}: { 
  onNavigate: (screen: 'welcome' | 'login' | 'register' | 'home') => void;
  isBusiness: boolean;
  setIsBusiness: (value: boolean) => void;
}) => {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const isDarkMode = colorScheme === 'dark';

  const handleRegister = async () => {
    if (isBusiness) {
      if (!email || !password || !confirmPassword || !companyName) {
        Alert.alert('Error', 'Por favor llena todos los campos de la empresa');
        return;
      }
    } else {
      if (!email || !password || !confirmPassword) {
        Alert.alert('Error', 'Por favor llena todos los campos');
        return;
      }
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: isBusiness ? { 
          full_name: companyName,
          role: 'company'
        } : { 
          role: 'candidate' 
        }
      }
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        Alert.alert(
          'Cuenta Existente', 
          'Este correo ya está registrado (quizás iniciaste sesión antes con Google o GitHub). ¿Deseas recibir un enlace para asignarle una contraseña y poder iniciar sesión con correo y contraseña?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Sí, enviar enlace', 
              onPress: async () => {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
                if (resetError) {
                  Alert.alert('Error', resetError.message);
                } else {
                  Alert.alert('¡Enviado!', 'Revisa tu bandeja de entrada o spam para establecer tu contraseña.');
                  onNavigate('login');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error al registrarse', error.message);
      }
    } else {
      Alert.alert('Registro exitoso', 'Revisa tu correo para verificar tu cuenta (si tienes habilitada la confirmación) o inicia sesión.');
      onNavigate('login');
    }
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={require('../assets/morocho.jpg')}
        className="flex-1"
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-black/30 dark:bg-black/60" />
        
        {/* @ts-ignore */}
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          {/* @ts-ignore */}
          <KeyboardAwareScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            className="flex-1 px-6"
            enableOnAndroid={true}
            extraScrollHeight={80}
            keyboardShouldPersistTaps="handled"
          >
            <View className="bg-white/80 dark:bg-slate-900/80 rounded-[45px] p-7 shadow-2xl border border-white/30 dark:border-slate-800/30">
              
              <View className="items-center mb-4">
                <View className="bg-blue-50/20 dark:bg-blue-900/10 p-4 rounded-[28px] items-center justify-center">
                  {/* @ts-ignore */}
                  <Image 
                    source={require('../assets/favicon.png')} 
                    className="w-24 h-24" 
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View className="items-center mb-6">
                <Text className="text-slate-900 dark:text-slate-50 text-3xl font-bold mb-1 tracking-tight">
                  {isBusiness ? "Registro Empresa" : "Crear Cuenta"}
                </Text>
                <Text className="text-slate-600 dark:text-slate-400 text-center text-[15px] px-6 leading-5 font-medium">
                   {isBusiness 
                     ? "Registra tu empresa para empezar a publicar vacantes." 
                     : "Únete a Aptly y encuentra tu empleo ideal."}
                </Text>
              </View>

              <View>
                <CustomInput
                  placeholder="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  iconName="email-outline"
                  keyboardType="email-address"
                />

                {isBusiness && (
                  <CustomInput
                    placeholder="Nombre de la empresa"
                    value={companyName}
                    onChangeText={setCompanyName}
                    iconName="office-building"
                  />
                )}

                <CustomInput
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  iconName="lock-outline"
                  isPassword
                />

                <CustomInput
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  iconName="lock-check-outline"
                  isPassword
                />
                
                <CustomButton 
                  title={loading ? "Registrando..." : "Registrarse"} 
                  onPress={handleRegister} 
                  variant="primary" 
                  className={`mt-4 mb-4 py-4 px-10 ${isBusiness ? 'bg-slate-900 dark:bg-slate-800' : ''}`} 
                />
              </View>

              <View className="flex-row justify-center mt-4">
                <Text className="text-slate-600 dark:text-slate-400 text-sm">¿Ya tienes una cuenta? </Text>
                <TouchableOpacity onPress={() => onNavigate('login')}>
                  <Text className="text-primary-light font-black text-sm">Inicia Sesión</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center mt-2 mb-4">
                <Text className="text-slate-600 dark:text-slate-400 text-sm">
                  {isBusiness ? "¿Eres candidato? " : "¿Eres una empresa? "}
                </Text>
                <TouchableOpacity onPress={() => setIsBusiness(!isBusiness)}>
                  <Text className="text-primary-light font-black text-sm">
                    {isBusiness ? "Regístrate aquí" : "Cuenta de empresa"}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};
