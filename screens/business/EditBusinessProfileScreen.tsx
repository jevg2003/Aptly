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
  ActivityIndicator,
  FlatList,
  Modal as RNModal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useBusinessProfile } from '../../lib/BusinessProfileContext';
import { SessionContext } from '../../lib/SessionContext';
import * as DocumentPicker from 'expo-document-picker';
import { pickAndOptimizeImage } from '../../lib/imageUtils';
import { uploadAvatar, uploadDocument } from '../../lib/storageUtils';
import { CustomInput } from '../../components/CustomInput';

const TAG_CATEGORIES: Record<string, string[]> = {
  '🕒 Horarios': ['Tiempo Completo', 'Medio Tiempo', 'Por Horas', 'Turno Noche', 'Fines de Semana', 'Horario Flexible'],
  '👥 Empleados': ['Startup (1-10)', 'Pequeña (11-50)', 'Mediana (51-200)', 'Grande (200+)', 'Equipo Remoto'],
  '🌟 Valores': ['Innovación', 'Diversidad', 'Sostenibilidad', 'Trabajo en Equipo', 'Transparencia', 'Responsabilidad Social'],
  '💼 Beneficios': ['Seguro Médico', 'Bonos', 'Home Office', 'Capacitación', 'Viáticos', 'Plan de Carrera', 'Stock Options'],
  '📍 Modalidad': ['Presencial', 'Híbrido', '100% Remoto', 'Internacional'],
  '🎓 Cultura': ['Startup', 'Corporativo', 'Ágil', 'Meritocracia', 'Creativo', 'Formal'],
};

