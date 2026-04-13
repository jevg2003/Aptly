import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

export const StatCard = ({ label, value, sublabel }: StatCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#121214',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sublabel: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2,
    textAlign: 'center',
  }
});
