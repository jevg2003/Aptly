import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../lib/AppContext';

export const RestoreAccountScreen = () => {
  const { setCurrentScreen, setIsBusiness } = useApp();
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('No hay sesión activa.');

      // Update the deleted_at flag to null
      const { error } = await supabase
        .from('profiles')
        .update({ deleted_at: null })
        .eq('id', session.user.id);

      if (error) throw error;

      // Determine routing based on role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (profile?.role === 'recruiter') {
        setIsBusiness(true);
        setCurrentScreen('businessMain');
      } else {
        setIsBusiness(false);
        setCurrentScreen('main');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo recuperar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentScreen('login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ 
          width: 80, height: 80, 
          borderRadius: 40, 
          backgroundColor: '#1A1A1C', 
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 2, borderColor: '#FF005C',
          marginBottom: 24
        }}>
          <MaterialCommunityIcons name="delete-restore" size={40} color="#FF005C" />
        </View>
        
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
          Cuenta en Eliminación
        </Text>
        
        <Text style={{ color: '#94a3b8', fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 24 }}>
          Habías solicitado eliminar tu cuenta. Actualmente está inactiva y no es visible para nadie. Aún estás dentro de tu período de gracia de 30 días.
          {'\n\n'}¿Deseas cancelar la eliminación y recuperar todo el acceso a tus chats y procesos?
        </Text>

        <TouchableOpacity 
          onPress={handleRestore}
          disabled={loading}
          style={{
            backgroundColor: '#FF005C',
            width: '100%',
            paddingVertical: 16,
            borderRadius: 100,
            alignItems: 'center',
            marginBottom: 16
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
            {loading ? 'Recuperando...' : 'Sí, recuperar mi cuenta'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleLogout}
          style={{
            backgroundColor: '#1A1A1C',
            width: '100%',
            paddingVertical: 16,
            borderRadius: 100,
            alignItems: 'center',
            borderWidth: 1, borderColor: '#333'
          }}
        >
          <Text style={{ color: '#475569', fontWeight: 'bold', fontSize: 16 }}>
            No, quiero salir
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
