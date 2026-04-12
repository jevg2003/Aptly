import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StatusBar, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';

export const CreateVacanteScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !description || !salary || !location) {
      Alert.alert('Error', 'Por favor llena todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('jobs').insert([
        {
          title,
          description,
          salary,
          location,
          type,
          company_id: session?.user?.id,
          created_at: new Date().toISOString(),
        }
      ]);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('¡Éxito!', 'Vacante publicada correctamente');
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('Error', 'Hubo un problema al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-slate-50 dark:border-slate-800">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Nueva Vacante</Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          <Text className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Completa los detalles de tu oferta de empleo.</Text>

          <View className="mb-4">
            <Text className="text-slate-700 dark:text-slate-200 font-bold mb-2 ml-1">Título del puesto</Text>
            <CustomInput
              placeholder="Ej: Gerente de Ventas"
              value={title}
              onChangeText={setTitle}
              iconName="briefcase-outline"
            />
          </View>

          <View className="mb-4">
            <Text className="text-slate-700 dark:text-slate-200 font-bold mb-2 ml-1">Ubicación</Text>
            <CustomInput
              placeholder="Ej: Bogotá, Colombia"
              value={location}
              onChangeText={setLocation}
              iconName="location-outline"
            />
          </View>

          <View className="mb-4">
            <Text className="text-slate-700 dark:text-slate-200 font-bold mb-2 ml-1">Salario o Rango</Text>
            <CustomInput
              placeholder="Ej: $3.0M - $4.0M COP"
              value={salary}
              onChangeText={setSalary}
              iconName="cash-outline"
            />
          </View>

          <View className="mb-8">
            <Text className="text-slate-700 dark:text-slate-200 font-bold mb-2 ml-1">Descripción del cargo</Text>
            <CustomInput
              placeholder="Describe las responsabilidades y requisitos..."
              value={description}
              onChangeText={setDescription}
              iconName="text-outline"
              multiline
              numberOfLines={4}
            />
          </View>

          <CustomButton
            title={loading ? "Publicando..." : "Publicar Ahora"}
            onPress={handleCreate}
            variant="primary"
            className="mb-10"
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
