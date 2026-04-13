import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface JobData {
  id: string;
  title: string;
  company: string;
  companyDescription?: string;
  location: string;
  salary: string;
  type: string; 
  modality: string; 
  postedAt: string;
  logoColor?: string;
  imageUrl?: string;
  tags?: string[];
}

interface JobCardProps {
  job: JobData;
  onPress?: () => void;
  onInfoPress?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress, onInfoPress }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80';

  return (
    <View style={styles.cardContainer}>
      
      {/* Cover Image with dynamic gradient overlay */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: job.imageUrl || defaultImage }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Darker Overlay for better text readability */}
        <View style={styles.overlay} />

        <View style={styles.cardHeader}>
            <View style={styles.logoCircle}>
                <Ionicons name="cube" size={24} color="#00A3FF" />
            </View>
            <View>
                <Text style={styles.companyName}>{job.company}</Text>
                <Text style={styles.companyDesc}>{job.companyDescription || 'Empresa destacada'}</Text>
            </View>
        </View>

        {/* Badge Flotante "NEW MATCH" */}
        <View style={styles.badge}>
           <Text style={styles.badgeText}>NEW MATCH</Text>
        </View>
      </View>

      {/* Obsidian Dark Content Area */}
      <View style={styles.contentArea}>
          <View style={styles.titleRow}>
             <Text style={styles.jobTitle} numberOfLines={1}>
                {job.title}
             </Text>
             <TouchableOpacity 
               onPress={onInfoPress}
               style={styles.infoBtn}
               activeOpacity={0.7}
             >
                 <Ionicons name="information-circle-outline" size={24} color="#00A3FF" />
             </TouchableOpacity>
          </View>

          <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#475569" />
              <Text style={styles.locationText}>
                 {job.location} • {job.modality}
              </Text>
          </View>

          {/* Tags with Obsidian bordering */}
          <View style={styles.tagsRow}>
             {(job.tags || ['Figma', 'Prototyping', 'User Research']).map((tag, index) => (
                 <View key={index} style={styles.tag}>
                     <Text style={styles.tagText}>{tag}</Text>
                 </View>
             ))}
          </View>

          {/* Futuristic Salary Display */}
          <View style={styles.salaryContainer}>
             <Text style={styles.salaryValue}>
                {job.salary} <Text style={styles.salaryLabel}>/ mes</Text>
             </Text>
          </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#121214',
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  imageContainer: {
    height: '55%',
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardHeader: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(5, 5, 5, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  companyName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowRadius: 4,
  },
  companyDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: 'rgba(5, 5, 5, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  contentArea: {
    flex: 1,
    padding: 24,
    paddingBottom: 70, // Safe zone for floating buttons
    backgroundColor: '#121214',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 163, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.2)',
  },
  typeTag: {
    backgroundColor: 'rgba(0, 163, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 255, 0.2)',
  },
  typeText: {
    color: '#00A3FF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tagText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  salaryContainer: {
    marginTop: 'auto',
  },
  salaryValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00A3FF',
  },
  salaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
  }
});
