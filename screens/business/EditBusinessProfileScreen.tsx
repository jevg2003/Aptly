import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { CustomInput } from '../../components/CustomInput';

import { useBusinessProfile } from '../../lib/BusinessProfileContext';

export const EditBusinessProfileScreen = ({ route, navigation }: any) => {
  const { profile, updateProfile, updateTeamMember } = useBusinessProfile();
  
  const [name, setName] = useState(profile.full_name);
  const [website, setWebsite] = useState(profile.website);
  const [location, setLocation] = useState(profile.location);
  const [culture, setCulture] = useState(profile.culture);
  
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    
    updateProfile({
      full_name: name,
      website,
      location,
      culture
    });

    setTimeout(() => {
      setLoading(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      navigation.goBack();
    }, 1000);
  };

  const handleEditTeamName = (id: string, currentName: string) => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Editar Nombre',
        'Ingresa el nuevo nombre para el miembro del equipo',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Guardar', 
            onPress: (newName: string | undefined) => updateTeamMember(id, newName || currentName) 
          }
        ],
        'plain-text',
        currentName
      );
    } else {
      // Basic fallback for Android if prompt is not supported in some Expo versions
      Alert.alert('Funcionalidad', 'Usa el sistema de edición para cambiar nombres (Simulado en web/Android)');
    }
  };

  const SectionHeader = ({ icon, title, showAdd = false }: any) => (
    <View className="flex-row justify-between items-center mb-4 mt-8 px-2">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl items-center justify-center mr-3">
            <MaterialCommunityIcons name={icon} size={20} color="#3b82f6" />
        </View>
        <Text className="text-xl font-bold text-slate-800 dark:text-white">{title}</Text>
      </View>
      {showAdd && (
        <TouchableOpacity className="bg-blue-900 px-4 py-2 rounded-xl flex-row items-center">
           <Ionicons name="add" size={18} color="white" />
           <Text className="text-white font-bold ml-1 text-xs">Añadir</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Navigation Header */}
        <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-50 dark:border-slate-900">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" className="dark:text-white" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900 dark:text-white">Editar Perfil de Empresa</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text className={`text-blue-600 font-bold text-base ${loading ? 'opacity-50' : ''}`}>
              {loading ? '...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView 
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            {/* Banner & Logo Section */}
            <View className="mt-6 items-center">
              <View className="w-full h-32 bg-slate-100 dark:bg-slate-900 rounded-[30px] overflow-hidden relative border border-slate-200 dark:border-slate-800">
                <View className="flex-1 items-center justify-center">
                   <Text className="text-slate-400 font-serif italic text-xl">Company Office</Text>
                </View>
                <TouchableOpacity className="absolute bottom-3 right-3 bg-white/80 dark:bg-slate-800/80 p-2 rounded-full">
                   <Feather name="camera" size={16} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View className="relative -mt-12">
                <View className="w-28 h-28 rounded-full bg-[#f3e3d3] border-4 border-white dark:border-slate-950 items-center justify-center shadow-lg">
                   {/* Logo Placeholder */}
                   <View className="items-center justify-center">
                      <MaterialCommunityIcons name="flower-outline" size={40} color="#8a745d" />
                      <Text className="text-[6px] text-[#8a745d] font-bold mt-1">COMPANY LOGO</Text>
                   </View>
                </View>
                <TouchableOpacity className="absolute bottom-0 right-0 bg-blue-600 w-8 h-8 rounded-full items-center justify-center border-4 border-white dark:border-slate-950 shadow-sm">
                   <MaterialCommunityIcons name="pencil" size={14} color="white" />
                </TouchableOpacity>
              </View>

              <Text className="text-2xl font-black text-slate-900 dark:text-white mt-4">{name}</Text>
              <View className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full mt-1">
                 <Text className="text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase">Empresa de Tecnología</Text>
              </View>
            </View>

            {/* Information Section */}
            <SectionHeader icon="file-document-outline" title="Información" />
            
            <View className="space-y-4">
              <View>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Nombre de la Empresa</Text>
                <CustomInput
                  placeholder="Nombre de la empresa"
                  value={name}
                  onChangeText={setName}
                  iconName="office-building"
                />
              </View>

              <View>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Sitio Web</Text>
                <CustomInput
                  placeholder="https://tuempresa.com"
                  value={website}
                  onChangeText={setWebsite}
                  iconName="earth"
                />
              </View>

              <View>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Ubicación de la Sede</Text>
                <CustomInput
                  placeholder="Ciudad, País"
                  value={location}
                  onChangeText={setLocation}
                  iconName="map-marker-outline"
                />
              </View>

              <View>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Cultura y Valores</Text>
                <View className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[25px] p-4 min-h-[120px]">
                  <TextInput
                    multiline
                    numberOfLines={5}
                    className="text-slate-600 dark:text-slate-300 text-sm leading-5"
                    value={culture}
                    onChangeText={setCulture}
                    textAlignVertical="top"
                    placeholder="Describe la cultura de tu empresa..."
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            </View>

            {/* Team Section */}
            <SectionHeader icon="account-group-outline" title="Equipo" showAdd={true} />
            
            <View className="space-y-3">
               {profile.team.map((member, i) => (
                 <View key={member.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl flex-row items-center border border-slate-50 dark:border-slate-800 shadow-sm shadow-slate-100">
                    <View className={`w-12 h-12 rounded-full ${member.color} items-center justify-center overflow-hidden`}>
                       <MaterialCommunityIcons name="account" size={24} color="white" />
                    </View>
                    <View className="flex-1 ml-4 text-left">
                       <Text className="text-slate-900 dark:text-white font-bold text-sm">{member.name}</Text>
                       <Text className="text-blue-600 text-[10px] font-bold mt-0.5">{member.role}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => handleEditTeamName(member.id, member.name)}
                      className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center"
                    >
                       <MaterialCommunityIcons name="pencil" size={14} color="#cbd5e1" />
                    </TouchableOpacity>
                 </View>
               ))}
            </View>

            {/* Verification Section */}
            <SectionHeader icon="shield-check-outline" title="Verificación" />
            
            <TouchableOpacity className="w-full aspect-[2/1] border-2 border-dashed border-blue-200 dark:border-blue-900/30 rounded-[30px] bg-blue-50/20 items-center justify-center p-6">
                <View className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl items-center justify-center shadow-sm mb-4">
                  <MaterialCommunityIcons name="cloud-upload-outline" size={24} color="#3b82f6" />
                </View>
                <Text className="text-slate-800 dark:text-white font-black text-sm">Subir Documentos Legales</Text>
                <Text className="text-slate-400 text-[10px] mt-1">PDF, JPG o PNG hasta 10MB</Text>
                <View className="flex-row mt-4">
                   <View className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full mr-2 shadow-sm border border-slate-50">
                      <Text className="text-[8px] text-slate-500 font-bold uppercase">Constancia Fiscal</Text>
                   </View>
                   <View className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm border border-slate-50">
                      <Text className="text-[8px] text-slate-500 font-bold uppercase">Acta</Text>
                   </View>
                </View>
            </TouchableOpacity>

            <View className="mt-4 bg-white dark:bg-slate-900 p-3 rounded-2xl flex-row items-center border border-slate-50 dark:border-slate-800 shadow-sm shadow-slate-100">
                <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center">
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color="#ef4444" />
                </View>
                <View className="flex-1 ml-3 mr-2">
                   <Text className="text-slate-800 dark:text-white font-bold text-xs" numberOfLines={1}>Constancia_Fiscal_2024.pdf</Text>
                   <Text className="text-slate-400 text-[9px]">2.4 MB • Subido hace 2 días</Text>
                </View>
                <Ionicons name="trash-outline" size={18} color="#cbd5e1" />
            </View>

            {/* Logout/Delete */}
            <View className="mt-12 mb-10">
               <TouchableOpacity className="w-full py-4 rounded-3xl border border-red-100 dark:border-red-900/50 flex-row items-center justify-center">
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
                  <Text className="text-red-500 font-black ml-2 uppercase text-xs tracking-widest">Eliminar Cuenta de Empresa</Text>
               </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

      </SafeAreaView>
    </View>
  );
};
