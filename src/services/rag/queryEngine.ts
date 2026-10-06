import { QueryIntent, ChunkFilter, DocumentType } from '../../types/rag';

export interface QueryAnalysisResult {
  originalQuery: string;
  intent: QueryIntent;
  rewrittenQuery: string;
  recommendedDocumentTypes: DocumentType[];
  targetJobId?: string;
  targetCompany?: string;
  filters: ChunkFilter;
}

export class QueryEngine {
  /**
   * Classifies user query into one of the 12 specified intents
   */
  static classifyIntent(query: string): QueryIntent {
    const q = query.toLowerCase().trim();

    if (q.includes('tailor') || q.includes('customize resume') || (q.includes('resume') && (q.includes('job') || q.includes('target') || q.includes('fit for')))) {
      return 'RESUME_TAILORING';
    }

    if (q.includes('skill gap') || (q.includes('gap') && q.includes('skill')) || (q.includes('what should i learn') || q.includes('roadmap') || q.includes('missing skill'))) {
      return 'SKILL_GAP';
    }

    if (q.includes('interview') || q.includes('prep') || q.includes('dsa question') || q.includes('behavioral question') || q.includes('star method')) {
      return 'INTERVIEW_PREPARATION';
    }

    if (q.includes('suitable') || q.includes('eligib') || q.includes('fit') || q.includes('can i apply') || q.includes('should i apply') || (q.includes('why') && (q.includes('match') || q.includes('score') || q.includes('rank')))) {
      return 'JOB_ANALYSIS';
    }

    if (q.includes('apply') || q.includes('submit') || q.includes('cover letter') || q.includes('application package')) {
      return 'APPLICATION_PREPARATION';
    }

    if (q.includes('resume') || q.includes('cv') || q.includes('education on my') || q.includes('my projects') || q.includes('listed on my resume')) {
      return 'RESUME_ANALYSIS';
    }

    if (q.includes('follow up') || q.includes('applied') || q.includes('status of my') || q.includes('hearing back')) {
      return 'APPLICATION_STATUS';
    }

    if (q.includes('company') || q.includes('culture') || q.includes('office') || q.includes('work environment') || q.includes('accommodation') || q.includes('benefits') || q.includes('perks')) {
      return 'COMPANY_QUERY';
    }

    if (q.includes('profile') || q.includes('contact') || q.includes('gpa') || q.includes('cgpa') || q.includes('degree')) {
      return 'PROFILE_QUERY';
    }

    if (q.includes('find job') || q.includes('internship') || q.includes('search') || q.includes('openings') || q.includes('roles in bangalore')) {
      return 'JOB_SEARCH';
    }

    if (q.includes('career') || q.includes('guideline') || q.includes('advice') || q.includes('tip') || q.includes('market')) {
      return 'CAREER_ADVICE';
    }

    return 'GENERAL_QUERY';
  }

  /**
   * Rewrites conversational or incomplete user queries into explicit retrieval queries
   */
  static rewriteQuery(query: string, intent: QueryIntent, activeJobTitle?: string, activeCompany?: string): string {
    const q = query.toLowerCase().trim();

    switch (intent) {
      case 'JOB_ANALYSIS':
        if (q.includes('can i apply') || q.includes('suitable') || q.includes('should i apply')) {
          return `Evaluate candidate eligibility and job fit for ${activeCompany || 'target company'} ${activeJobTitle || 'role'} using: candidate education, candidate verified skills, projects, job required qualifications, preferred qualifications, and experience requirements`;
        }
        if (q.includes('why') && (q.includes('match') || q.includes('score') || q.includes('rank'))) {
          return `Evidence breakdown for job match calculation: candidate skills in resume, required skills, preferred skills, candidate project portfolio, and education background`;
        }
        return `Detailed requirements, responsibilities, required skills, preferred qualifications, and eligibility for ${activeCompany || ''} ${query}`;

      case 'RESUME_TAILORING':
        return `Tailor candidate resume for ${activeCompany || 'target job'} without inventing unverified facts: map candidate verified projects, skills, education to job required and preferred qualifications`;

      case 'SKILL_GAP':
        return `Identify skill gaps for target role ${activeJobTitle || 'Software Engineer'}: target job required skills, candidate verified skills in resume and profile, high-frequency market requirements, and recommended learning resources`;

      case 'INTERVIEW_PREPARATION':
        return `Technical interview questions, DSA focus patterns, system design topics, and STAR behavioral questions grounded in candidate projects and target job stack for ${activeCompany || 'target opportunity'}`;

      case 'RESUME_ANALYSIS':
        if (q.includes('what programming languages') || q.includes('languages listed')) {
          return `Candidate resume skills section, programming languages, technologies, education, and technical proficiencies`;
        }
        return `Candidate resume verified content: summary, education, technical skills, projects, certifications, and experience`;

      case 'COMPANY_QUERY':
        return `Official company information, job description benefits, compensation, work mode, accommodation, perks, and verified policies for ${activeCompany || query}`;

      case 'APPLICATION_PREPARATION':
        return `Cover letter preparation and application requirements for ${activeCompany || ''}: candidate verified qualifications, alignment with company mission, and answers to application prompts`;

      default:
        return query;
    }
  }

