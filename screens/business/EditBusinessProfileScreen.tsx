import React, { useState, useContext } from 'react';
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
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useBusinessProfile } from '../../lib/BusinessProfileContext';
import { SessionContext } from '../../lib/SessionContext';
import { pickAndOptimizeImage } from '../../lib/imageUtils';
import { uploadAvatar } from '../../lib/storageUtils';
import { CustomInput } from '../../components/CustomInput';

export const EditBusinessProfileScreen = ({ navigation }: any) => {
  const session = useContext(SessionContext);
  const { profile, updateProfile } = useBusinessProfile();
  
  const [name, setName] = useState(profile.full_name || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [location, setLocation] = useState(profile.location || '');
  const [culture, setCulture] = useState(profile.culture || '');
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    
    await updateProfile({
      full_name: name,
      website,
      location,
      culture
    });

    setLoading(false);
    navigation.goBack();
  };

  const handleImageUpload = async () => {
    if (!session?.user?.id) return;
    try {
      setUploadingImage(true);
      
      const localUri = await pickAndOptimizeImage();
      if (!localUri) return;

      const publicUrl = await uploadAvatar(localUri, session.user.id);
      if (!publicUrl) throw new Error('Error al subir la imagen al servidor.');

      await updateProfile({ avatar_url: publicUrl });
      
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Hubo un problema actualizando el logo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const SectionHeader = ({ icon, title, showAdd = false }: any) => (
    <View className="flex-row justify-between items-center mb-4 mt-8 px-2">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-[#1A1A1C] border border-[#333] rounded-xl items-center justify-center mr-3">
            <MaterialCommunityIcons name={icon} size={20} color="#FF005C" />
        </View>
        <Text className="text-xl font-bold text-white">{title}</Text>
      </View>
      {showAdd && (
        <TouchableOpacity className="bg-[#121214] border border-[#333] px-4 py-2 rounded-xl flex-row items-center">
           <Ionicons name="add" size={18} color="#FF005C" />
           <Text className="text-[#FF005C] font-bold ml-1 text-xs">Añadir</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        
        {/* Navigation Header */}
        <View className="px-6 py-4 flex-row justify-between items-center border-b border-[#1A1A1C]">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white">Editar Perfil</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text className={`text-[#FF005C] font-bold text-base ${loading ? 'opacity-50' : ''}`}>
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
              <View className="w-full h-32 bg-[#121214] rounded-[30px] overflow-hidden relative border border-[#1e1e1e]">
                <View className="flex-1 items-center justify-center">
                   <Text className="text-slate-500 font-serif italic text-xl">{location || 'Sede Principal'}</Text>
                </View>
              </View>

              <View className="relative -mt-12">
                <View className="w-28 h-28 rounded-full bg-[#1A1A1C] border-4 border-[#050505] items-center justify-center shadow-lg overflow-hidden">
                   {profile.avatar_url ? (
                     <Image source={{ uri: profile.avatar_url }} style={{ width: '100%', height: '100%' }} />
                   ) : (
                     <MaterialCommunityIcons name="office-building" size={40} color="#FF005C" />
                   )}
                </View>
                <TouchableOpacity 
                   onPress={handleImageUpload} 
                   disabled={uploadingImage}
                   className="absolute bottom-0 right-0 bg-[#FF005C] w-8 h-8 rounded-full items-center justify-center border-4 border-[#050505] shadow-sm"
                >
                   {uploadingImage ? (
                     <ActivityIndicator size="small" color="white" />
                   ) : (
                     <MaterialCommunityIcons name="camera" size={14} color="white" />
                   )}
                </TouchableOpacity>
              </View>

              <Text className="text-2xl font-black text-white mt-4">{name || 'Sin Nombre'}</Text>
              <View className="bg-[#1a1a1c] px-3 py-1 rounded-full mt-1 border border-[#333]">
                 <Text className="text-[#FF005C] font-bold text-[10px] uppercase">{profile.category || 'Empresa'}</Text>
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
                <View className="bg-[#1a1a1c] border border-[#333] rounded-[25px] p-4 min-h-[120px]">
                  <TextInput
                    multiline
                    numberOfLines={5}
                    className="text-white text-sm leading-5"
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
               {(profile.team || []).map((member: any, i: number) => (
                 <View key={member.id} className="bg-[#121214] p-4 rounded-3xl flex-row items-center border border-[#1e1e1e] shadow-lg shadow-black/30">
                    <View className={`w-12 h-12 rounded-full ${member.color} items-center justify-center overflow-hidden`}>
                       <Text className="text-white font-bold text-lg">{member.name.charAt(0)}</Text>
                    </View>
                    <View className="flex-1 ml-3">
                       <Text className="font-bold text-white text-base">{member.name}</Text>
                       <Text className="text-slate-400 text-xs font-medium">{member.role}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => handleEditTeamName(member.id, member.name)}
                      className="bg-[#1a1a1c] border border-[#333] px-4 py-2 rounded-xl"
                    >
                       <Text className="text-[#FF005C] font-bold text-xs flex-row">Editar</Text>
                    </TouchableOpacity>
                 </View>
               ))}
            </View>

            {/* Verification Section */}
            <SectionHeader icon="shield-check-outline" title="Verificación" />
            
            <TouchableOpacity className="w-full aspect-[2/1] border-2 border-dashed border-[#FF005C]/30 rounded-[30px] bg-[#121214] items-center justify-center p-6">
                <View className="w-12 h-12 bg-[#1A1A1C] border border-[#333] rounded-2xl items-center justify-center shadow-sm mb-4">
                  <MaterialCommunityIcons name="cloud-upload-outline" size={24} color="#FF005C" />
                </View>
                <Text className="text-white font-black text-sm">Subir Documentos Legales</Text>
                <Text className="text-slate-400 text-[10px] mt-1">PDF, JPG o PNG hasta 10MB</Text>
                <View className="flex-row mt-4">
                   <View className="bg-[#1A1A1C] border border-[#333] px-3 py-1 rounded-full mr-2 shadow-sm">
                      <Text className="text-slate-400 text-[8px] font-bold uppercase">Constancia Fiscal</Text>
                   </View>
                   <View className="bg-[#1A1A1C] border border-[#333] px-3 py-1 rounded-full shadow-sm">
                      <Text className="text-slate-400 text-[8px] font-bold uppercase">Acta</Text>
                   </View>
                </View>
            </TouchableOpacity>

            <View className="mt-4 bg-[#121214] p-3 rounded-2xl flex-row items-center border border-[#1e1e1e] shadow-lg shadow-black/30">
                <View className="w-10 h-10 bg-[#2a0d15] border border-[#4d1323] rounded-xl items-center justify-center">
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color="#FF005C" />
                </View>
                <View className="flex-1 ml-3 mr-2">
                   <Text className="text-white font-bold text-xs" numberOfLines={1}>Constancia_Fiscal_2024.pdf</Text>
                   <Text className="text-slate-400 text-[9px]">2.4 MB • Subido hace 2 días</Text>
                </View>
                <Ionicons name="trash-outline" size={18} color="#FF005C" />
            </View>

            {/* Logout/Delete */}
            <View className="mt-12 mb-10">
               <TouchableOpacity className="w-full py-4 rounded-3xl border border-[#FF005C]/30 flex-row items-center justify-center">
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FF005C" />
                  <Text className="text-[#FF005C] font-black ml-2 uppercase text-xs tracking-widest">Eliminar Cuenta de Empresa</Text>
               </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

      </SafeAreaView>
    </View>
  );
};
