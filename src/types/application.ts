import { JobListing, JobMatchBreakdown } from './job';

export type ApplicationStage =
  | 'Saved'
  | 'Ready to Apply'
  | 'Applied'
  | 'Assessment'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export interface ApplicationRecord {
  id: string;
  jobId: string;
  job: JobListing;
  stage: ApplicationStage;
  matchScore: number;
  matchBreakdown?: JobMatchBreakdown;
  dateDiscovered: string;
  dateApplied?: string;
  dateUpdated: string;
  resumeVersionUsed?: string;
  tailoredResumeText?: string;
  coverLetterText?: string;
  applicationAnswers?: {
    question: string;
    answer: string;
    verifiedBasis: string;
  }[];
  notes: string;
  followUpDate?: string;
  followUpStatus?: 'Pending' | 'Due Today' | 'Overdue' | 'Sent';
  followUpDraft?: string;
  interviewDate?: string;
  interviewRounds?: {
    roundName: string;
    scheduledAt: string;
    interviewerName?: string;
    completed: boolean;
    notes?: string;
  }[];
  recruiterContact?: {
    name?: string;
    role?: string;
    email?: string;
    linkedin?: string;
  };
  deadline?: string;
}
