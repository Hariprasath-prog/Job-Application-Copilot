import { StorageService } from '../services/storageService';
import { calculateJobMatch } from '../services/matchEngine';
import { searchJobs } from '../services/jobConnectors';
import { parseResumeText } from '../services/resumeParser';
import { analyzeResumeForJob, tailorResumeForJob } from '../services/resumeTailor';
import { generateCoverLetter, generateApplicationAnswers } from '../services/coverLetterGenerator';
import { generateInterviewPrep } from '../services/interviewPrepService';
import { analyzeSkillGaps } from '../services/skillGapService';
import { detectDueFollowUps } from '../services/followUpService';
import { ApplicationStage, ApplicationRecord } from '../types/application';
import { DocumentType } from '../types/rag';
import { HybridRetriever } from '../services/rag/hybridRetriever';
import { Reranker } from '../services/rag/reranker';
import { VectorStoreManager } from '../services/rag/vectorStore';

export interface ToolDefinition {
  name: string;
  description: string;
  execute: (input: any) => Promise<any> | any;
}

export const AgentTools: Record<string, ToolDefinition> = {
  search_jobs: {
    name: 'search_jobs',
    description: 'Search available job opportunities from connected sources, apply criteria, and deduplicate.',
    execute: (input: { query?: string; role?: string; location?: string; skills?: string[]; employmentType?: string }) => {
      const allJobs = StorageService.getJobs();
      const result = searchJobs(allJobs, input.query, {
        role: input.role,
        location: input.location,
        skills: input.skills,
        employmentType: input.employmentType as any
      });
      return result;
    }
  },

  get_job_details: {
    name: 'get_job_details',
    description: 'Retrieve full job description, eligibility, skills, and verification status for a specific job ID.',
    execute: (input: { jobId: string }) => {
      const allJobs = StorageService.getJobs();
      const job = allJobs.find(j => j.id === input.jobId);
      if (!job) throw new Error(`Job with ID ${input.jobId} not found.`);
      return job;
    }
  },

  calculate_job_match: {
    name: 'calculate_job_match',
    description: 'Calculate multi-factor transparent match score, why you match, and missing requirements.',
    execute: (input: { jobId: string }) => {
      const profile = StorageService.getProfile();
      const allJobs = StorageService.getJobs();
      const job = allJobs.find(j => j.id === input.jobId);
      if (!job) throw new Error(`Job with ID ${input.jobId} not found.`);
      return calculateJobMatch(profile, job);
    }
  },

  parse_resume: {
    name: 'parse_resume',
    description: 'Extract structured skills, education, and contact data from uploaded resume text.',
    execute: (input: { rawText: string; fileName?: string }) => {
      return parseResumeText(input.rawText, input.fileName);
    }
  },

  analyze_resume: {
    name: 'analyze_resume',
    description: 'Perform estimated ATS compatibility, keyword match, and impact scoring against a job.',
    execute: (input: { jobId: string }) => {
      const profile = StorageService.getProfile();
      const allJobs = StorageService.getJobs();
      const job = allJobs.find(j => j.id === input.jobId);
      if (!job) throw new Error(`Job with ID ${input.jobId} not found.`);
      return analyzeResumeForJob(profile, job);
    }
  },

  tailor_resume: {
    name: 'tailor_resume',
    description: 'Reorganize verified resume sections to match job requirements without inventing any experience.',
    execute: (input: { jobId: string }) => {
      const profile = StorageService.getProfile();
      const allJobs = StorageService.getJobs();
      const job = allJobs.find(j => j.id === input.jobId);
      if (!job) throw new Error(`Job with ID ${input.jobId} not found.`);
      return tailorResumeForJob(profile, job);
    }
  },

  generate_cover_letter: {
    name: 'generate_cover_letter',
    description: 'Draft a professional, grounded cover letter without generic clichés or fabricated claims.',
    execute: (input: { jobId: string }) => {
      const profile = StorageService.getProfile();
      const allJobs = StorageService.getJobs();
      const job = allJobs.find(j => j.id === input.jobId);
      if (!job) throw new Error(`Job with ID ${input.jobId} not found.`);
      return generateCoverLetter(profile, job);
    }
  },

  prepare_application: {
    name: 'prepare_application',
    description: 'Synthesize full application package: tailored summary, cover letter, and truthful Q&A answers.',
    execute: (input: { jobId: string }) => {
      const profile = StorageService.getProfile();
      const allJobs = StorageService.getJobs();
      const job = allJobs.find(j => j.id === input.jobId);
      if (!job) throw new Error(`Job with ID ${input.jobId} not found.`);

      const tailored = tailorResumeForJob(profile, job);
      const coverLetter = generateCoverLetter(profile, job);
      const qna = generateApplicationAnswers(profile, job);

      return {
        job,
        tailoredResume: tailored,
        coverLetter,
        qna
      };
    }
  },

  track_application: {
    name: 'track_application',
    description: 'Add or update an application record in the Kanban tracker.',
    execute: (input: { jobId: string; stage?: ApplicationStage; notes?: string }) => {
      const profile = StorageService.getProfile();
      const allJobs = StorageService.getJobs();
      const job = allJobs.find(j => j.id === input.jobId);
      if (!job) throw new Error(`Job with ID ${input.jobId} not found.`);

      const apps = StorageService.getApplications();
      const existing = apps.find(a => a.jobId === input.jobId);
      const matchBreakdown = calculateJobMatch(profile, job);

      if (existing) {
        existing.stage = input.stage || existing.stage;
        existing.notes = input.notes || existing.notes;
        existing.dateUpdated = new Date().toISOString();
        StorageService.saveApplications([...apps]);
        return existing;
      } else {
        const newRecord: ApplicationRecord = {
          id: `app_${Date.now()}`,
          jobId: job.id,
          job,
          stage: input.stage || 'Saved',
          matchScore: matchBreakdown.overallScore,
          matchBreakdown,
          dateDiscovered: new Date().toISOString(),
          dateUpdated: new Date().toISOString(),
          notes: input.notes || 'Saved through AI Agent Copilot'
        };
        StorageService.saveApplications([...apps, newRecord]);
        return newRecord;
      }
    }
  },

  update_application_status: {
    name: 'update_application_status',
    description: 'Update the Kanban pipeline stage of an existing application.',
    execute: (input: { applicationId: string; stage: ApplicationStage; dateApplied?: string }) => {
      const apps = StorageService.getApplications();
      const app = apps.find(a => a.id === input.applicationId);
      if (!app) throw new Error(`Application ${input.applicationId} not found.`);
      app.stage = input.stage;
      if (input.stage === 'Applied' && !app.dateApplied) {
        app.dateApplied = input.dateApplied || new Date().toISOString();
        const fDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        app.followUpDate = fDate.toISOString().split('T')[0];
        app.followUpStatus = 'Pending';
      }
      app.dateUpdated = new Date().toISOString();
      StorageService.saveApplications([...apps]);
      return app;
    }
  },

  generate_followup: {
    name: 'generate_followup',
    description: 'Check follow-up status and prepare personalized outreach templates.',
    execute: (input: { applicationId?: string }) => {
      const profile = StorageService.getProfile();
      const apps = StorageService.getApplications();
      const due = detectDueFollowUps(apps, profile);
      if (input.applicationId) {
        return due.find(d => d.applicationId === input.applicationId) || null;
      }
      return due;
    }
  },

  generate_interview_questions: {
    name: 'generate_interview_questions',
    description: 'Generate tailored technical, DSA, behavioral and company questions for a specific job.',
    execute: (input: { jobId: string }) => {
      const profile = StorageService.getProfile();
      const allJobs = StorageService.getJobs();
      const job = allJobs.find(j => j.id === input.jobId);
      if (!job) throw new Error(`Job with ID ${input.jobId} not found.`);
      return generateInterviewPrep(profile, job);
    }
  },

  analyze_skill_gap: {
    name: 'analyze_skill_gap',
    description: 'Compare profile against market demand and categorize into Strong, Develop, and Priority.',
    execute: () => {
      const profile = StorageService.getProfile();
      const allJobs = StorageService.getJobs();
      return analyzeSkillGaps(profile, allJobs);
    }
  },

  create_learning_plan: {
    name: 'create_learning_plan',
    description: 'Generate a 4-week structured learning roadmap targeting high-frequency market gaps.',
    execute: () => {
      const profile = StorageService.getProfile();
      const allJobs = StorageService.getJobs();
      const analysis = analyzeSkillGaps(profile, allJobs);
      return analysis.learningRoadmap;
    }
  },

  // ==================== SECTION 23 & 24: RAG SPECIFIC TOOLS ====================

  /**
   * Universal knowledge base search with session-derived user scoping and hybrid ranking
   */
  search_knowledge_base: {
    name: 'search_knowledge_base',
    description: 'Search across all indexed verified documents with hybrid vector + BM25 keyword retrieval.',
    execute: async (input: { query: string; documentTypes?: DocumentType[]; topK?: number; jobId?: string }) => {
      const currentUserId = StorageService.getProfile().id;
      const filter = {
        userId: currentUserId,
        documentTypes: input.documentTypes,
        jobId: input.jobId
      };
      const candidates = await HybridRetriever.retrieve(input.query, filter, { topMergedK: input.topK || 10 });
      return Reranker.rerank(input.query, candidates, { targetJobId: input.jobId, topK: input.topK || 8 });
    }
  },

  /**
   * Retrieves exclusively candidate-owned documents (Resume, Projects, Certificates, Profile)
   */
  retrieve_user_documents: {
    name: 'retrieve_user_documents',
    description: 'Retrieve user-provided private career documents (Resume, Project architecture specs, Certificates).',
    execute: async (input: { query: string; topK?: number }) => {
      const currentUserId = StorageService.getProfile().id;
      const filter = {
        userId: currentUserId,
        documentTypes: ['USER_RESUME', 'USER_PROJECT', 'USER_CERTIFICATE', 'USER_PROFILE'] as DocumentType[]
      };
      const candidates = await HybridRetriever.retrieve(input.query, filter, { topMergedK: input.topK || 8 });
      return Reranker.rerank(input.query, candidates, { intent: 'RESUME_ANALYSIS', topK: input.topK || 5 });
    }
  },

  /**
   * Retrieves official job description and requirements for a given job
   */
  retrieve_job_context: {
    name: 'retrieve_job_context',
    description: 'Retrieve official job description chunks, required qualifications, and compensation for a role.',
    execute: async (input: { jobId: string; query?: string }) => {
      const currentUserId = StorageService.getProfile().id;
      const q = input.query || 'required qualifications preferred skills responsibilities eligibility';
      const filter = {
        userId: currentUserId,
        jobId: input.jobId,
        documentTypes: ['JOB_DESCRIPTION'] as DocumentType[]
      };
      const candidates = await HybridRetriever.retrieve(q, filter, { topMergedK: 10 });
      return Reranker.rerank(q, candidates, { targetJobId: input.jobId, topK: 6 });
    }
  },

  /**
   * Retrieves verified company culture and hiring process information
   */
  retrieve_company_context: {
    name: 'retrieve_company_context',
    description: 'Retrieve verified official company information, hiring process stages, and engineering culture.',
    execute: async (input: { company: string; query?: string }) => {
      const currentUserId = StorageService.getProfile().id;
      const q = `${input.company} ${input.query || 'engineering culture hiring process interview stages'}`;
      const filter = {
        userId: currentUserId,
        company: input.company,
        documentTypes: ['COMPANY_INFORMATION', 'JOB_DESCRIPTION'] as DocumentType[]
      };
      const candidates = await HybridRetriever.retrieve(q, filter, { topMergedK: 8 });
      return Reranker.rerank(q, candidates, { intent: 'COMPANY_QUERY', topK: 5 });
    }
  },

  /**
   * Retrieves interview guides, DSA problem patterns, and STAR interview prompts
   */
  retrieve_interview_material: {
    name: 'retrieve_interview_material',
    description: 'Retrieve technical interview guides, Java/DSA pattern prep, and STAR behavioral frameworks.',
    execute: async (input: { query: string; topK?: number }) => {
      const currentUserId = StorageService.getProfile().id;
      const filter = {
        userId: currentUserId,
        documentTypes: ['INTERVIEW_GUIDE'] as DocumentType[]
      };
      const candidates = await HybridRetriever.retrieve(input.query, filter, { topMergedK: input.topK || 6 });
      return Reranker.rerank(input.query, candidates, { intent: 'INTERVIEW_PREPARATION', topK: input.topK || 4 });
    }
  },

  /**
   * Retrieves learning resources and roadmaps to bridge skill gaps
   */
  retrieve_learning_resources: {
    name: 'retrieve_learning_resources',
    description: 'Retrieve structured learning resources, transition roadmaps, and cheat sheets.',
    execute: async (input: { skillOrTopic: string; topK?: number }) => {
      const currentUserId = StorageService.getProfile().id;
      const filter = {
        userId: currentUserId,
        documentTypes: ['LEARNING_RESOURCE', 'CAREER_GUIDE'] as DocumentType[]
      };
      const candidates = await HybridRetriever.retrieve(input.skillOrTopic, filter, { topMergedK: input.topK || 6 });
      return Reranker.rerank(input.skillOrTopic, candidates, { intent: 'SKILL_GAP', topK: input.topK || 4 });
    }
  }
};
