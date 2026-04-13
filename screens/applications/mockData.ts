import { 
  TimelineStatus, 
  TimelineStepData, 
  ApplicationStatus, 
  ApplicationData, 
  SHARED_APPLICATIONS 
} from '../../lib/data';

export type { TimelineStatus, TimelineStepData, ApplicationStatus };
export type Application = ApplicationData;
export type AppFilterParam = 'Todas' | 'Activas' | 'Finalizadas';

export const mockApplications: Application[] = SHARED_APPLICATIONS;
