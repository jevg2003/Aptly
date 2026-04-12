import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface BusinessProfile {
  full_name: string;
  category: string;
  location: string;
  website: string;
  culture: string;
  team: TeamMember[];
}

interface BusinessProfileContextType {
  profile: BusinessProfile;
  updateProfile: (updates: Partial<BusinessProfile>) => void;
  updateTeamMember: (id: string, name: string) => void;
}

const INITIAL_PROFILE: BusinessProfile = {
  full_name: 'TechFlow Solutions',
  category: 'Software & Tecnología',
  location: 'Ciudad de México, México',
  website: 'https://techflow.io',
  culture: 'Somos una empresa impulsada por la innovación y la colaboración. Valoramos la transparencia, el aprendizaje continuo y el equilibrio vida-trabajo.',
  team: [
    { id: '1', name: 'Ana Garcia', role: 'Head of People', color: 'bg-slate-800' },
    { id: '2', name: 'Carlos Ruiz', role: 'Tech Recruiter', color: 'bg-green-900' }
  ]
};

const BusinessProfileContext = createContext<BusinessProfileContextType | undefined>(undefined);

export const BusinessProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<BusinessProfile>(INITIAL_PROFILE);

  const updateProfile = (updates: Partial<BusinessProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updateTeamMember = (id: string, name: string) => {
    setProfile(prev => ({
      ...prev,
      team: prev.team.map(member => 
        member.id === id ? { ...member, name } : member
      )
    }));
  };

  return (
    <BusinessProfileContext.Provider value={{ profile, updateProfile, updateTeamMember }}>
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
