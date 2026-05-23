import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Modal as RNModal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMatches, MatchInfo } from '../lib/MatchContext';

const MOCK_MATCHES: MatchInfo[] = [
  {
    id: 'm1',
    companyName: 'Google',
    role: 'Senior Frontend Developer',
    matchDate: 'Hace 5 min',
    imageUrl: 'https://images.unsplash.com/photo-1573806626613-20519f72787c?w=600&q=80',
    unread: true,
    salary: '$140k - $180k',
    location: 'Mountain View, CA (Híbrido)',
    vacancies: 4,
    description:
      'Buscamos un desarrollador con pasión por la UI y sistemas complejos. Google ofrece un ambiente de innovación constante.',
    postedAt: 'Hace 3 días',
  },
  {
    id: 'm2',
    companyName: 'Airbnb',
    role: 'Product Designer',
    matchDate: 'Hace 2 horas',
    imageUrl: 'https://images.unsplash.com/photo-1549923746-c50264f39a18?w=600&q=80',
    unread: true,
    salary: '$110k - $150k',
    location: 'San Francisco, CA (Remoto)',
    vacancies: 2,
    description:
      'Airbnb está redefiniendo cómo viajamos. Ayúdanos a diseñar experiencias que hagan que cualquiera se sienta como en casa.',
    postedAt: 'Hace 1 día',
  },
  {
    id: 'm3',
    companyName: 'Microsoft',
    role: 'Full Stack Engineer',
    matchDate: 'Ayer',
    imageUrl: 'https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?w=600&q=80',
    salary: '$130k - $170k',
    location: 'Redmond, WA (Híbrido)',
    vacancies: 7,
    description:
      'Únete a nuestro equipo de Azure para construir el futuro de la nube a escala global.',
    postedAt: 'Hace 5 días',
  },
];

export const MatchesScreen = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { matches: realMatches } = useMatches();

  const [selectedMatch, setSelectedMatch] = useState<MatchInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const allMatches = [...realMatches, ...MOCK_MATCHES];

  const openCompanyDetail = (match: MatchInfo) => {
    setSelectedMatch(match);
    setModalVisible(true);
  };

  const renderMatchItem = ({ item }: { item: MatchInfo }) => (
    <TouchableOpacity
      className="mx-4 mb-3 flex-row items-center rounded-3xl border border-slate-50 bg-white px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      activeOpacity={0.7}
      onPress={() => openCompanyDetail(item)}>
      <View className="relative">
        <Image source={{ uri: item.imageUrl }} className="h-16 w-16 rounded-2xl" />
        {item.unread && (
          <View className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 dark:border-slate-900" />
        )}
      </View>

      <View className="ml-4 flex-1">
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-slate-800 dark:text-white" numberOfLines={1}>
            {item.companyName}
          </Text>
          <Text className="text-xs text-slate-400 dark:text-slate-500">{item.matchDate}</Text>
        </View>
        <Text className="text-sm font-medium text-slate-500 dark:text-slate-400" numberOfLines={1}>
          {item.role}
        </Text>
        <View className="mt-1 flex-row items-center">
          <Ionicons name="location-outline" size={12} color="#94a3b8" />
          <Text className="ml-1 text-[10px] text-slate-400">{item.location}</Text>
        </View>
      </View>

      <View className="ml-2">
        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#475569' : '#cbd5e1'} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View className="flex-row items-center justify-between px-6 py-4">
        <View>
          <Text className="text-3xl font-black text-slate-900 dark:text-white">Matches</Text>
          <Text className="font-medium text-slate-500 dark:text-slate-400">Tus nuevos matches</Text>
        </View>
        <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-2xl border border-slate-50 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Ionicons name="search" size={22} color={isDarkMode ? '#ffffff' : '#1e293b'} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={allMatches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchItem}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View className="mb-4 px-6">
            <Text className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              RECIENTES
            </Text>
          </View>
        )}
      />

      <RNModal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="h-[85%] overflow-hidden rounded-t-[40px] bg-white dark:bg-slate-900">
            {selectedMatch && (
              <>
                <View className="relative h-60 w-full">
                  <Image
                    source={{ uri: selectedMatch.imageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-black/20" />
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="absolute right-6 top-6 h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30">
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                  <View className="absolute -bottom-10 left-8 rounded-3xl bg-white p-1 shadow-xl dark:bg-slate-900">
                    <Image
                      source={{ uri: selectedMatch.imageUrl }}
                      className="h-20 w-20 rounded-2xl"
                    />
                  </View>
                </View>

                <ScrollView
                  className="flex-1 px-8 pb-10 pt-12"
                  showsVerticalScrollIndicator={false}>
                  <View className="mb-6">
                    <Text className="mb-1 text-3xl font-black text-slate-800 dark:text-white">
                      {selectedMatch.companyName}
                    </Text>
                    <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {selectedMatch.role}
                    </Text>
                  </View>

                  <View className="mb-8 flex-row flex-wrap gap-3">
                    <View className="min-w-[45%] flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <Ionicons name="cash-outline" size={20} color="#10b981" />
                      <Text className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                        Salario
                      </Text>
                      <Text className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {selectedMatch.salary}
                      </Text>
                    </View>

                    <View className="min-w-[45%] flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <Ionicons name="location-outline" size={20} color="#3b82f6" />
                      <Text className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                        Ubicación
                      </Text>
                      <Text
                        className="text-sm font-black text-slate-700 dark:text-slate-200"
                        numberOfLines={1}>
                        {selectedMatch.location}
                      </Text>
                    </View>

                    <View className="min-w-[45%] flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <Ionicons name="briefcase-outline" size={20} color="#f59e0b" />
                      <Text className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                        Vacantes
                      </Text>
                      <Text className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {selectedMatch.vacancies} Disponibles
                      </Text>
                    </View>

                    <View className="min-w-[45%] flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <Ionicons name="time-outline" size={20} color="#6366f1" />
                      <Text className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                        Publicado
                      </Text>
                      <Text className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {selectedMatch.postedAt}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-32">
                    <Text className="mb-2 text-lg font-bold text-slate-800 dark:text-white">
                      Sobre la empresa
                    </Text>
                    <Text className="leading-6 text-slate-500 dark:text-slate-400">
                      {selectedMatch.description}
                    </Text>
                  </View>
                </ScrollView>

                <View className="absolute bottom-8 left-8 right-8">
                  <TouchableOpacity
                    className="h-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-400"
                    onPress={() => setModalVisible(false)}>
                    <Text className="text-lg font-bold text-white">Postularse Ahora</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </RNModal>
    </SafeAreaView>
  );
};
