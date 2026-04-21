import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ObsidianHeader } from '../../../components/ObsidianHeader';
import { supabase } from '../../../lib/supabase';
import { SessionContext } from '../../../lib/SessionContext';

export const BusinessProcesosScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchActiveJobs = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      // Obtener vacantes de la empresa que tengan candidatos en proceso (status 'interview')
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          location,
          status,
          applications(count)
        `)
        .eq('company_id', session.user.id)
        .eq('status', 'active');

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs for processes:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchActiveJobs();
  }, []);

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobProcessDetail', { job: item })}
      activeOpacity={0.8}
    >
      <View style={styles.jobInfo}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobLocation}>{item.location}</Text>
      </View>
      <View style={styles.badgeContainer}>
        <Ionicons name="people" size={16} color="#FF005C" />
        <Text style={styles.badgeText}>{item.applications?.[0]?.count || 0}</Text>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" style={{ marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ObsidianHeader 
          title="Gestión" 
          subtitle="PROCESOS DE SELECCIÓN"
        />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#FF005C" />
          </View>
        ) : (
          <FlatList
            data={jobs}
            renderItem={renderJobItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="layers-outline" size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>No tienes vacantes activas aún.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },
  jobCard: {
    backgroundColor: '#121214',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  jobInfo: { flex: 1 },
  jobTitle: { color: 'white', fontSize: 18, fontWeight: '900', marginBottom: 4 },
  jobLocation: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 92, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: { color: 'white', fontWeight: '800', marginLeft: 6, fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 100 },
  emptyText: { color: '#64748b', marginTop: 10, fontSize: 14 }
});
