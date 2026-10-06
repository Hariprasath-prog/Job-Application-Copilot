import { ScoredChunk, QueryIntent, TrustTier } from '../../types/rag';

export interface RerankerOptions {
  intent?: QueryIntent;
  targetJobId?: string;
  topK?: number; // default 8
}

export class Reranker {
  private static readonly TRUST_AUTHORITY_WEIGHT: Record<TrustTier, number> = {
    Highest: 1.0,
    Medium: 0.8,
    Lower: 0.5
  };

  /**
   * Re-scores and filters retrieved candidates into top 5-10 context chunks.
   */
  static rerank(
    query: string,
    chunks: ScoredChunk[],
    options?: RerankerOptions
  ): ScoredChunk[] {
    const topK = options?.topK ?? 8;
    const intent = options?.intent ?? 'GENERAL_QUERY';
    const targetJobId = options?.targetJobId;
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/[\s,./\\;:_()[\]{}|<>="'+*-]+/).filter(w => w.length > 2);

    for (const item of chunks) {
      let score = item.hybridScore;
      const chunk = item.chunk;
      const contentLower = chunk.content.toLowerCase();
      const titleLower = chunk.title.toLowerCase();

      // 1. Direct Term Coverage
      let coveredWords = 0;
      for (const w of queryWords) {
        if (contentLower.includes(w) || titleLower.includes(w)) {
          coveredWords++;
        }
      }
      const termCoverageRatio = queryWords.length > 0 ? (coveredWords / queryWords.length) : 0;
      score += termCoverageRatio * 0.35;

      // 2. Exact match boost for prominent entities
      if (item.matchedTerms.length > 0) {
        score += Math.min(0.25, item.matchedTerms.length * 0.05);
      }

      // 3. Document Authority Weight
      const trustWeight = this.TRUST_AUTHORITY_WEIGHT[item.provenance.trustTier] || 0.7;
      score *= (0.8 + (0.2 * trustWeight));

      // 4. Intent-specific & Context Alignment
      if (intent === 'RESUME_ANALYSIS' || intent === 'RESUME_TAILORING' || intent === 'PROFILE_QUERY') {
        if (chunk.documentType === 'USER_RESUME' || chunk.documentType === 'USER_PROJECT' || chunk.documentType === 'USER_PROFILE') {
          score += 0.35; // prioritize user's own factual background
        }
      }

      if (intent === 'JOB_ANALYSIS' || intent === 'APPLICATION_PREPARATION' || intent === 'JOB_SEARCH') {
        if (chunk.documentType === 'JOB_DESCRIPTION' || chunk.documentType === 'COMPANY_INFORMATION') {
          score += 0.30;
        }
        if (targetJobId && chunk.metadata.jobId === targetJobId) {
          score += 0.40; // strong boost for target job
        }
      }

      if (intent === 'INTERVIEW_PREPARATION') {
        if (chunk.documentType === 'INTERVIEW_GUIDE' || chunk.documentType === 'USER_PROJECT' || chunk.documentType === 'JOB_DESCRIPTION') {
          score += 0.30;
        }
      }

      if (intent === 'SKILL_GAP') {
        if (chunk.documentType === 'LEARNING_RESOURCE' || chunk.documentType === 'JOB_DESCRIPTION' || chunk.section.toLowerCase().includes('skill')) {
          score += 0.30;
        }
      }

      // 5. Section Importance Alignment
      const secLower = chunk.section.toLowerCase();
      if (secLower.includes('skill') || secLower.includes('qualification') || secLower.includes('requirement')) {
        score += 0.15;
      }

      item.rerankScore = Math.max(0, score);
    }

    chunks.sort((a, b) => b.rerankScore - a.rerankScore);

    // Return top 5 - 10 chunks (bounded by topK)
    return chunks.slice(0, Math.max(5, Math.min(10, topK)));
  }
}
