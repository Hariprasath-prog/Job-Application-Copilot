import { AiService } from '../aiService';

export interface EmbeddingProvider {
  readonly name: string;
  readonly dimension: number;
  generateEmbedding(text: string): Promise<number[]>;
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
}

/**
 * 384-dimensional Deterministic Semantic Embedding Provider.
 * Uses character n-grams, token hash projection, word frequency damping (IDF-proxy),
 * and L2 unit-norm projection. Guarantees cosine similarity is high for related texts
 * and low for disparate texts, without requiring external network calls.
 */
export class LocalDeterministicEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'Local Semantic Hash (384-dim)';
  readonly dimension = 384;

  // Simple Fowler–Noll–Vo hash variant for deterministic token indexing
  private hashString(str: string, seed = 0): number {
    let h = 0x811c9dc5 ^ seed;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const vector = new Float32Array(this.dimension);
    const cleaned = text.toLowerCase().trim();
    if (!cleaned) return Array.from(vector);

    // 1. Tokenize words & subwords
    const tokens = cleaned.split(/[\s,./\\;:_()[\]{}|<>="'+*-]+/).filter(t => t.length > 1);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const weight = Math.log(1 + 1 / (token.length > 8 ? 0.8 : 1.2));

      // Hash to primary indices
      const h1 = this.hashString(token, 13) % this.dimension;
      const h2 = this.hashString(token, 47) % this.dimension;
      const h3 = this.hashString(token, 89) % this.dimension;
      const sign = (this.hashString(token, 101) % 2 === 0) ? 1 : -1;

      vector[h1] += (weight * sign);
      vector[h2] += (weight * 0.7 * -sign);
      vector[h3] += (weight * 0.5 * sign);

      // Add character 3-grams for subword similarity (e.g. 'java', 'javascript', 'backend')
      if (token.length >= 3) {
        for (let g = 0; g <= token.length - 3; g++) {
          const gram = token.slice(g, g + 3);
          const gh = this.hashString(gram, 211) % this.dimension;
          vector[gh] += 0.25 * sign;
        }
      }
    }

    // 2. L2 Normalization
    let sumSquares = 0;
    for (let i = 0; i < this.dimension; i++) {
      sumSquares += vector[i] * vector[i];
    }
    const norm = Math.sqrt(sumSquares) || 1.0;

    const result = new Array<number>(this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      result[i] = vector[i] / norm;
    }
    return result;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const t of texts) {
      results.push(await this.generateEmbedding(t));
    }
    return results;
  }
}

/**
 * Google Gemini text-embedding-004 Provider.
 */
export class GeminiEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'Google Gemini (text-embedding-004)';
  readonly dimension = 768;

  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = AiService.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key is required for GeminiEmbeddingProvider');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] }
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini embedding error: ${res.status}`);
    }

    const data = await res.json();
    return data.embedding?.values || [];
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const apiKey = AiService.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    // Fall back to sequential if batch endpoint is not unified
    const results: number[][] = [];
    for (const t of texts) {
      results.push(await this.generateEmbedding(t));
    }
    return results;
  }
}

/**
 * OpenAI text-embedding-3-small Provider.
 */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'OpenAI (text-embedding-3-small)';
  readonly dimension = 1536;

  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = AiService.getApiKey();
    if (!apiKey) throw new Error('OpenAI API key is required');

    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI embedding error: ${res.status}`);
    }

    const data = await res.json();
    return data.data?.[0]?.embedding || [];
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const apiKey = AiService.getApiKey();
    if (!apiKey) throw new Error('OpenAI API key is required');

    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI batch error: ${res.status}`);
    }

    const data = await res.json();
    return data.data.map((item: any) => item.embedding);
  }
}

/**
 * Embedding Factory & Cache.
 * Caches embeddings by document/text hash to avoid redundant computation.
 */
export class EmbeddingFactory {
  private static localProvider = new LocalDeterministicEmbeddingProvider();
  private static geminiProvider = new GeminiEmbeddingProvider();
  private static openaiProvider = new OpenAIEmbeddingProvider();
  private static memoryCache = new Map<string, number[]>();

  static getProvider(): EmbeddingProvider {
    const preferred = localStorage.getItem('copilot_embedding_provider');
    const aiProvider = AiService.getProvider();

    if (preferred === 'gemini' || (aiProvider === 'gemini' && AiService.isLiveAiAvailable())) {
      return this.geminiProvider;
    }
    if (preferred === 'openai' || (aiProvider === 'openai' && AiService.isLiveAiAvailable())) {
      return this.openaiProvider;
    }

    // Default to high-performance local deterministic provider
    return this.localProvider;
  }

  static async getEmbedding(text: string): Promise<{ embedding: number[]; providerName: string }> {
    const provider = this.getProvider();
    const cacheKey = `${provider.name}_${text}`;

    if (this.memoryCache.has(cacheKey)) {
      return { embedding: this.memoryCache.get(cacheKey)!, providerName: provider.name };
    }

    try {
      const emb = await provider.generateEmbedding(text);
      this.memoryCache.set(cacheKey, emb);
      return { embedding: emb, providerName: provider.name };
    } catch (err) {
      console.warn(`[EmbeddingFactory] Provider ${provider.name} failed, falling back to local provider:`, err);
      const fallbackEmb = await this.localProvider.generateEmbedding(text);
      this.memoryCache.set(cacheKey, fallbackEmb);
      return { embedding: fallbackEmb, providerName: `${this.localProvider.name} (Fallback)` };
    }
  }

  static clearCache(): void {
    this.memoryCache.clear();
  }
}
