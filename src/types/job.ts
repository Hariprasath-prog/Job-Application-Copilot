export type JobPriority = 'HIGH PRIORITY' | 'GOOD MATCH' | 'STRETCH' | 'LOW MATCH';

export type EmploymentType = 'Internship' | 'Full-time' | 'Contract' | 'Part-time';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export interface JobMatchBreakdown {
  overallScore: number; // 0 - 100
  skillMatch: number; // 0 - 100
  educationMatch: number; // 0 - 100
  experienceMatch: number; // 0 - 100
  locationMatch: number; // 0 - 100
  roleMatch: number; // 0 - 100
  eligibility: number; // 0 - 100

  matchedSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];

  whyYouMatch: string[];
  weaknessesOrGaps: string[];
  potentialConcerns: string[];

  priority: JobPriority;
  recommendation: 'APPLY' | 'CONSIDER WITH CAUTION' | 'STRETCH OPPORTUNITY' | 'DO NOT APPLY';
  recommendationReason: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  experienceRequired: string; // e.g. "0-1 years" or "Fresher accepted"
  minExperienceYears: number;
  maxExperienceYears: number;
  targetGraduationYears?: number[];
  stipendOrSalary: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  educationRequirement: string;
  source: 'LinkedIn Jobs' | 'Indeed' | 'Wellfound' | 'Internshala' | 'Company Career Page' | 'Direct API Feed';
  sourceUrl: string;
  postedDate: string;
  deadline?: string;
  isVerifiedSource: boolean;
  isDemoData: boolean;
  canonicalId?: string; // For duplicate resolution
  duplicateSources?: string[];
  department?: string;
  workAuthorizationRequired?: string;
}
