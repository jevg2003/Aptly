import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Application } from '../../screens/applications/mockData';

interface ApplicationCardProps {
  application: Application;
  onPress: () => void;
}

export const ApplicationCard = ({ application, onPress }: ApplicationCardProps) => {
  const { companyName, status, statusColor, subtitle, buttonVariant, buttonText, imageUri } = application;
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.leftContent}>
        <View>
          <View style={styles.statusRow}>
             <View style={[styles.statusDot, { backgroundColor: status === 'Entrevista' ? '#00A3FF' : '#475569' }]} />
             <Text style={styles.statusText}>{status}</Text>
          </View>
          
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View 
          style={[
            styles.actionBtn, 
            buttonVariant === 'filled' ? styles.btnFilled : styles.btnGhost
          ]}
        >
          <Text style={[
            styles.btnText,
            buttonVariant === 'filled' ? styles.textWhite : styles.textBlue
          ]}>
            {buttonText}
          </Text>
        </View>
      </View>
      
      <View style={styles.imageContainer}>
         <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121214',
    borderRadius: 24,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  leftContent: {
    flex: 1,
    paddingRight: 15,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    color: '#00A3FF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  actionBtn: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  btnFilled: {
    backgroundColor: '#00A3FF',
  },
  btnGhost: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textBlue: {
    color: '#00A3FF',
  },
  imageContainer: {
    width: 110,
    height: 110,
    borderRadius: 18,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#050505',
  },
  image: {
    width: '100%',
    height: '100%',
  }
});
