import { DocumentChunk, ManagedDocument, ChunkFilter, ScoredChunk } from '../../types/rag';

export interface VectorStore {
  addDocuments(chunks: DocumentChunk[]): Promise<void>;
  search(queryEmbedding: number[], topK: number, filter?: ChunkFilter): Promise<ScoredChunk[]>;
  delete(chunkId: string): Promise<boolean>;
  deleteByDocument(documentId: string): Promise<number>;
  update(chunkId: string, chunk: Partial<DocumentChunk>): Promise<boolean>;
  getAll(filter?: ChunkFilter): Promise<DocumentChunk[]>;
  count(filter?: ChunkFilter): Promise<number>;
}

/**
 * High-performance In-Memory Vector Store with LocalStorage Persistence
 * and Cosine Similarity calculation.
 */
export class InMemoryVectorStore implements VectorStore {
  private chunks: Map<string, DocumentChunk> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private getStorageKey(): string {
    return 'copilot_rag_vector_chunks_v1';
  }

  private loadFromStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(this.getStorageKey());
      if (raw) {
        const list: DocumentChunk[] = JSON.parse(raw);
        for (const item of list) {
          this.chunks.set(item.id, item);
        }
      }
    } catch (e) {
      console.warn('[InMemoryVectorStore] Failed to load chunks from storage:', e);
    }
  }

  private persistToStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const list = Array.from(this.chunks.values());
      // Keep storage safe from quota limits
      localStorage.setItem(this.getStorageKey(), JSON.stringify(list));
    } catch (e) {
      console.warn('[InMemoryVectorStore] Storage quota or serialization warning:', e);
    }
  }

  async addDocuments(chunks: DocumentChunk[]): Promise<void> {
    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk);
    }
    this.persistToStorage();
  }

  /**
   * Computes cosine similarity between two float vectors.
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const len = Math.min(vecA.length, vecB.length);

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < len; i++) {
      const a = vecA[i];
      const b = vecB[i];
      dot += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Applies strict access control and metadata filtering at retrieval time:
   * 1. Private chunks: chunk.userId === filter.userId
   * 2. Public chunks: chunk.visibility === 'public'
   * 3. Optional filters: documentTypes, jobId, documentId
   */
  private matchesFilter(chunk: DocumentChunk, filter?: ChunkFilter): boolean {
    if (!filter) return true;

    // Strict privacy enforcement
    const isOwner = filter.userId && chunk.userId === filter.userId;
    const isPublic = chunk.visibility === 'public';

    if (filter.userId) {
      // Must either be owner of private doc or accessing public doc
      if (!isOwner && !isPublic) {
        return false;
      }
    }

    // Explicit visibility filter
    if (filter.visibility) {
      const allowedVis = Array.isArray(filter.visibility) ? filter.visibility : [filter.visibility];
      if (!allowedVis.includes(chunk.visibility)) {
        return false;
      }
    }

    // Document types filter
    if (filter.documentTypes && filter.documentTypes.length > 0) {
      if (!filter.documentTypes.includes(chunk.documentType)) {
        return false;
      }
    }

    // Document ID filter
    if (filter.documentId && chunk.documentId !== filter.documentId) {
      return false;
    }

    // Job ID filter: if chunk has a jobId metadata, match it
    if (filter.jobId && chunk.metadata.jobId && chunk.metadata.jobId !== filter.jobId) {
      return false;
    }

    return true;
  }

  async search(queryEmbedding: number[], topK: number = 20, filter?: ChunkFilter): Promise<ScoredChunk[]> {
    const candidates: ScoredChunk[] = [];

    for (const chunk of this.chunks.values()) {
      if (!this.matchesFilter(chunk, filter)) continue;

      let score = 0;
      if (chunk.embedding && chunk.embedding.length > 0) {
        score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      }

      candidates.push({
        chunk,
        vectorScore: Math.max(0, Math.min(1, score)),
        keywordScore: 0,
        hybridScore: Math.max(0, Math.min(1, score)),
        rerankScore: Math.max(0, Math.min(1, score)),
        matchedTerms: [],
        provenance: {
          documentName: chunk.source,
          section: chunk.section,
          page: chunk.page,
          source: chunk.source,
          trustTier: chunk.metadata.trustTier || 'Highest'
        }
      });
    }

    // Sort descending by vector similarity
    candidates.sort((a, b) => b.vectorScore - a.vectorScore);
    return candidates.slice(0, topK);
  }

  async delete(chunkId: string): Promise<boolean> {
    const deleted = this.chunks.delete(chunkId);
    if (deleted) this.persistToStorage();
    return deleted;
  }

  async deleteByDocument(documentId: string): Promise<number> {
    let count = 0;
    for (const [id, chunk] of this.chunks.entries()) {
      if (chunk.documentId === documentId) {
        this.chunks.delete(id);
        count++;
      }
    }
    if (count > 0) this.persistToStorage();
    return count;
  }

  async update(chunkId: string, partial: Partial<DocumentChunk>): Promise<boolean> {
    const existing = this.chunks.get(chunkId);
    if (!existing) return false;
    this.chunks.set(chunkId, { ...existing, ...partial });
    this.persistToStorage();
    return true;
  }

  async getAll(filter?: ChunkFilter): Promise<DocumentChunk[]> {
    const results: DocumentChunk[] = [];
    for (const chunk of this.chunks.values()) {
      if (this.matchesFilter(chunk, filter)) {
        results.push(chunk);
      }
    }
    return results;
  }

  async count(filter?: ChunkFilter): Promise<number> {
    let c = 0;
    for (const chunk of this.chunks.values()) {
      if (this.matchesFilter(chunk, filter)) c++;
    }
    return c;
  }

  clear(): void {
    this.chunks.clear();
    localStorage.removeItem(this.getStorageKey());
  }
}

