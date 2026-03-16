import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Platform, 
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface OnboardingCandidateProps {
  userId: string;
  session: Session;
  onComplete: () => void;
}

export const OnboardingCandidate = ({ userId, session, onComplete }: OnboardingCandidateProps) => {
  // Extract data from social metadata if available
  const metadata = session.user.user_metadata;
  const initialName = metadata?.full_name || metadata?.name || '';
  const initialAvatar = metadata?.avatar_url || metadata?.picture || '';

  const [fullName, setFullName] = useState(initialName);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUserModifiedName, setHasUserModifiedName] = useState(false);

  useEffect(() => {
    // ONLY set the background name IF the field is empty and we have a name from social login.
    if (!fullName && initialName && !hasUserModifiedName) {
      setFullName(initialName);
    }
  }, [initialName, fullName, hasUserModifiedName]);

  const handleNameChange = (text: string) => {
    setFullName(text);
    setHasUserModifiedName(true);
  };

  const handleSave = async () => {
    if (!fullName || !title || !location) {
      Alert.alert('Datos faltantes', 'Por favor llena los campos obligatorios (Nombre, Título y Ubicación)');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          professional_title: title,
          location,
          bio,
          age: parseInt(age) || null,
          avatar_url: initialAvatar,
          role: 'candidate',
          updated_at: new Date(),
        });

      if (error) throw error;
      onComplete();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <KeyboardAwareScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 50 : 80}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-10">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Paso Final</Text>
            <Text className="text-slate-500 dark:text-slate-400">Personaliza tu perfil para que las empresas puedan conocerte.</Text>
          </View>

          <View className="items-center mb-8">
            <TouchableOpacity className="w-28 h-28 bg-white dark:bg-slate-900 rounded-full items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {initialAvatar ? (
                <Image source={{ uri: initialAvatar }} className="w-full h-full" />
              ) : (
                <>
                  <MaterialCommunityIcons name="camera-account" size={36} color="#2B468B" />
                  <Text className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-bold">FOTO PERFIL</Text>
                </>
              )}
            </TouchableOpacity>
            {initialAvatar ? (
               <Text className="text-[10px] text-green-600 dark:text-green-400 mt-2 font-bold uppercase italic">Imagen Vinculada</Text>
            ) : null}
            <View className="mt-2 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                <Text className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">{session?.user?.email}</Text>
            </View>
          </View>

          <View className="space-y-1">
            <Text className="text-slate-700 dark:text-slate-300 font-bold ml-1 mb-1">Información Personal</Text>
            <CustomInput
              placeholder="Nombre Completo"
              value={fullName}
              onChangeText={handleNameChange}
              iconName="account-outline"
            />
            
            <View className="flex-row">
                 <View className="flex-1 mr-2">
                    <CustomInput
                        placeholder="Edad"
                        value={age}
                        onChangeText={setAge}
                        iconName="calendar-account"
                        keyboardType="numeric"
                    />
                 </View>
                 <View className="flex-[2]">
                    <CustomInput
                        placeholder="Ubicación (Ciudad, País)"
                        value={location}
                        onChangeText={setLocation}
                        iconName="map-marker-outline"
                    />
                 </View>
            </View>

            <Text className="text-slate-700 dark:text-slate-300 font-bold ml-1 mb-1 mt-2">Perfil Profesional</Text>
            <CustomInput
              placeholder="Título (ej. Senior UX Designer)"
              value={title}
              onChangeText={setTitle}
              iconName="briefcase-outline"
            />
            
            <CustomInput
                placeholder="Biografía breve y objetivos..."
                value={bio}
                onChangeText={setBio}
                iconName="text-account"
                multiline
                numberOfLines={4}
            />
          </View>

          <CustomButton
            title={loading ? "Guardando..." : "Comenzar en Aptly"}
            onPress={handleSave}
            variant="primary"
            className="mt-4 mb-12 py-4"
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};
