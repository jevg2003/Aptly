import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { ListInput } from '../../components/ListInput';

export const CreateVacanteScreen = ({ route, navigation }: any) => {
  const { job } = route.params || {};
  const isEditing = !!job;
  const session = React.useContext(SessionContext);
  const [loading, setLoading] = useState(false);
  // Form states
  const [title, setTitle] = useState(job?.title || '');
  const [location, setLocation] = useState(job?.location || '');
  const [salary, setSalary] = useState(job?.salary || '');
  const [description, setDescription] = useState(job?.description || '');
  const [requirements, setRequirements] = useState<string[]>(Array.isArray(job?.requirements) ? job?.requirements : []);
  const [benefits, setBenefits] = useState(job?.benefits || '');
  const [tags, setTags] = useState<string[]>(Array.isArray(job?.tags) ? job?.tags : []);
  const [modality, setModality] = useState(job?.modality || 'Presencial'); 
  const [contractType, setContractType] = useState(job?.type || 'Indefinido');

  // Tag suggestion states
  const [tagQuery, setTagQuery] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<any[]>([]);

  const fetchTagSuggestions = async (query: string) => {
    setTagQuery(query);
    if (query.length < 2) {
      setSuggestedTags([]);
      return;
    }

    const { data } = await supabase
      .from('job_tags')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(5);
    
    setSuggestedTags(data || []);
  };

  const addTag = (tagName: string) => {
    const cleanTag = tagName.trim();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagQuery('');
    setSuggestedTags([]);
  };

  const handleCreate = async () => {
    if (!title || !description || !salary || !location) {
      Alert.alert('Datos incompletos', 'Por favor completa al menos los campos obligatorios (*)');
      return;
    }

    setLoading(true);
    try {
      // 1. Upsert unique tags to global directory
      if (tags.length > 0) {
        const tagObjects = tags.map(name => ({ name }));
        await supabase.from('job_tags').upsert(tagObjects, { onConflict: 'name' });
      }

      const jobData = {
        title,
        description,
        requirements,
        benefits,
        salary,
        location,
        type: contractType,
        modality,
        tags,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', job.id);

        if (error) throw error;
        Alert.alert('¡Actualizada! ✅', 'Los cambios se han guardado correctamente.');
      } else {
        const { error } = await supabase.from('jobs').insert([
          {
            ...jobData,
            company_id: session?.user?.id,
            created_at: new Date().toISOString(),
            status: 'active'
          }
        ]);

        if (error) throw error;
        Alert.alert('¡Publicada! 🚀', 'La vacante está ahora disponible para postulaciones.');
      }
      
      navigation.goBack();
      
    } catch (err: any) {
      console.error('Supabase Error:', err.message);
      Alert.alert('Error', 'Hubo un problema al guardar la oferta: ' + err.message);
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
          <Text className="text-xl font-black text-white">{isEditing ? 'Editar Oferta' : 'Nueva Oferta'}</Text>
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

          <ListInput 
            label="Requisitos / Perfil"
            items={requirements}
            setItems={setRequirements}
            placeholder="Ej: 3 años de experiencia en React..."
            iconName="checkmark-circle-outline"
          />

          <View className="mb-6">
            <Text className="text-white font-bold mb-3 ml-1">Etiquetas / Skills</Text>
            <View className="flex-row items-center bg-[#121214] rounded-2xl border border-white/5 px-4 h-14">
              <Ionicons name="pricetag-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
              <TextInput
                className="flex-1 text-white text-sm"
                placeholder="Busca o añade etiquetas (ej: Node.js)"
                placeholderTextColor="#64748b"
                value={tagQuery}
                onChangeText={fetchTagSuggestions}
                onSubmitEditing={() => addTag(tagQuery)}
              />
              <TouchableOpacity 
                onPress={() => addTag(tagQuery)}
                className="w-8 h-8 rounded-full bg-[#FF005C] items-center justify-center"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Suggestions list */}
            {suggestedTags.length > 0 && (
              <View className="bg-[#1A1A1C] mt-2 rounded-2xl border border-white/5 overflow-hidden">
                {suggestedTags.map((tag) => (
                  <TouchableOpacity 
                    key={tag.name}
                    onPress={() => addTag(tag.name)}
                    className="px-4 py-3 border-b border-white/5"
                  >
                    <Text className="text-slate-300 text-sm">{tag.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View className="flex-row flex-wrap gap-2 mt-4">
              {tags.map((tag, index) => (
                <View key={index} className="flex-row items-center bg-[#1A1A1C] px-3 py-2 rounded-xl border border-[#FF005C]/30">
                  <Text className="text-[#FF005C] text-xs font-bold mr-2 uppercase tracking-tighter">{tag}</Text>
                  <TouchableOpacity onPress={() => setTags(tags.filter((_, i) => i !== index))}>
                    <Ionicons name="close-circle" size={16} color="#FF005C" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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
            title={loading ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Publicar Vacante")}
            onPress={handleCreate}
            variant="primary"
            className="mb-10"
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
