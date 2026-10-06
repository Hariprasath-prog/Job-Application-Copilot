export interface AnalyticsSummary {
  totalJobsDiscovered: number;
  totalSaved: number;
  totalApplied: number;
  totalInterviews: number;
  totalOffers: number;
  totalRejected: number;
  responseRate: number; // percentage
  interviewRate: number; // percentage
  offerRate: number; // percentage
  averageMatchScore: number;
  topSkillGaps: { skill: string; count: number; percentage: number }[];
  mostSuccessfulResume: string;
  hasEnoughData: boolean;
}
