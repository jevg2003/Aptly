import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Modal,
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
    description: 'Buscamos un desarrollador con pasión por la UI y sistemas complejos. Google ofrece un ambiente de innovación constante.',
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
    description: 'Airbnb está redefiniendo cómo viajamos. Ayúdanos a diseñar experiencias que hagan que cualquiera se sienta como en casa.',
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
    description: 'Únete a nuestro equipo de Azure para construir el futuro de la nube a escala global.',
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
      className="flex-row items-center px-6 py-4 mb-3 bg-white dark:bg-slate-900 mx-4 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-800"
      activeOpacity={0.7}
      onPress={() => openCompanyDetail(item)}
    >
      <View className="relative">
        <Image source={{ uri: item.imageUrl }} className="w-16 h-16 rounded-2xl" />
        {item.unread && (
          <View className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900" />
        )}
      </View>

      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-lg font-bold text-slate-800 dark:text-white" numberOfLines={1}>{item.companyName}</Text>
          <Text className="text-xs text-slate-400 dark:text-slate-500">{item.matchDate}</Text>
        </View>
        <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium" numberOfLines={1}>{item.role}</Text>
        <View className="flex-row mt-1 items-center">
          <Ionicons name="location-outline" size={12} color="#94a3b8" />
          <Text className="text-[10px] text-slate-400 ml-1">{item.location}</Text>
        </View>
      </View>

      <View className="ml-2">
        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#475569" : "#cbd5e1"} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View className="px-6 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-black text-slate-900 dark:text-white">Matches</Text>
          <Text className="text-slate-500 dark:text-slate-400 font-medium">Tus nuevos matches</Text>
        </View>
        <TouchableOpacity className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 items-center justify-center shadow-sm border border-slate-50 dark:border-slate-800">
          <Ionicons name="search" size={22} color={isDarkMode ? "#ffffff" : "#1e293b"} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={allMatches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchItem}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View className="px-6 mb-4">
            <Text className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">RECIENTES</Text>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white dark:bg-slate-900 h-[85%] rounded-t-[40px] overflow-hidden">
            {selectedMatch && (
              <>
                <View className="h-60 w-full relative">
                  <Image source={{ uri: selectedMatch.imageUrl }} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute inset-0 bg-black/20" />
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="absolute top-6 right-6 w-10 h-10 bg-black/30 rounded-full items-center justify-center border border-white/20"
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                  <View className="absolute -bottom-10 left-8 p-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xl">
                    <Image source={{ uri: selectedMatch.imageUrl }} className="w-20 h-20 rounded-2xl" />
                  </View>
                </View>

                <ScrollView className="flex-1 px-8 pt-12 pb-10" showsVerticalScrollIndicator={false}>
                  <View className="mb-6">
                    <Text className="text-3xl font-black text-slate-800 dark:text-white mb-1">{selectedMatch.companyName}</Text>
                    <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedMatch.role}</Text>
                  </View>

                  <View className="flex-row flex-wrap gap-3 mb-8">
                    <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex-1 min-w-[45%] border border-slate-100 dark:border-slate-700">
                      <Ionicons name="cash-outline" size={20} color="#10b981" />
                      <Text className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Salario</Text>
                      <Text className="text-sm font-black text-slate-700 dark:text-slate-200">{selectedMatch.salary}</Text>
                    </View>

                    <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex-1 min-w-[45%] border border-slate-100 dark:border-slate-700">
                      <Ionicons name="location-outline" size={20} color="#3b82f6" />
                      <Text className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Ubicación</Text>
                      <Text className="text-sm font-black text-slate-700 dark:text-slate-200" numberOfLines={1}>{selectedMatch.location}</Text>
                    </View>

                    <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex-1 min-w-[45%] border border-slate-100 dark:border-slate-700">
                      <Ionicons name="briefcase-outline" size={20} color="#f59e0b" />
                      <Text className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Vacantes</Text>
                      <Text className="text-sm font-black text-slate-700 dark:text-slate-200">{selectedMatch.vacancies} Disponibles</Text>
                    </View>

                    <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex-1 min-w-[45%] border border-slate-100 dark:border-slate-700">
                      <Ionicons name="time-outline" size={20} color="#6366f1" />
                      <Text className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Publicado</Text>
                      <Text className="text-sm font-black text-slate-700 dark:text-slate-200">{selectedMatch.postedAt}</Text>
                    </View>
                  </View>

                  <View className="mb-32">
                    <Text className="text-lg font-bold text-slate-800 dark:text-white mb-2">Sobre la empresa</Text>
                    <Text className="text-slate-500 dark:text-slate-400 leading-6">{selectedMatch.description}</Text>
                  </View>
                </ScrollView>

                <View className="absolute bottom-8 left-8 right-8">
                  <TouchableOpacity
                    className="bg-blue-600 h-16 rounded-2xl items-center justify-center shadow-lg shadow-blue-400"
                    onPress={() => setModalVisible(false)}
                  >
                    <Text className="text-white font-bold text-lg">Postularse Ahora</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