  /**
   * Analyzes the query, establishes filters and security scope
   */
  static analyze(
    query: string,
    currentUserId: string,
    context?: {
      targetJobId?: string;
      targetCompany?: string;
      targetJobTitle?: string;
    }
  ): QueryAnalysisResult {
    const intent = this.classifyIntent(query);
    const rewrittenQuery = this.rewriteQuery(query, intent, context?.targetJobTitle, context?.targetCompany);

    let docTypes: DocumentType[] = [];

    switch (intent) {
      case 'RESUME_ANALYSIS':
      case 'PROFILE_QUERY':
        docTypes = ['USER_RESUME', 'USER_PROJECT', 'USER_CERTIFICATE', 'USER_PROFILE'];
        break;

      case 'JOB_ANALYSIS':
        docTypes = ['JOB_DESCRIPTION', 'COMPANY_INFORMATION', 'USER_RESUME', 'USER_PROFILE', 'USER_PROJECT'];
        break;

      case 'RESUME_TAILORING':
        docTypes = ['USER_RESUME', 'USER_PROJECT', 'USER_PROFILE', 'JOB_DESCRIPTION', 'CAREER_GUIDE'];
        break;

      case 'SKILL_GAP':
        docTypes = ['JOB_DESCRIPTION', 'USER_RESUME', 'USER_PROFILE', 'LEARNING_RESOURCE', 'CAREER_GUIDE'];
        break;

      case 'INTERVIEW_PREPARATION':
        docTypes = ['INTERVIEW_GUIDE', 'JOB_DESCRIPTION', 'USER_RESUME', 'USER_PROJECT'];
        break;

      case 'COMPANY_QUERY':
        docTypes = ['COMPANY_INFORMATION', 'JOB_DESCRIPTION'];
        break;

      case 'APPLICATION_PREPARATION':
        docTypes = ['JOB_DESCRIPTION', 'USER_RESUME', 'USER_PROFILE', 'APPLICATION_DOCUMENT'];
        break;

      case 'CAREER_ADVICE':
        docTypes = ['CAREER_GUIDE', 'LEARNING_RESOURCE', 'INTERVIEW_GUIDE', 'USER_RESUME'];
        break;

      default:
        // Broad search across verified resources
        docTypes = [
          'USER_RESUME',
          'USER_PROJECT',
          'JOB_DESCRIPTION',
          'COMPANY_INFORMATION',
          'INTERVIEW_GUIDE',
          'CAREER_GUIDE',
          'LEARNING_RESOURCE'
        ];
        break;
    }

    const filters: ChunkFilter = {
      userId: currentUserId, // Mandatory security scoping
      documentTypes: docTypes
    };

    if (context?.targetJobId && (intent === 'JOB_ANALYSIS' || intent === 'RESUME_TAILORING')) {
      filters.jobId = context.targetJobId;
    }

    return {
      originalQuery: query,
      intent,
      rewrittenQuery,
      recommendedDocumentTypes: docTypes,
      targetJobId: context?.targetJobId,
      targetCompany: context?.targetCompany,
      filters
    };
  }
}
