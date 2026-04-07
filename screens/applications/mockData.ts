import { 
  TimelineStatus, 
  TimelineStepData, 
  ApplicationStatus, 
  ApplicationData, 
  SHARED_APPLICATIONS 
} from '../../lib/data';

export type { TimelineStatus, TimelineStepData, ApplicationStatus };
export type Application = ApplicationData;

export const mockApplications: Application[] = SHARED_APPLICATIONS;
