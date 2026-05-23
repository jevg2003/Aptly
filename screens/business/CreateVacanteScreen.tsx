import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { supabase } from '../../lib/supabase';
import { SessionContext } from '../../lib/SessionContext';
import { ListInput } from '../../components/ListInput';
import { showToast } from '../../components/common/ObsidianToast';
import { ObsidianConfirm } from '../../components/common/ObsidianConfirm';

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
  const [requirements, setRequirements] = useState<string[]>(
    Array.isArray(job?.requirements) ? job?.requirements : []
  );
  const [benefits, setBenefits] = useState(job?.benefits || '');
  const [tags, setTags] = useState<string[]>(Array.isArray(job?.tags) ? job?.tags : []);
  const [modality, setModality] = useState(job?.modality || 'Presencial'); 
  const [contractType, setContractType] = useState(job?.type || 'Tiempo Completo');

  // Tag suggestion states
  const [tagQuery, setTagQuery] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<any[]>([]);

  // Confirm state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmData, setConfirmData] = useState<any>(null);

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
      showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Upsert unique tags to global directory
      if (tags.length > 0) {
        const tagObjects = tags.map((name) => ({ name }));
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
        const { error } = await supabase.from('jobs').update(jobData).eq('id', job.id);

        if (error) throw error;
        showToast('¡Actualizada! Los cambios se han guardado.');
      } else {
        const { error } = await supabase.from('jobs').insert([
          {
            ...jobData,
            company_id: session?.user?.id,
            created_at: new Date().toISOString(),
            status: 'active',
          },
        ]);

        if (error) throw error;
        showToast('¡Publicada! Tu vacante ya está activa.');
      }

      navigation.goBack();
    } catch (err: any) {
      console.error('Supabase Error:', err.message);
      showToast('Error al guardar: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const Selector = ({ label, options, current, onSelect }: any) => (
    <View className="mb-6">
      <Text className="mb-3 ml-1 font-bold text-white">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt: string) => (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            className={`rounded-xl border px-4 py-2 ${current === opt ? 'border-[#FF005C] bg-[#FF005C]' : 'border-white/5 bg-[#121214]'}`}>
            <Text
              className={`text-xs font-bold ${current === opt ? 'text-white' : 'text-slate-500'}`}>
              {opt}
            </Text>
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
        <View className="flex-row items-center border-b border-[#1e1e1e] px-6 py-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1c]">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-white">
            {isEditing ? 'Editar Oferta' : 'Nueva Oferta'}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}>
          <Text className="mb-8 text-sm text-slate-400">
            Define los detalles de tu búsqueda para atraer al mejor talento.
          </Text>

          {/* Campos Principales */}
          <View className="mb-6">
            <Text className="mb-2 ml-1 font-bold text-slate-700 dark:text-slate-200">
              Título del Cargo *
            </Text>
            <CustomInput
              placeholder="Ej: Desarrollador React Native Senior"
              value={title}
              onChangeText={setTitle}
              iconName="briefcase-outline"
            />
          </View>

          <View className="mb-6">
            <Text className="mb-2 ml-1 font-bold text-slate-700 dark:text-slate-200">
              Ubicación *
            </Text>
            <CustomInput
              placeholder="Ej: Bogotá, Colombia"
              value={location}
              onChangeText={setLocation}
              iconName="map-marker-outline"
            />
          </View>

          <View className="mb-6">
            <Text className="mb-2 ml-1 font-bold text-slate-700 dark:text-slate-200">
              Salario / Rango *
            </Text>
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
            label="Tipo de empleo"
            options={['Tiempo Completo', 'Medio Tiempo', 'Freelance', 'Práctica']}
            current={contractType}
            onSelect={setContractType}
          />

          {/* Bloques de Texto */}
          <View className="mb-6">
            <View className="mb-2 ml-1 flex-row items-center">
              <Text className="font-bold text-slate-700 dark:text-slate-200">
                Descripción del Puesto *
              </Text>
              <Text className="ml-2 text-[10px] font-medium text-slate-400">Requerido</Text>
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
            <Text className="mb-3 ml-1 font-bold text-white">Etiquetas / Skills</Text>
            <View className="h-14 flex-row items-center rounded-2xl border border-white/5 bg-[#121214] px-4">
              <Ionicons
                name="pricetag-outline"
                size={20}
                color="#64748b"
                style={{ marginRight: 12 }}
              />
              <TextInput
                className="flex-1 text-sm text-white"
                placeholder="Busca o añade etiquetas (ej: Node.js)"
                placeholderTextColor="#64748b"
                value={tagQuery}
                onChangeText={fetchTagSuggestions}
                onSubmitEditing={() => addTag(tagQuery)}
              />
              <TouchableOpacity
                onPress={() => addTag(tagQuery)}
                className="h-8 w-8 items-center justify-center rounded-full bg-[#FF005C]">
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Suggestions list */}
            {suggestedTags.length > 0 && (
              <View className="mt-2 overflow-hidden rounded-2xl border border-white/5 bg-[#1A1A1C]">
                {suggestedTags.map((tag) => (
                  <TouchableOpacity
                    key={tag.name}
                    onPress={() => addTag(tag.name)}
                    className="border-b border-white/5 px-4 py-3">
                    <Text className="text-sm text-slate-300">{tag.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View className="mt-4 flex-row flex-wrap gap-2">
              {tags.map((tag, index) => (
                <View
                  key={index}
                  className="flex-row items-center rounded-xl border border-[#FF005C]/30 bg-[#1A1A1C] px-3 py-2">
                  <Text className="mr-2 text-xs font-bold uppercase tracking-tighter text-[#FF005C]">
                    {tag}
                  </Text>
                  <TouchableOpacity onPress={() => setTags(tags.filter((_, i) => i !== index))}>
                    <Ionicons name="close-circle" size={16} color="#FF005C" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-10">
            <Text className="mb-2 ml-1 font-bold text-slate-700 dark:text-slate-200">
              Beneficios Extras
            </Text>
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
            title={loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Publicar Vacante'}
            onPress={handleCreate}
            variant="primary"
            className="mb-10"
          />
        </ScrollView>
      </SafeAreaView>

      <ObsidianConfirm
        visible={confirmVisible}
        title={confirmData?.title || ''}
        message={confirmData?.message || ''}
        onConfirm={confirmData?.onConfirm || (() => {})}
        onCancel={() => setConfirmVisible(false)}
        type={confirmData?.type}
      />
    </View>
  );
};
