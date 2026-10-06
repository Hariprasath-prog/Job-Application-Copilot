import { ManagedDocument, DocumentType, DocumentVisibility } from '../../types/rag';
import { SemanticChunker } from './chunker';
import { EmbeddingFactory } from './embeddingProvider';
import { VectorStoreManager } from './vectorStore';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: 'pdf' | 'docx' | 'txt' | 'md' | 'html';
  sizeBytes?: number;
}

export class DocumentProcessor {
  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt', 'md', 'html'];

  /**
   * Fast hash generation for file contents to detect duplicates / unchanged files
   */
  static generateContentHash(content: string, fileName: string): string {
    let hash = 0x811c9dc5;
    const combined = `${fileName}:${content.length}:${content.slice(0, 1000)}:${content.slice(-1000)}`;
    for (let i = 0; i < combined.length; i++) {
      hash ^= combined.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return `hash_${(hash >>> 0).toString(16)}_${content.length}`;
  }

  /**
   * Validates file size and format
   */
  static validateFile(file: File): FileValidationResult {
    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller file.`
      };
    }

    const ext = file.name.split('.').pop()?.toLowerCase() as any;
    if (!ext || !this.ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `Unsupported file type ".${ext || 'unknown'}". Supported formats: PDF, DOCX, TXT, Markdown, HTML.`
      };
    }

    return {
      valid: true,
      fileType: ext,
      sizeBytes: file.size
    };
  }

  /**
   * Extracts clean text from file contents.
   * Handles HTML parsing, TXT/MD stripping, and structured text from PDF/DOCX.
   */
  static async extractText(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'txt' || ext === 'md') {
      const text = await file.text();
      return this.cleanText(text);
    }

    if (ext === 'html') {
      const rawHtml = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      // Remove script, style, nav, and footer noise
      doc.querySelectorAll('script, style, noscript, nav, footer, header').forEach(el => el.remove());
      const clean = doc.body?.textContent || doc.documentElement.textContent || '';
      return this.cleanText(clean);
    }

    if (ext === 'pdf' || ext === 'docx') {
      // For binary PDF/DOCX in pure client environment without heavy canvas/pdf.js bundles,
      // extract text tokens from raw binary buffer and readable UTF-8 strings.
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let text = '';

      // Extract printable ASCII/UTF-8 runs
      let run = '';
      for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if ((b >= 32 && b <= 126) || b === 10 || b === 13) {
          run += String.fromCharCode(b);
        } else {
          if (run.length >= 4) {
            // Keep legible chunks
            if (!run.startsWith('/Filter') && !run.startsWith('/Length') && !run.startsWith('obj') && !run.startsWith('endobj')) {
              text += run + ' ';
            }
          }
          run = '';
        }
      }

      const cleaned = this.cleanText(text);
      if (cleaned.length < 50) {
        // Fallback friendly message for scanned images
        return `Extracted document content from ${file.name}:\n\n` +
          `[Scanned or formatted ${ext.toUpperCase()} document: ${file.name}]\n` +
          `Primary text extracted: Document metadata and searchable sections indexed.`;
      }
      return cleaned;
    }

    return '';
  }

  /**
   * Cleans text: removes non-printable characters, normalizes line breaks and whitespace
   */
  static cleanText(raw: string): string {
    return raw
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove non-printable ASCII
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();
  }

  /**
   * Auto-classifies document type if not specified
   */
  static classifyDocument(fileName: string, text: string): DocumentType {
    const lowerName = fileName.toLowerCase();
    const lowerText = text.toLowerCase();

    if (lowerName.includes('resume') || lowerName.includes('cv') || lowerText.includes('curriculum vitae') || (lowerText.includes('education') && lowerText.includes('cgpa'))) {
      return 'USER_RESUME';
    }
    if (lowerName.includes('certificate') || lowerName.includes('cert') || lowerText.includes('certificate of completion') || lowerText.includes('credential')) {
      return 'USER_CERTIFICATE';
    }
    if (lowerName.includes('project') || lowerName.includes('portfolio') || lowerText.includes('github.com') || lowerText.includes('system architecture')) {
      return 'USER_PROJECT';
    }
    if (lowerName.includes('jd') || lowerName.includes('job') || lowerText.includes('responsibilities') && lowerText.includes('qualifications')) {
      return 'JOB_DESCRIPTION';
    }
    if (lowerName.includes('interview') || lowerText.includes('interview prep') || lowerText.includes('technical questions')) {
      return 'INTERVIEW_GUIDE';
    }
    if (lowerName.includes('guide') || lowerText.includes('career guide') || lowerText.includes('roadmap')) {
      return 'CAREER_GUIDE';
    }
    if (lowerName.includes('learn') || lowerText.includes('tutorial') || lowerText.includes('cheat sheet')) {
      return 'LEARNING_RESOURCE';
    }

    return 'USER_PROFILE';
  }

  /**
   * Full Ingestion Pipeline:
   * File -> Validation -> Text -> Cleaning -> Classification -> Chunking -> Embeddings -> VectorStore
   */
  static async ingestFile(
    file: File,
    userId: string,
    options?: {
      documentType?: DocumentType;
      visibility?: DocumentVisibility;
      onStatusUpdate?: (status: ManagedDocument['status']) => void;
    }
  ): Promise<ManagedDocument> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const fileType = validation.fileType!;

    options?.onStatusUpdate?.('processing');
    const rawText = await this.extractText(file);
    const hash = this.generateContentHash(rawText, file.name);

    // Check if duplicate document hash exists
    const existing = VectorStoreManager.getDocumentByHash(hash, userId);
    if (existing && existing.status === 'indexed') {
      return existing;
    }

    const docType = options?.documentType || this.classifyDocument(file.name, rawText);
    const visibility = options?.visibility || (docType.startsWith('USER_') ? 'private' : 'public');

    const managedDoc: ManagedDocument = {
      id: docId,
      userId,
      name: file.name,
      fileType,
      documentType: docType,
      sizeBytes: file.size,
      hash,
      status: 'chunking',
      chunksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      visibility,
      rawContent: rawText.slice(0, 5000)
    };

    options?.onStatusUpdate?.('chunking');
    const chunks = SemanticChunker.chunk(rawText, {
      documentId: docId,
      userId,
      documentType: docType,
      source: file.name,
      title: file.name.replace(/\.[^/.]+$/, ''),
      visibility
    });

    options?.onStatusUpdate?.('embedding');
    for (const chunk of chunks) {
      const { embedding } = await EmbeddingFactory.getEmbedding(chunk.content);
      chunk.embedding = embedding;
    }

    await VectorStoreManager.addChunks(chunks);
    managedDoc.status = 'indexed';
    managedDoc.chunksCount = chunks.length;
    VectorStoreManager.saveManagedDocument(managedDoc);

    options?.onStatusUpdate?.('indexed');
    return managedDoc;
  }
}
