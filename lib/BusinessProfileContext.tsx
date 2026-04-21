import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { SessionContext } from './SessionContext';

export interface BusinessProfile {
  full_name: string;
  category: string;
  location: string;
  website: string;
  culture: string;
  avatar_url?: string;
  team?: any[]; // Keep for future use
}

interface BusinessProfileContextType {
  profile: BusinessProfile;
  updateProfile: (updates: Partial<BusinessProfile>) => Promise<void>;
  loading: boolean;
}

const INITIAL_PROFILE: BusinessProfile = {
  full_name: 'TechFlow Solutions',
  category: 'Software & Tecnología',
  location: 'Ciudad de México, México',
  website: 'https://techflow.io',
  culture: 'Somos una empresa impulsada por la innovación y la colaboración.',
  team: []
};

const BusinessProfileContext = createContext<BusinessProfileContextType | undefined>(undefined);

export const BusinessProfileProvider = ({ children }: { children: ReactNode }) => {
  const session = useContext(SessionContext);
  const [profile, setProfile] = useState<BusinessProfile>(INITIAL_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data && mounted) {
           setProfile(prev => ({
             ...prev,
             full_name: data.full_name || '',
             category: data.professional_title || '',
             location: data.location || '',
             website: data.resume_url || '', // Abusing resume_url for website
             culture: data.bio || '',
             avatar_url: data.avatar_url || '',
             team: prev.team || []
           }));
        }
      } catch (err) {
        console.error('Error loading business profile:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, [session?.user?.id]);

  const updateProfile = async (updates: Partial<BusinessProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    
    if (!session?.user?.id) return;
    
    // Map to DB columns
    const dbUpdate: any = {};
    if (updates.full_name !== undefined) dbUpdate.full_name = updates.full_name;
    if (updates.category !== undefined) dbUpdate.professional_title = updates.category;
    if (updates.location !== undefined) dbUpdate.location = updates.location;
    if (updates.website !== undefined) dbUpdate.resume_url = updates.website;
    if (updates.culture !== undefined) dbUpdate.bio = updates.culture;
    if (updates.avatar_url !== undefined) dbUpdate.avatar_url = updates.avatar_url;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdate)
      .eq('id', session.user.id);
      
    if (error) console.error('Failed to sync profile to DB:', error);
  };

  return (
    <BusinessProfileContext.Provider value={{ profile, updateProfile, loading }}>
      {children}
    </BusinessProfileContext.Provider>
  );
};

export const useBusinessProfile = () => {
  const context = useContext(BusinessProfileContext);
  if (context === undefined) {
    throw new Error('useBusinessProfile must be used within a BusinessProfileProvider');
  }
  return context;
};
