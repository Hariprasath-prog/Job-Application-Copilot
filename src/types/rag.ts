export type DocumentType =
  | 'USER_RESUME'
  | 'USER_PROJECT'
  | 'USER_CERTIFICATE'
  | 'USER_PROFILE'
  | 'JOB_DESCRIPTION'
  | 'COMPANY_INFORMATION'
  | 'INTERVIEW_GUIDE'
  | 'CAREER_GUIDE'
  | 'LEARNING_RESOURCE'
  | 'APPLICATION_DOCUMENT';

export type DocumentVisibility = 'private' | 'public';

export type IngestionStatus =
  | 'uploading'
  | 'processing'
  | 'chunking'
  | 'embedding'
  | 'indexed'
  | 'failed';

export type TrustTier = 'Highest' | 'Medium' | 'Lower';

export interface DocumentChunkMetadata {
  documentId: string;
  userId: string;
  documentType: DocumentType;
  source: string;
  page?: number;
  section: string;
  createdAt: string;
  visibility: DocumentVisibility;
  jobId?: string;
  company?: string;
  technologies?: string[];
  roleTitle?: string;
  trustTier: TrustTier;
  [key: string]: any;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  userId: string;
  documentType: DocumentType;
  source: string;
  title: string;
  section: string;
  page?: number;
  content: string;
  tokenCount?: number;
  createdAt: string;
  visibility: DocumentVisibility;
  metadata: DocumentChunkMetadata;
  embedding?: number[];
}

export interface ManagedDocument {
  id: string;
  userId: string;
  name: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'html';
  documentType: DocumentType;
  sizeBytes: number;
  hash: string;
  status: IngestionStatus;
  chunksCount: number;
  createdAt: string;
  updatedAt: string;
  visibility: DocumentVisibility;
  errorMessage?: string;
  rawContent?: string;
  metadata?: Record<string, any>;
}

export type QueryIntent =
  | 'JOB_SEARCH'
  | 'JOB_ANALYSIS'
  | 'RESUME_ANALYSIS'
  | 'RESUME_TAILORING'
  | 'SKILL_GAP'
  | 'APPLICATION_PREPARATION'
  | 'INTERVIEW_PREPARATION'
  | 'CAREER_ADVICE'
  | 'PROFILE_QUERY'
  | 'COMPANY_QUERY'
  | 'APPLICATION_STATUS'
  | 'GENERAL_QUERY';

export interface ChunkFilter {
  userId?: string;
  visibility?: DocumentVisibility | DocumentVisibility[];
  documentTypes?: DocumentType[];
  jobId?: string;
  company?: string;
  documentId?: string;
}

export interface ScoredChunk {
  chunk: DocumentChunk;
  vectorScore: number;
  keywordScore: number;
  hybridScore: number;
  rerankScore: number;
  matchedTerms: string[];
  provenance: {
    documentName: string;
    section: string;
    page?: number;
    source: string;
    trustTier: TrustTier;
  };
}

export interface Citation {
  id: string;
  chunkId: string;
  documentId: string;
  documentTitle: string;
  section: string;
  page?: number;
  source: string;
  quoteSnippet: string;
  trustTier: TrustTier;
  verifiedClaim?: string;
}

export interface ConflictNotice {
  detected: boolean;
  topic: string;
  higherAuthoritySource: string;
  lowerAuthoritySource: string;
  higherClaim: string;
  lowerClaim: string;
  resolutionNote: string;
}

export interface GroundedContext {
  structuredContext: string;
  chunksUsed: ScoredChunk[];
  citations: Citation[];
  conflicts: ConflictNotice[];
  evidenceSummary: {
    userEvidence: string[];
    jobEvidence: string[];
    companyEvidence: string[];
    careerGuides: string[];
  };
}

export interface RagDebugTrace {
  id: string;
  query: string;
  intent: QueryIntent;
  rewrittenQuery: string;
  activeUserId: string;
  filtersApplied: ChunkFilter;
  vectorResultsCount: number;
  keywordResultsCount: number;
  hybridMergedCount: number;
  topChunks: ScoredChunk[];
  groundedContextLength: number;
  rawResponse: string;
  citations: Citation[];
  latencyMs: {
    analysis: number;
    retrieval: number;
    rerank: number;
    generation: number;
    total: number;
  };
  embeddingProvider: string;
  timestamp: string;
}

export interface RagEvaluationMetric {
  query: string;
  expectedIntent: QueryIntent;
  expectedDocumentIds: string[];
  retrievedDocumentIds: string[];
  recallAtK: number;
  precisionAtK: number;
  mrr: number; // Mean Reciprocal Rank
  groundednessScore: number; // 0 - 100
  faithfulnessScore: number; // 0 - 100
  citationAccuracy: number; // 0 - 100
  isHallucinationPrevented: boolean;
  verdict: 'PASS' | 'FAIL';
  notes: string;
}
