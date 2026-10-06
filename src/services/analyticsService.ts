import { ApplicationRecord } from '../types/application';
import { JobListing } from '../types/job';

export interface CalculatedAnalytics {
  totalApplications: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  funnel: { stage: string; count: number; percentage: number }[];
  topMissingSkills: { skill: string; frequency: number }[];
  hasEnoughData: boolean;
}

export function calculateAnalytics(applications: ApplicationRecord[], jobs: JobListing[]): CalculatedAnalytics {
  const total = applications.length;

  if (total === 0) {
    return {
      totalApplications: 0,
      responseRate: 0,
      interviewRate: 0,
      offerRate: 0,
      funnel: [
        { stage: 'Saved', count: 0, percentage: 0 },
        { stage: 'Applied', count: 0, percentage: 0 },
        { stage: 'Interview', count: 0, percentage: 0 },
        { stage: 'Offer', count: 0, percentage: 0 }
      ],
      topMissingSkills: [],
      hasEnoughData: false
    };
  }

  const appliedOrFurther = applications.filter(a => a.stage !== 'Saved');
  const appliedCount = appliedOrFurther.length;

  const respondedCount = applications.filter(a =>
    ['Assessment', 'Interview', 'Offer', 'Rejected'].includes(a.stage)
  ).length;

  const interviewCount = applications.filter(a =>
    ['Assessment', 'Interview', 'Offer'].includes(a.stage)
  ).length;

  const offerCount = applications.filter(a => a.stage === 'Offer').length;

  const responseRate = appliedCount > 0 ? Math.round((respondedCount / appliedCount) * 1000) / 10 : 0;
  const interviewRate = appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 1000) / 10 : 0;
  const offerRate = appliedCount > 0 ? Math.round((offerCount / appliedCount) * 1000) / 10 : 0;

  const funnel = [
    { stage: 'Saved', count: applications.filter(a => a.stage === 'Saved').length, percentage: Math.round((applications.filter(a => a.stage === 'Saved').length / total) * 100) },
    { stage: 'Ready to Apply', count: applications.filter(a => a.stage === 'Ready to Apply').length, percentage: Math.round((applications.filter(a => a.stage === 'Ready to Apply').length / total) * 100) },
    { stage: 'Applied', count: applications.filter(a => a.stage === 'Applied').length, percentage: Math.round((applications.filter(a => a.stage === 'Applied').length / total) * 100) },
    { stage: 'Assessment', count: applications.filter(a => a.stage === 'Assessment').length, percentage: Math.round((applications.filter(a => a.stage === 'Assessment').length / total) * 100) },
    { stage: 'Interview', count: applications.filter(a => a.stage === 'Interview').length, percentage: Math.round((applications.filter(a => a.stage === 'Interview').length / total) * 100) },
    { stage: 'Offer', count: offerCount, percentage: Math.round((offerCount / total) * 100) }
  ];

  // Frequency of skills demanded across target job postings
  const skillCountMap = new Map<string, number>();
  jobs.forEach(job => {
    job.requiredSkills.forEach(skill => {
      const canonical = skill.trim();
      skillCountMap.set(canonical, (skillCountMap.get(canonical) || 0) + 1);
    });
  });

  const topMissingSkills = Array.from(skillCountMap.entries())
    .map(([skill, count]) => ({
      skill,
      frequency: jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  return {
    totalApplications: total,
    responseRate,
    interviewRate,
    offerRate,
    funnel,
    topMissingSkills,
    hasEnoughData: total >= 3
  };
}
