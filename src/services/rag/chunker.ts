import { DocumentChunk, DocumentType, DocumentVisibility, TrustTier } from '../../types/rag';

export interface ChunkingOptions {
  documentId: string;
  userId: string;
  documentType: DocumentType;
  source: string;
  title: string;
  visibility?: DocumentVisibility;
  maxChunkSize?: number;
  overlap?: number;
  extraMetadata?: Record<string, any>;
}

export class SemanticChunker {
  private static determineTrustTier(documentType: DocumentType): TrustTier {
    switch (documentType) {
      case 'USER_RESUME':
      case 'USER_PROJECT':
      case 'USER_CERTIFICATE':
      case 'USER_PROFILE':
      case 'JOB_DESCRIPTION':
      case 'COMPANY_INFORMATION':
      case 'APPLICATION_DOCUMENT':
        return 'Highest';
      case 'INTERVIEW_GUIDE':
      case 'CAREER_GUIDE':
      case 'LEARNING_RESOURCE':
        return 'Medium';
      default:
        return 'Lower';
    }
  }

  /**
   * Chunks resume text into semantic sections:
   * Summary, Education, Skills, Projects, Experience, Certifications, Achievements
   */
  static chunkResume(text: string, options: ChunkingOptions): DocumentChunk[] {
    const sections: { name: string; content: string[] }[] = [];
    const lines = text.split('\n');

    const sectionRegexes: { name: string; pattern: RegExp }[] = [
      { name: 'Summary & Objective', pattern: /^(summary|professional summary|career objective|about me|profile)/i },
      { name: 'Education', pattern: /^(education|academic background|academics|qualifications)/i },
      { name: 'Technical Skills', pattern: /^(skills|technical skills|core competencies|technologies|proficiencies)/i },
      { name: 'Projects', pattern: /^(projects|academic projects|personal projects|key projects)/i },
      { name: 'Experience', pattern: /^(experience|work experience|employment history|internships)/i },
      { name: 'Certifications', pattern: /^(certifications|licenses & certifications|credentials|courses)/i },
      { name: 'Achievements & Awards', pattern: /^(achievements|awards|honors|extracurricular)/i }
    ];

    let currentSection = 'General Profile';
    let currentLines: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Check if this line looks like a header (short and matches header keywords or is in caps/markdown header)
      const isHeaderLine = line.length < 50 && (
        line.startsWith('#') ||
        line.endsWith(':') ||
        sectionRegexes.some(r => r.pattern.test(line.replace(/^[#*\-:\s]+|[#*\-:\s]+$/g, '')))
      );

      let matchedHeader = '';
      if (isHeaderLine) {
        const cleanHeader = line.replace(/^[#*\-:\s]+|[#*\-:\s]+$/g, '').trim();
        const found = sectionRegexes.find(r => r.pattern.test(cleanHeader));
        if (found) {
          matchedHeader = found.name;
        }
      }

      if (matchedHeader && matchedHeader !== currentSection) {
        if (currentLines.length > 0) {
          sections.push({ name: currentSection, content: [...currentLines] });
          currentLines = [];
        }
        currentSection = matchedHeader;
      } else {
        currentLines.push(rawLine);
      }
    }

    if (currentLines.length > 0) {
      sections.push({ name: currentSection, content: currentLines });
    }

    // Build chunks
    const trustTier = this.determineTrustTier(options.documentType);
    const chunks: DocumentChunk[] = [];
    let pageEstimate = 1;

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const sectionText = sec.content.join('\n').trim();
      if (!sectionText) continue;

      // Estimate page: ~1500 chars per page
      pageEstimate = Math.max(1, Math.ceil((i + 1) * 0.7));

      const chunkId = `${options.documentId}_chunk_${i + 1}`;
      chunks.push({
        id: chunkId,
        documentId: options.documentId,
        userId: options.userId,
        documentType: options.documentType,
        source: options.source,
        title: `${options.title} - ${sec.name}`,
        section: sec.name,
        page: pageEstimate,
        content: `Document: ${options.title}\nSection: ${sec.name}\n\n${sectionText}`,
        tokenCount: Math.round(sectionText.length / 4),
        createdAt: new Date().toISOString(),
        visibility: options.visibility || 'private',
        metadata: {
          documentId: options.documentId,
          userId: options.userId,
          documentType: options.documentType,
          source: options.source,
          page: pageEstimate,
          section: sec.name,
          createdAt: new Date().toISOString(),
          visibility: options.visibility || 'private',
          trustTier,
          ...options.extraMetadata
        }
      });
    }

    return chunks.length > 0 ? chunks : this.chunkGeneralText(text, options);
  }

  /**
   * Chunks Job Descriptions into semantic sections:
   * Job Title, About Company, Responsibilities, Required Qualifications,
   * Preferred Qualifications, Skills, Benefits, Eligibility
   */
  static chunkJobDescription(text: string, options: ChunkingOptions): DocumentChunk[] {
    const jdSections: { name: string; pattern: RegExp }[] = [
      { name: 'Job Overview & Role Summary', pattern: /^(about the role|role overview|job summary|position overview|about abc|about the company)/i },
      { name: 'Responsibilities', pattern: /^(responsibilities|key responsibilities|what you will do|your role|duties)/i },
      { name: 'Required Qualifications', pattern: /^(required qualifications|requirements|basic qualifications|must have|mandatory skills|eligibility criteria)/i },
      { name: 'Preferred Qualifications', pattern: /^(preferred qualifications|nice to have|good to have|desired skills|bonus points)/i },
      { name: 'Skills & Tech Stack', pattern: /^(skills required|tech stack|technologies|technical requirements)/i },
      { name: 'Benefits & Compensation', pattern: /^(benefits|perks|compensation|stipend|salary|what we offer)/i }
    ];

    const sections: { name: string; content: string[] }[] = [];
    const lines = text.split('\n');
    let currentSection = 'Job Overview';
    let currentLines: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const isHeader = line.length < 60 && (
        line.startsWith('#') ||
        line.endsWith(':') ||
        jdSections.some(s => s.pattern.test(line.replace(/^[#*\-:\s]+|[#*\-:\s]+$/g, '')))
      );

      let matched = '';
      if (isHeader) {
        const clean = line.replace(/^[#*\-:\s]+|[#*\-:\s]+$/g, '').trim();
        const found = jdSections.find(s => s.pattern.test(clean));
        if (found) matched = found.name;
      }

      if (matched && matched !== currentSection) {
        if (currentLines.length > 0) {
          sections.push({ name: currentSection, content: [...currentLines] });
          currentLines = [];
        }
        currentSection = matched;
      } else {
        currentLines.push(rawLine);
      }
    }

    if (currentLines.length > 0) {
      sections.push({ name: currentSection, content: currentLines });
    }

    const trustTier = this.determineTrustTier(options.documentType);
    const chunks: DocumentChunk[] = [];

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const sectionText = sec.content.join('\n').trim();
      if (!sectionText) continue;

      const chunkId = `${options.documentId}_jd_chunk_${i + 1}`;
      chunks.push({
        id: chunkId,
        documentId: options.documentId,
        userId: options.userId,
        documentType: options.documentType,
        source: options.source,
        title: `${options.title} - ${sec.name}`,
        section: sec.name,
        page: 1,
        content: `Document: ${options.title}\nSection: ${sec.name}\n\n${sectionText}`,
        tokenCount: Math.round(sectionText.length / 4),
        createdAt: new Date().toISOString(),
        visibility: options.visibility || 'public',
        metadata: {
          documentId: options.documentId,
          userId: options.userId,
          documentType: options.documentType,
          source: options.source,
          page: 1,
          section: sec.name,
          createdAt: new Date().toISOString(),
          visibility: options.visibility || 'public',
          trustTier,
          ...options.extraMetadata
        }
      });
    }

    return chunks.length > 0 ? chunks : this.chunkGeneralText(text, options);
  }

  /**
   * General Markdown / HTML / TXT chunker based on headers and paragraphs
   */
  static chunkGeneralText(text: string, options: ChunkingOptions): DocumentChunk[] {
    const rawParagraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const trustTier = this.determineTrustTier(options.documentType);
    const chunks: DocumentChunk[] = [];
    const maxChunkSize = options.maxChunkSize || 600; // characters

    let currentChunkText = '';
    let currentSection = 'Overview';
    let chunkIndex = 1;

    for (const para of rawParagraphs) {
      // Check for markdown headers
      if (para.startsWith('#')) {
        const headerMatch = para.match(/^#+\s*(.+)/);
        if (headerMatch) {
          currentSection = headerMatch[1].trim();
        }
      }

      if ((currentChunkText + '\n\n' + para).length > maxChunkSize && currentChunkText.length > 100) {
        chunks.push({
          id: `${options.documentId}_gen_${chunkIndex++}`,
          documentId: options.documentId,
          userId: options.userId,
          documentType: options.documentType,
          source: options.source,
          title: `${options.title} - ${currentSection}`,
          section: currentSection,
          page: Math.ceil(chunkIndex / 3),
          content: `Document: ${options.title}\nSection: ${currentSection}\n\n${currentChunkText.trim()}`,
          tokenCount: Math.round(currentChunkText.length / 4),
          createdAt: new Date().toISOString(),
          visibility: options.visibility || 'private',
          metadata: {
            documentId: options.documentId,
            userId: options.userId,
            documentType: options.documentType,
            source: options.source,
            page: Math.ceil(chunkIndex / 3),
            section: currentSection,
            createdAt: new Date().toISOString(),
            visibility: options.visibility || 'private',
            trustTier,
            ...options.extraMetadata
          }
        });
        currentChunkText = para;
      } else {
        currentChunkText = currentChunkText ? `${currentChunkText}\n\n${para}` : para;
      }
    }

    if (currentChunkText.trim()) {
      chunks.push({
        id: `${options.documentId}_gen_${chunkIndex}`,
        documentId: options.documentId,
        userId: options.userId,
        documentType: options.documentType,
        source: options.source,
        title: `${options.title} - ${currentSection}`,
        section: currentSection,
        page: Math.ceil(chunkIndex / 3),
        content: `Document: ${options.title}\nSection: ${currentSection}\n\n${currentChunkText.trim()}`,
        tokenCount: Math.round(currentChunkText.length / 4),
        createdAt: new Date().toISOString(),
        visibility: options.visibility || 'private',
        metadata: {
          documentId: options.documentId,
          userId: options.userId,
          documentType: options.documentType,
          source: options.source,
          page: Math.ceil(chunkIndex / 3),
          section: currentSection,
          createdAt: new Date().toISOString(),
          visibility: options.visibility || 'private',
          trustTier,
          ...options.extraMetadata
        }
      });
    }

    return chunks;
  }

  /**
   * Main dispatch method
   */
  static chunk(text: string, options: ChunkingOptions): DocumentChunk[] {
    if (options.documentType === 'USER_RESUME') {
      return this.chunkResume(text, options);
    }
    if (options.documentType === 'JOB_DESCRIPTION') {
      return this.chunkJobDescription(text, options);
    }
    return this.chunkGeneralText(text, options);
  }
}
