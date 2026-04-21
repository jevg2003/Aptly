import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionContext } from '../../lib/SessionContext';

import { ObsidianHeader } from '../../components/ObsidianHeader';

const MOCK_BUSINESS_JOBS: any[] = [];

export const BusinessVacantesScreen = ({ navigation }: any) => {
  const session = React.useContext(SessionContext);
  const [jobs, setJobs] = useState<any[]>(MOCK_BUSINESS_JOBS);
  const [loading, setLoading] = useState(false);

  const fetchJobs = React.useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { data: jobsData, error } = await supabase.from('jobs').select('*').eq('company_id', session.user.id).order('created_at', { ascending: false });
      if (!error && jobsData && jobsData.length > 0) {
        
        const jobIds = jobsData.map((j: any) => j.id);
        const { data: appsData } = await supabase.from('applications').select('id, job_id, status').in('job_id', jobIds);
        
        const mappedJobs = jobsData.map((j: any) => {
            const jobApps = appsData?.filter((a: any) => a.job_id === j.id) || [];
            return {
               ...j,
               postulaciones: jobApps.length,
               newApplicationsCount: jobApps.filter((a: any) => a.status === 'pending').length
            };
        });
        setJobs(mappedJobs);

      } else {
        setJobs([]);
      }
    } catch (err) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useFocusEffect(
    React.useCallback(() => {
      fetchJobs();
    }, [fetchJobs])
  );

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('BusinessHome', { job: item })}
      style={styles.jobCard}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.jobLocation}>{item.location}</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          {item.newApplicationsCount > 0 && (
             <View style={{ backgroundColor: '#FF005C', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{color: 'white', fontSize: 10, fontWeight: 'bold'}}>{item.newApplicationsCount}</Text>
             </View>
          )}
          <View style={styles.statusBadge}>
            <Text style={styles.statusLabel}>ACTIVA</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={14} color="#FF005C" />
          <Text style={styles.statText}>{item.postulaciones || 0} Aplicaciones</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="cash-outline" size={14} color="#64748b" />
          <Text style={styles.statText}>{item.salary}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        
        <ObsidianHeader 
          title="My Vacancies" 
          subtitle="Management Console"
          rightIcon="options-outline"
        />

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color="#FF005C" />
          </View>
        ) : jobs.length > 0 ? (
          <FlatList
            data={jobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            onRefresh={fetchJobs}
            refreshing={loading}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.centerBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="briefcase-outline" size={40} color="#FF005C" />
            </View>
            <Text style={styles.emptyTitle}>No tienes vacantes aún</Text>
            <Text style={styles.emptyText}>Empieza publicando tu primera oferta de empleo para atraer talento.</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateVacante')}
              style={styles.createBtn}
            >
              <Text style={styles.createBtnText}>Publicar Vacante</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {!loading && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('CreateVacante')}
          activeOpacity={0.9}
          style={styles.fab}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  listContent: {
    paddingVertical: 20,
    paddingBottom: 120,
  },
  jobCard: {
    backgroundColor: '#121214',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  titleInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 0, 92, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 92, 0.2)',
  },
  statusLabel: {
    color: '#FF005C',
    fontSize: 9,
    fontWeight: '900',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.03)',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 0, 92, 0.05)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 92, 0.1)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  createBtn: {
    backgroundColor: '#FF005C',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 18,
    shadowColor: '#FF005C',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#FF005C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF005C',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  }
});
