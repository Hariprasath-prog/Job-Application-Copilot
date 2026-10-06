import { DocumentChunk, ChunkFilter, ScoredChunk } from '../../types/rag';

export interface BM25SearchOptions {
  k1?: number; // term frequency saturation (default 1.5)
  b?: number;  // document length normalization (default 0.75)
  topK?: number;
}

export class BM25Search {
  private static readonly STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'i', 'my', 'me', 'am', 'can',
    'you', 'your', 'this', 'do', 'does', 'how', 'what', 'which', 'who'
  ]);

  /**
   * Tokenizes text preserving critical technical patterns like "C++", "C#", "Node.js", "Java 17", "B.Tech"
   */
  static tokenize(text: string): string[] {
    const rawTokens = text.toLowerCase()
      .replace(/b\.tech/gi, 'btech')
      .replace(/b\.e\./gi, 'be')
      .replace(/c\+\+/gi, 'cpp')
      .replace(/c#/gi, 'csharp')
      .replace(/node\.js/gi, 'nodejs')
      .replace(/vue\.js/gi, 'vuejs')
      .split(/[\s,./\\;:_()[\]{}|<>="'+*-]+/)
      .filter(t => t.length > 0);

    return rawTokens.filter(t => !this.STOPWORDS.has(t) || t === 'c');
  }

  /**
   * Performs BM25 scoring over chunks matching filter criteria
   */
  static search(
    query: string,
    chunks: DocumentChunk[],
    options?: BM25SearchOptions
  ): ScoredChunk[] {
    const k1 = options?.k1 ?? 1.5;
    const b = options?.b ?? 0.75;
    const topK = options?.topK ?? 20;

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0 || chunks.length === 0) {
      return [];
    }

    // 1. Calculate Average Document Length and Document Frequencies (DF)
    let totalLen = 0;
    const chunkTokensMap = new Map<string, string[]>();
    const docFrequency = new Map<string, number>();

    for (const chunk of chunks) {
      const tokens = this.tokenize(`${chunk.title} ${chunk.section} ${chunk.content}`);
      chunkTokensMap.set(chunk.id, tokens);
      totalLen += tokens.length;

      // Unique terms in this chunk
      const uniqueChunkTerms = new Set(tokens);
      for (const term of uniqueChunkTerms) {
        docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
      }
    }

    const N = chunks.length;
    const avgdl = totalLen / Math.max(1, N);

    // 2. Score each chunk
    const scoredList: ScoredChunk[] = [];
    const queryLower = query.toLowerCase();

    for (const chunk of chunks) {
      const tokens = chunkTokensMap.get(chunk.id) || [];
      const docLen = tokens.length;

      // Count Term Frequencies (TF)
      const tfMap = new Map<string, number>();
      for (const t of tokens) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
      }

      let score = 0;
      const matchedTerms: string[] = [];

      for (const qTerm of queryTokens) {
        const tf = tfMap.get(qTerm) || 0;
        if (tf > 0) {
          matchedTerms.push(qTerm);
          const df = docFrequency.get(qTerm) || 1;
          // Standard BM25 IDF formula
          const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
          const tfComponent = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgdl)));
          score += idf * tfComponent;
        }
      }

      // Exact substring boost for important phrases (e.g. "Java 17", "Spring Boot", company names)
      const chunkLower = chunk.content.toLowerCase();
      if (queryTokens.length > 1 && chunkLower.includes(queryLower)) {
        score += 3.0; // high boost for exact phrase match
      }

      // Title & section match boosts
      if (chunk.section.toLowerCase().includes(queryLower)) {
        score += 1.5;
      }

      if (score > 0) {
        scoredList.push({
          chunk,
          vectorScore: 0,
          keywordScore: score,
          hybridScore: score,
          rerankScore: score,
          matchedTerms,
          provenance: {
            documentName: chunk.source,
            section: chunk.section,
            page: chunk.page,
            source: chunk.source,
            trustTier: chunk.metadata.trustTier || 'Highest'
          }
        });
      }
    }

    // Normalize BM25 scores between 0 and 1
    if (scoredList.length > 0) {
      const maxScore = Math.max(...scoredList.map(s => s.keywordScore));
      if (maxScore > 0) {
        for (const item of scoredList) {
          item.keywordScore = Math.min(1, item.keywordScore / maxScore);
        }
      }
    }

    scoredList.sort((a, b) => b.keywordScore - a.keywordScore);
    return scoredList.slice(0, topK);
  }
}
