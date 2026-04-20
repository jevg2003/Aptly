import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';

export const CreateVacanteScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [modality, setModality] = useState('Presencial'); // Presencial, Remoto, Híbrido
  const [contractType, setContractType] = useState('Término Indefinido');

  const handleCreate = async () => {
    if (!title || !description || !salary || !location) {
      Alert.alert('Datos incompletos', 'Por favor completa al menos los campos obligatorios (*)');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('jobs').insert([
        {
          title,
          description,
          requirements,
          benefits,
          salary,
          location,
          type: contractType,
          modality,
          company_id: session?.user?.id,
          created_at: new Date().toISOString(),
          status: 'active'
        }
      ]);

      if (error) {
        console.error('Supabase Insert Error:', error.message);
        Alert.alert('Error', 'No se pudo publicar la vacante: ' + error.message);
        return;
      } 
      
      Alert.alert('¡Publicada! 🚀', 'La vacante está ahora disponible para postulaciones.');
      navigation.goBack();
      
    } catch (err) {
      Alert.alert('Error', 'Hubo un problema de conexión al guardar la oferta.');
    } finally {
      setLoading(false);
    }
  };

  const Selector = ({ label, options, current, onSelect }: any) => (
    <View className="mb-6">
      <Text className="text-white font-bold mb-3 ml-1">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt: string) => (
          <TouchableOpacity 
            key={opt}
            onPress={() => onSelect(opt)}
            className={`px-4 py-2 rounded-xl border ${current === opt ? 'bg-[#FF005C] border-[#FF005C]' : 'bg-[#121214] border-white/5'}`}
          >
            <Text className={`text-xs font-bold ${current === opt ? 'text-white' : 'text-slate-500'}`}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#050505]">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-[#1e1e1e]">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-[#1a1a1c] rounded-full mr-3">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-white">Nueva Oferta</Text>
        </View>

        <ScrollView 
            className="flex-1 px-6 pt-6"
            contentContainerStyle={{ paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
        >
          <Text className="text-slate-400 text-sm mb-8">Define los detalles de tu búsqueda para atraer al mejor talento.</Text>

          {/* Campos Principales */}
          <View className="mb-6">
            <Text className="text-slate-700 dark:text-slate-200 font-bold mb-2 ml-1">Título del Cargo *</Text>
            <CustomInput
              placeholder="Ej: Desarrollador React Native Senior"
              value={title}
              onChangeText={setTitle}
              iconName="briefcase-outline"
            />
          </View>

          <View className="mb-6">
            <Text className="text-slate-700 dark:text-slate-200 font-bold mb-2 ml-1">Ubicación *</Text>
            <CustomInput
              placeholder="Ej: Bogotá, Colombia"
              value={location}
              onChangeText={setLocation}
              iconName="map-marker-outline"
            />
          </View>

          <View className="mb-6">
            <Text className="text-slate-700 dark:text-slate-200 font-bold mb-2 ml-1">Salario / Rango *</Text>
            <CustomInput
              placeholder="Ej: $4.0M - $6.0M COP"
              value={salary}
              onChangeText={setSalary}
              iconName="cash"
            />
          </View>

          {/* Selectores */}
          <Selector 
            label="Modalidad de trabajo"
            options={['Presencial', 'Remoto', 'Híbrido']}
            current={modality}
            onSelect={setModality}
          />

          <Selector 
            label="Tipo de contrato"
            options={['Indefinido', 'Término Fijo', 'Prestación de Servicios', 'Prácticas']}
            current={contractType}
            onSelect={setContractType}
          />

          {/* Bloques de Texto */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2 ml-1">
                <Text className="text-slate-700 dark:text-slate-200 font-bold">Descripción del Puesto *</Text>
                <Text className="text-slate-400 text-[10px] ml-2 font-medium">Requerido</Text>
            </View>
            <CustomInput
              placeholder="¿Qué hará la persona en este cargo?..."
              value={description}
              onChangeText={setDescription}
              iconName="file-document-outline"
              multiline
              numberOfLines={4}
            />
          </View>

          <View className="mb-6">
            <Text className="text-slate-700 dark:text-slate-200 font-bold mb-2 ml-1">Requisitos / Perfil</Text>
            <CustomInput
              placeholder="Ej: 3 años de experiencia, Inglés B2..."
              value={requirements}
              onChangeText={setRequirements}
              iconName="format-list-bulleted"
              multiline
              numberOfLines={3}
            />
          </View>

          <View className="mb-10">
            <Text className="text-slate-700 dark:text-slate-200 font-bold mb-2 ml-1">Beneficios Extras</Text>
            <CustomInput
              placeholder="Ej: Seguro médico privado, Gimnasio..."
              value={benefits}
              onChangeText={setBenefits}
              iconName="gift-outline"
              multiline
              numberOfLines={2}
            />
          </View>

          <CustomButton
            title={loading ? "Publicando..." : "Publicar Vacante"}
            onPress={handleCreate}
            variant="primary"
            className="mb-10 shadow-xl shadow-blue-400"
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
