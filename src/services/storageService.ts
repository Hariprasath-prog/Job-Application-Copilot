import { UserProfile } from '../types/profile';
import { JobListing } from '../types/job';
import { ApplicationRecord } from '../types/application';
import { AgentMessage, HumanInTheLoopRequest } from '../types/agent';
import { SAMPLE_STUDENT_PROFILE } from '../data/sampleProfile';
import { CURATED_JOBS } from '../data/curatedJobs';
import { calculateJobMatch } from './matchEngine';

const KEYS = {
  PROFILE: 'copilot_profile_v2',
  JOBS: 'copilot_jobs_v2',
  APPLICATIONS: 'copilot_apps_v2',
  MESSAGES: 'copilot_msgs_v2',
  HITL: 'copilot_hitl_v2',
  ONBOARDED: 'copilot_onboarded_v2',
  THEME: 'copilot_theme_v2'
};

export const StorageService = {
  getProfile(): UserProfile {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (!raw) {
      this.saveProfile(SAMPLE_STUDENT_PROFILE);
      return SAMPLE_STUDENT_PROFILE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SAMPLE_STUDENT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getJobs(): JobListing[] {
    const raw = localStorage.getItem(KEYS.JOBS);
    if (!raw) {
      this.saveJobs(CURATED_JOBS);
      return CURATED_JOBS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return CURATED_JOBS;
    }
  },

  saveJobs(jobs: JobListing[]): void {
    localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
  },

  getApplications(): ApplicationRecord[] {
    const raw = localStorage.getItem(KEYS.APPLICATIONS);
    if (!raw) {
      const initial = this.createDefaultSeedApplications();
      this.saveApplications(initial);
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveApplications(apps: ApplicationRecord[]): void {
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  },

  getMessages(): AgentMessage[] {
    const raw = localStorage.getItem(KEYS.MESSAGES);
    if (!raw) {
      const welcome: AgentMessage[] = [
        {
          id: 'msg_welcome_01',
          sender: 'agent',
          text: `Hello Hari! I'm your **Job Application Copilot**. I have reviewed your profile (B.Tech CSE, 2026 Batch) with core strengths in Java, C, and Web Development. I've already scanned connected tech sources and found strong opportunities like **ABC Technologies** (91% match). How can I assist your job search today?`,
          timestamp: new Date().toISOString(),
          steps: [
            {
              id: 'st_1',
              label: 'Verified profile memory loaded (Hari Kumar)',
              status: 'completed',
              timestamp: new Date().toISOString()
            },
            {
              id: 'st_2',
              label: 'Aggregated 8 job listings from connected sources',
              status: 'completed',
              timestamp: new Date().toISOString()
            },
            {
              id: 'st_3',
              label: 'Follow-up agent check: 1 application requires follow-up today',
              status: 'completed',
              timestamp: new Date().toISOString()
            }
          ]
        }
      ];
      this.saveMessages(welcome);
      return welcome;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveMessages(msgs: AgentMessage[]): void {
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(msgs));
  },

  getHitlRequests(): HumanInTheLoopRequest[] {
    const raw = localStorage.getItem(KEYS.HITL);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveHitlRequests(requests: HumanInTheLoopRequest[]): void {
    localStorage.setItem(KEYS.HITL, JSON.stringify(requests));
  },

  isOnboarded(): boolean {
    return localStorage.getItem(KEYS.ONBOARDED) === 'true';
  },

  setOnboarded(value: boolean): void {
    localStorage.setItem(KEYS.ONBOARDED, value ? 'true' : 'false');
  },

  getTheme(): 'dark' | 'light' {
    return (localStorage.getItem(KEYS.THEME) as 'dark' | 'light') || 'dark';
  },

  setTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(KEYS.THEME, theme);
  },

  createDefaultSeedApplications(): ApplicationRecord[] {
    const profile = SAMPLE_STUDENT_PROFILE;
    const jobs = CURATED_JOBS;

    const abcJob = jobs.find(j => j.id === 'job_abc_tech_01') || jobs[0];
    const phonepeJob = jobs.find(j => j.id === 'job_phonepe_get_02') || jobs[1];
    const msftJob = jobs.find(j => j.id === 'job_microsoft_intern_03') || jobs[2];
    const rzpJob = jobs.find(j => j.id === 'job_razorpay_intern_04') || jobs[3];
    const infyJob = jobs.find(j => j.id === 'job_infosys_specialist_08') || jobs[4];

    // Applied 8 days ago to trigger prompt section 15 & 18 follow-up alert!
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const today = new Date().toISOString().split('T')[0];

    const abcMatch = calculateJobMatch(profile, abcJob);
    const phonepeMatch = calculateJobMatch(profile, phonepeJob);
    const msftMatch = calculateJobMatch(profile, msftJob);
    const rzpMatch = calculateJobMatch(profile, rzpJob);
    const infyMatch = calculateJobMatch(profile, infyJob);

    return [
      {
        id: 'app_abc_01',
        jobId: abcJob.id,
        job: abcJob,
        stage: 'Applied',
        matchScore: abcMatch.overallScore,
        matchBreakdown: abcMatch,
        dateDiscovered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        dateApplied: eightDaysAgo,
        dateUpdated: eightDaysAgo,
        resumeVersionUsed: 'Hari_Kumar_Resume_Software_Intern.pdf',
        notes: 'Submitted via career portal with tailored resume highlighting bookstore Java project.',
        followUpDate: today,
        followUpStatus: 'Due Today',
        recruiterContact: {
          name: 'Priya Sharma',
          role: 'University Talent Acquisition Specialist',
          email: 'priya.sharma@abctechnologies.com',
          linkedin: 'https://linkedin.com/in/priyasharma-recruiter'
        }
      },
      {
        id: 'app_phonepe_02',
        jobId: phonepeJob.id,
        job: phonepeJob,
        stage: 'Interview',
        matchScore: phonepeMatch.overallScore,
        matchBreakdown: phonepeMatch,
        dateDiscovered: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        dateApplied: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        dateUpdated: new Date().toISOString(),
        resumeVersionUsed: 'Hari_Kumar_Resume_Backend_Focus.pdf',
        notes: 'Cleared technical screening test on 2nd October. Technical round scheduled.',
        interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        interviewRounds: [
          {
            roundName: 'Round 1: DSA & Concurrency in Java',
            scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            interviewerName: 'Senior Platform Architect',
            completed: false
          }
        ]
      },
      {
        id: 'app_rzp_03',
        jobId: rzpJob.id,
        job: rzpJob,
        stage: 'Ready to Apply',
        matchScore: rzpMatch.overallScore,
        matchBreakdown: rzpMatch,
        dateDiscovered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        dateUpdated: new Date().toISOString(),
        notes: 'Tailored resume generated. Waiting for final confirmation before submitting.'
      },
      {
        id: 'app_msft_04',
        jobId: msftJob.id,
        job: msftJob,
        stage: 'Saved',
        matchScore: msftMatch.overallScore,
        matchBreakdown: msftMatch,
        dateDiscovered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dateUpdated: new Date().toISOString(),
        notes: 'Summer 2026 internship deadline approaching mid October.'
      },
      {
        id: 'app_infy_05',
        jobId: infyJob.id,
        job: infyJob,
        stage: 'Offer',
        matchScore: infyMatch.overallScore,
        matchBreakdown: infyMatch,
        dateDiscovered: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        dateApplied: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        dateUpdated: new Date().toISOString(),
        notes: 'Received Specialist Programmer offer letter after campus recruitment.'
      }
    ];
  },

  exportAllData(): string {
    const data = {
      profile: this.getProfile(),
      jobs: this.getJobs(),
      applications: this.getApplications(),
      messages: this.getMessages(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) this.saveProfile(parsed.profile);
      if (parsed.jobs) this.saveJobs(parsed.jobs);
      if (parsed.applications) this.saveApplications(parsed.applications);
      if (parsed.messages) this.saveMessages(parsed.messages);
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  },

  resetAllDefaults(): void {
    localStorage.removeItem(KEYS.PROFILE);
    localStorage.removeItem(KEYS.JOBS);
    localStorage.removeItem(KEYS.APPLICATIONS);
    localStorage.removeItem(KEYS.MESSAGES);
    localStorage.removeItem(KEYS.HITL);
    localStorage.removeItem(KEYS.ONBOARDED);
  }
};
