import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MatchInfo {
  id: string;
  companyName: string;
  role: string;
  matchDate: string;
  imageUrl: string;
  unread?: boolean;
  salary: string;
  location: string;
  vacancies: number;
  description: string;
  postedAt: string;
}

interface MatchContextType {
  matches: MatchInfo[];
  addMatch: (job: any) => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider = ({ children }: { children: ReactNode }) => {
  const [matches, setMatches] = useState<MatchInfo[]>([]);

  const addMatch = (job: any) => {
    const newMatch: MatchInfo = {
      id: job.id,
      companyName: job.company || job.companyName,
      role: job.title || job.role,
      matchDate: 'Recién ahora',
      imageUrl: job.imageUrl || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80',
      unread: true,
      salary: job.salary || '$2M - $3M COP',
      location: job.location || 'Colombia',
      vacancies: 1,
      description: job.companyDescription || 'Una excelente empresa en crecimiento.',
      postedAt: job.postedAt || 'Hoy',
    };

    setMatches(prev => {
      if (prev.find(m => m.id === newMatch.id)) return prev;
      return [newMatch, ...prev];
    });
  };

  return (
    <MatchContext.Provider value={{ matches, addMatch }}>
      {children}
    </MatchContext.Provider>
  );
};

export const useMatches = () => {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchProvider');
  }
  return context;
};
