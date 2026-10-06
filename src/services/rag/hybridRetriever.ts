import { ChunkFilter, ScoredChunk } from '../../types/rag';
import { VectorStoreManager } from './vectorStore';
import { BM25Search } from './bm25Search';
import { EmbeddingFactory } from './embeddingProvider';

export interface HybridRetrieverOptions {
  vectorWeight?: number; // default 0.6
  keywordWeight?: number; // default 0.4
  topVectorK?: number;    // default 20
  topKeywordK?: number;   // default 20
  topMergedK?: number;    // default 25
}

export class HybridRetriever {
  /**
   * Executes Vector Similarity Search + BM25 Keyword Search,
   * performs Reciprocal Rank Fusion & score interpolation,
   * and deduplicates results.
   */
  static async retrieve(
    query: string,
    filter: ChunkFilter,
    options?: HybridRetrieverOptions
  ): Promise<ScoredChunk[]> {
    const vectorWeight = options?.vectorWeight ?? 0.6;
    const keywordWeight = options?.keywordWeight ?? 0.4;
    const topVectorK = options?.topVectorK ?? 20;
    const topKeywordK = options?.topKeywordK ?? 20;
    const topMergedK = options?.topMergedK ?? 25;

    const vectorStore = VectorStoreManager.getStore();

    // 1. Generate Query Embedding & Run Vector Search
    const { embedding: queryEmbedding } = await EmbeddingFactory.getEmbedding(query);
    const vectorResults = await vectorStore.search(queryEmbedding, topVectorK, filter);

    // 2. Fetch all candidates matching security filter and Run BM25 Search
    const candidateChunks = await vectorStore.getAll(filter);
    const keywordResults = BM25Search.search(query, candidateChunks, { topK: topKeywordK });

    // 3. Merge & Deduplicate with Reciprocal Rank Fusion (RRF) + Normalized Weighted Score
    const mergedMap = new Map<string, ScoredChunk>();
    const rrfK = 60; // Standard RRF parameter

    // Process vector results
    for (let rank = 0; rank < vectorResults.length; rank++) {
      const item = vectorResults[rank];
      const rrfScore = 1 / (rrfK + rank + 1);

      mergedMap.set(item.chunk.id, {
        chunk: item.chunk,
        vectorScore: item.vectorScore,
        keywordScore: 0,
        hybridScore: item.vectorScore * vectorWeight + (rrfScore * 0.2),
        rerankScore: 0,
        matchedTerms: [],
        provenance: item.provenance
      });
    }

    // Merge keyword results
    for (let rank = 0; rank < keywordResults.length; rank++) {
      const item = keywordResults[rank];
      const rrfScore = 1 / (rrfK + rank + 1);

      if (mergedMap.has(item.chunk.id)) {
        const existing = mergedMap.get(item.chunk.id)!;
        existing.keywordScore = item.keywordScore;
        existing.matchedTerms = item.matchedTerms;
        // Joint score: weighted sum + RRF boost for multi-system agreement
        existing.hybridScore = (existing.vectorScore * vectorWeight) +
          (item.keywordScore * keywordWeight) +
          (rrfScore * 0.3) + 0.15; // +0.15 agreement bonus
      } else {
        mergedMap.set(item.chunk.id, {
          chunk: item.chunk,
          vectorScore: 0,
          keywordScore: item.keywordScore,
          hybridScore: (item.keywordScore * keywordWeight) + (rrfScore * 0.2),
          rerankScore: 0,
          matchedTerms: item.matchedTerms,
          provenance: item.provenance
        });
      }
    }

    const mergedList = Array.from(mergedMap.values());
    mergedList.sort((a, b) => b.hybridScore - a.hybridScore);

    return mergedList.slice(0, topMergedK);
  }
}
