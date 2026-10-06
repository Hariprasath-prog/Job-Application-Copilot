export interface Education {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: number;
  cgpaOrPercentage: string;
  currentStatus: 'Studying' | 'Graduated';
}

export interface Project {
  id: string;
  title: string;
  technologies: string[];
  description: string;
  bullets: string[];
  githubUrl?: string;
  liveUrl?: string;
  role?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
  technologies: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface CareerPreferences {
  targetRoles: string[];
  preferredLocations: string[];
  workMode: ('Remote' | 'Hybrid' | 'On-site')[];
  employmentType: ('Internship' | 'Full-time' | 'Contract')[];
  expectedStipendOrSalary: string;
  workAuthorization: string;
  noticePeriod: string;
  graduationBatch: string;
}

export interface SkillsMatrix {
  languages: string[];
  frameworks: string[];
  databases: string[];
  toolsAndPlatforms: string[];
  coreConcepts: string[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  codingProfiles?: {
    platform: string;
    url: string;
    handle: string;
  }[];
  education: Education[];
  skills: SkillsMatrix;
  projects: Project[];
  experience: Experience[];
  certifications: Certification[];
  achievements: string[];
  preferences: CareerPreferences;
  resumeFileName?: string;
  resumeParsedAt?: string;
  updatedAt: string;
}