export const EditBusinessProfileScreen = ({ navigation }: any) => {
  const session = useContext(SessionContext);
  const { profile, updateProfile } = useBusinessProfile();
  
  const [name, setName] = useState(profile.full_name || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [location, setLocation] = useState(profile.location || '');
  const [culture, setCulture] = useState(profile.culture || '');
  const [taxId, setTaxId] = useState(profile.tax_id || '');
  const [industry, setIndustry] = useState(profile.industry || profile.category || '');
  const [businessArea, setBusinessArea] = useState(profile.business_area || '');
  const [phone, setPhone] = useState(profile.phone || '');

  // Parse existing tags from profile (comma-separated string)
  const parseTags = (raw: string) => raw ? raw.split(',').map(t => t.trim()).filter(Boolean) : [];
  const [selectedTags, setSelectedTags] = useState<string[]>(parseTags(profile.company_tags || ''));
  const [customTagInput, setCustomTagInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const allTags = [...new Set([...selectedTags, ...customTags])];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const t = customTagInput.trim();
    if (t && !allTags.includes(t)) {
      setCustomTags(prev => [...prev, t]);
    }
    setCustomTagInput('');
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
    setCustomTags(prev => prev.filter(t => t !== tag));
  };

  const handleDocumentUpload = async () => {
    if (!session?.user?.id) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true
      });
      if (result.canceled) return;
      
      setUploadingDocument(true);
      const asset = result.assets[0];
      const publicUrl = await uploadDocument(asset.uri, session.user.id, asset.name);
      if (!publicUrl) throw new Error('No se pudo subir el archivo.');
      
      await updateProfile({ pdf_name: asset.name });
      Alert.alert('Éxito', 'Presentación institucional subida correctamente.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Hubo un problema al subir el documento.');
    } finally {
      setUploadingDocument(false);
    }
  };
  
  const handleRemoveDocument = async () => {
    await updateProfile({ pdf_name: '' });
  };

  const handleSave = async () => {
    setLoading(true);
    await updateProfile({
      full_name: name,
      website,
      location,
      culture,
      tax_id: taxId,
      industry: industry,
      business_area: businessArea,
      company_tags: allTags.join(', '),
      phone,
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

  const SectionHeader = ({ icon, title }: any) => (
    <View className="flex-row items-center mb-4 mt-8 px-2">
      <View className="w-10 h-10 bg-[#1A1A1C] border border-[#333] rounded-xl items-center justify-center mr-3">
        <MaterialCommunityIcons name={icon} size={20} color="#FF005C" />
      </View>
      <Text className="text-xl font-bold text-white">{title}</Text>
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
          style={{ flex: 1 }}
        >
          <ScrollView 
            style={{ flex: 1, paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            {/* Banner & Logo */}
            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <View style={{ width: '100%', height: 128, backgroundColor: '#121214', borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#475569', fontStyle: 'italic', fontSize: 20 }}>{location || 'Sede Principal'}</Text>
              </View>
              <View style={{ position: 'relative', marginTop: -48 }}>
                <View style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: '#1A1A1C', borderWidth: 4, borderColor: '#050505', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {profile.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <MaterialCommunityIcons name="office-building" size={40} color="#FF005C" />
                  )}
                </View>
                <TouchableOpacity 
                  onPress={handleImageUpload} 
                  disabled={uploadingImage}
                  style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FF005C', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#050505' }}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <MaterialCommunityIcons name="camera" size={14} color="white" />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900', marginTop: 16 }}>{name || 'Sin Nombre'}</Text>
              <View style={{ backgroundColor: '#1a1a1c', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 4, borderWidth: 1, borderColor: '#333' }}>
                <Text style={{ color: '#FF005C', fontWeight: '700', fontSize: 10, textTransform: 'uppercase' }}>{profile.category || 'Empresa'}</Text>
              </View>
            </View>

            {/* Information Section */}
            <SectionHeader icon="file-document-outline" title="Información" />
            
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Nombre de la Empresa</Text>
                <CustomInput placeholder="Nombre de la empresa" value={name} onChangeText={setName} iconName="office-building" />
              </View>

              <View>
                <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Sitio Web</Text>
                <CustomInput placeholder="https://tuempresa.com" value={website} onChangeText={setWebsite} iconName="earth" />
              </View>

              <View>
                <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Ubicación de la Sede</Text>
                <CustomInput placeholder="Ciudad, País" value={location} onChangeText={setLocation} iconName="map-marker-outline" />
              </View>

              <View>
                <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Teléfono de Contacto</Text>
                <CustomInput placeholder="+57 300 000 0000" value={phone} onChangeText={setPhone} iconName="phone-outline" />
              </View>

              <View>
                <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>NIT / ID Fiscal</Text>
                <CustomInput placeholder="Ej. 900.123.456-7" value={taxId} onChangeText={setTaxId} iconName="card-account-details-outline" />
              </View>

              <View>
                <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Sector / Industria</Text>
                <CustomInput placeholder="Ej. Software, Finanzas, Salud" value={industry} onChangeText={setIndustry} iconName="domain" />
              </View>

              <View>
                <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Área de Negocio</Text>
                <CustomInput placeholder="Ej. Desarrollo Web, Contabilidad" value={businessArea} onChangeText={setBusinessArea} iconName="briefcase-outline" />
              </View>
            </View>

            {/* Tags Section */}
            <SectionHeader icon="tag-multiple-outline" title="Etiquetas" />

            {/* Selected tags display */}
            {allTags.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {allTags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => removeTag(tag)}
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,0,92,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,0,92,0.35)', gap: 6 }}
                  >
                    <Text style={{ color: '#FF005C', fontWeight: '800', fontSize: 12 }}>{tag}</Text>
                    <Ionicons name="close" size={13} color="#FF005C" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={{ color: '#475569', fontSize: 13, marginBottom: 12, marginLeft: 4 }}>No has seleccionado etiquetas aún.</Text>
            )}

            <TouchableOpacity
              onPress={() => setShowTagModal(true)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#121214', borderWidth: 1.5, borderColor: 'rgba(255,0,92,0.3)', borderStyle: 'dashed', borderRadius: 24, paddingVertical: 16, gap: 10 }}
            >
              <MaterialCommunityIcons name="tag-plus-outline" size={20} color="#FF005C" />
              <Text style={{ color: '#FF005C', fontWeight: '800', fontSize: 14 }}>Seleccionar Etiquetas</Text>
            </TouchableOpacity>

            {/* Culture Section */}
            <SectionHeader icon="heart-outline" title="Cultura y Valores" />
            <View style={{ backgroundColor: '#121214', borderWidth: 1, borderColor: '#2a2a2e', borderRadius: 24, padding: 16, minHeight: 130 }}>
              <TextInput
                multiline
                numberOfLines={6}
                style={{ color: '#FFF', fontSize: 14, lineHeight: 22, textAlignVertical: 'top' }}
                value={culture}
                onChangeText={setCulture}
                placeholder="Describe la cultura, misión y valores de tu empresa..."
                placeholderTextColor="#475569"
              />
            </View>

            {/* PDF Section */}
            <SectionHeader icon="shield-check-outline" title="Presentación Institucional" />
            
            <TouchableOpacity 
              onPress={handleDocumentUpload} 
              disabled={uploadingDocument}
              style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,0,92,0.3)', borderRadius: 30, backgroundColor: '#121214', alignItems: 'center', justifyContent: 'center', padding: 32, aspectRatio: 2 }}
            >
              {uploadingDocument ? (
                <ActivityIndicator size="large" color="#FF005C" />
              ) : (
                <>
                  <View style={{ width: 48, height: 48, backgroundColor: '#1A1A1C', borderWidth: 1, borderColor: '#333', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <MaterialCommunityIcons name="cloud-upload-outline" size={24} color="#FF005C" />
                  </View>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14 }}>Subir Documento (PDF)</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>Sube la presentación o portafolio de tu empresa</Text>
                </>
              )}
            </TouchableOpacity>

            {profile.pdf_name ? (
              <View style={{ marginTop: 12, backgroundColor: '#121214', padding: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1e1e1e' }}>
                <View style={{ width: 40, height: 40, backgroundColor: '#2a0d15', borderWidth: 1, borderColor: '#4d1323', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="file-pdf-box" size={24} color="#FF005C" />
                </View>
                <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }} numberOfLines={1}>{profile.pdf_name}</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 10 }}>Documento activo</Text>
                </View>
                <TouchableOpacity onPress={handleRemoveDocument}>
                  <Ionicons name="trash-outline" size={18} color="#FF005C" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Delete Account */}
            <View style={{ marginTop: 48, marginBottom: 10 }}>
              <TouchableOpacity style={{ width: '100%', paddingVertical: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,0,92,0.3)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FF005C" />
                <Text style={{ color: '#FF005C', fontWeight: '900', marginLeft: 8, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Eliminar Cuenta de Empresa</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

      </SafeAreaView>

      {/* Tag Picker Modal */}
      <RNModal visible={showTagModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#0A0A0B', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '88%', borderTopWidth: 1, borderColor: '#1e1e1e' }}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#1e1e1e' }}>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>Seleccionar Etiquetas</Text>
              <TouchableOpacity
                onPress={() => setShowTagModal(false)}
                style={{ backgroundColor: '#1A1A1C', borderWidth: 1, borderColor: '#333', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
              {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
                <View key={category} style={{ marginBottom: 24 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>{category}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {tags.map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <TouchableOpacity
                          key={tag}
                          onPress={() => toggleTag(tag)}
                          style={{
                            paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5,
                            backgroundColor: isSelected ? 'rgba(255,0,92,0.12)' : '#121214',
                            borderColor: isSelected ? 'rgba(255,0,92,0.5)' : '#2a2a2e',
                          }}
                        >
                          <Text style={{ color: isSelected ? '#FF005C' : '#94a3b8', fontWeight: '700', fontSize: 13 }}>{tag}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}

              {/* Custom tag input */}
              <View style={{ borderTopWidth: 1, borderColor: '#1e1e1e', paddingTop: 20, marginTop: 4 }}>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>✏️ Crear Etiqueta Propia</Text>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <CustomInput placeholder="Escribe tu etiqueta" value={customTagInput} onChangeText={setCustomTagInput} iconName="tag-plus-outline" />
                  </View>
                  <TouchableOpacity
                    onPress={addCustomTag}
                    style={{ backgroundColor: '#FF005C', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: -14 }}
                  >
                    <Ionicons name="add" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>
                {customTags.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {customTags.map(tag => (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => setCustomTags(prev => prev.filter(t => t !== tag))}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,0,92,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,0,92,0.35)' }}
                      >
                        <Text style={{ color: '#FF005C', fontWeight: '700', fontSize: 12 }}>{tag}</Text>
                        <Ionicons name="close" size={12} color="#FF005C" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Confirm Button */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16, borderTopWidth: 1, borderColor: '#1e1e1e' }}>
              <Text style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>
                {allTags.length} etiqueta{allTags.length !== 1 ? 's' : ''} seleccionada{allTags.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity
                onPress={() => setShowTagModal(false)}
                style={{ backgroundColor: '#FF005C', paddingVertical: 18, borderRadius: 24, alignItems: 'center' }}
              >
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>Confirmar Selección</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </RNModal>
    </View>
  );
};