/**
 * Vector Store Manager:
 * Coordinates the vector database instance and managed document metadata records.
 */
export class VectorStoreManager {
  private static store: VectorStore = new InMemoryVectorStore();
  private static readonly DOCS_KEY = 'copilot_rag_managed_documents_v1';
  private static inMemoryDocs: ManagedDocument[] = [];

  static getStore(): VectorStore {
    return this.store;
  }

  static getManagedDocuments(userId?: string): ManagedDocument[] {
    try {
      if (typeof localStorage === 'undefined') {
        if (userId) {
          return this.inMemoryDocs.filter(d => d.userId === userId || d.visibility === 'public');
        }
        return this.inMemoryDocs;
      }
      const raw = localStorage.getItem(this.DOCS_KEY);
      if (!raw) return this.inMemoryDocs;
      const docs: ManagedDocument[] = JSON.parse(raw);
      if (userId) {
        return docs.filter(d => d.userId === userId || d.visibility === 'public');
      }
      return docs;
    } catch {
      return this.inMemoryDocs;
    }
  }

  static saveManagedDocument(doc: ManagedDocument): void {
    const docs = this.getManagedDocuments();
    const idx = docs.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      docs[idx] = doc;
    } else {
      docs.unshift(doc);
    }
    this.inMemoryDocs = docs;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.DOCS_KEY, JSON.stringify(docs));
    }
  }

  static getDocumentByHash(hash: string, userId: string): ManagedDocument | undefined {
    const docs = this.getManagedDocuments();
    return docs.find(d => d.hash === hash && (d.userId === userId || d.visibility === 'public'));
  }

  static async deleteDocument(documentId: string): Promise<void> {
    const docs = this.getManagedDocuments().filter(d => d.id !== documentId);
    localStorage.setItem(this.DOCS_KEY, JSON.stringify(docs));
    await this.store.deleteByDocument(documentId);
  }

  static async addChunks(chunks: DocumentChunk[]): Promise<void> {
    await this.store.addDocuments(chunks);
  }

  static clearAll(): void {
    (this.store as InMemoryVectorStore).clear();
    localStorage.removeItem(this.DOCS_KEY);
  }
}
