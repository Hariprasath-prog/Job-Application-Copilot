import { ScoredChunk, Citation, ConflictNotice, GroundedContext } from '../../types/rag';
import { UserProfile } from '../../types/profile';
import { JobListing } from '../../types/job';

export class ContextBuilder {
  /**
   * Builds clean, structured grounding context with provenance tags and evidence sections
   */
  static buildContext(
    query: string,
    chunks: ScoredChunk[],
    profile?: UserProfile,
    job?: JobListing
  ): GroundedContext {
    const citations: Citation[] = [];
    const conflicts: ConflictNotice[] = [];

    const userEvidence: string[] = [];
    const jobEvidence: string[] = [];
    const companyEvidence: string[] = [];
    const careerGuides: string[] = [];

    let formattedContext = `=== RETRIEVED GROUND TRUTH EVIDENCE (VERIFIED SOURCES) ===\n\n`;

    // Deduplicate citations by source and section
    const citationMap = new Map<string, Citation>();

    for (let i = 0; i < chunks.length; i++) {
      const item = chunks[i];
      const chunk = item.chunk;
      const citationKey = `${chunk.source}_${chunk.section}`;

      if (!citationMap.has(citationKey)) {
        const citation: Citation = {
          id: `cit_${i + 1}_${Math.random().toString(36).slice(2, 6)}`,
          chunkId: chunk.id,
          documentId: chunk.documentId,
          documentTitle: chunk.title,
          section: chunk.section,
          page: chunk.page,
          source: chunk.source,
          quoteSnippet: chunk.content.slice(0, 160).replace(/\n/g, ' ') + '...',
          trustTier: item.provenance.trustTier
        };
        citationMap.set(citationKey, citation);
        citations.push(citation);
      }

      // Add to structured context
      formattedContext += `[SOURCE #${i + 1}: ${chunk.source} | Section: ${chunk.section} | Authority: ${item.provenance.trustTier} | Score: ${(item.rerankScore * 100).toFixed(0)}%]\n`;
      formattedContext += `${chunk.content.trim()}\n\n`;

      // Categorize evidence
      if (chunk.documentType.startsWith('USER_')) {
        userEvidence.push(`${chunk.section} (${chunk.source}): ${chunk.content.slice(0, 120)}...`);
      } else if (chunk.documentType === 'JOB_DESCRIPTION') {
        jobEvidence.push(`${chunk.section}: ${chunk.content.slice(0, 120)}...`);
      } else if (chunk.documentType === 'COMPANY_INFORMATION') {
        companyEvidence.push(`${chunk.section}: ${chunk.content.slice(0, 120)}...`);
      } else {
        careerGuides.push(`${chunk.section}: ${chunk.content.slice(0, 120)}...`);
      }
    }

    formattedContext += `=== END OF RETRIEVED EVIDENCE ===\n\n`;

    // Add candidate profile summary if provided
    if (profile) {
      formattedContext += `[ACTIVE USER VERIFIED PROFILE: ${profile.fullName}]\n`;
      formattedContext += `Education: ${profile.education[0]?.degree} at ${profile.education[0]?.institution} (Graduation: ${profile.education[0]?.graduationYear}, CGPA: ${profile.education[0]?.cgpaOrPercentage})\n`;
      formattedContext += `Verified Languages: ${profile.skills.languages.join(', ')}\n`;
      formattedContext += `Verified Frameworks: ${profile.skills.frameworks.join(', ')}\n`;
      formattedContext += `Verified Databases: ${profile.skills.databases.join(', ')}\n`;
      formattedContext += `Verified Tools: ${profile.skills.toolsAndPlatforms.join(', ')}\n`;
      formattedContext += `Projects: ${profile.projects.map(p => `"${p.title}" (${p.technologies.join(', ')})`).join('; ')}\n\n`;
    }

    // Add target job summary if provided
    if (job) {
      formattedContext += `[TARGET JOB OPPORTUNITY: ${job.company} - ${job.title}]\n`;
      formattedContext += `Location: ${job.location} (${job.workMode})\n`;
      formattedContext += `Required Skills: ${job.requiredSkills.join(', ')}\n`;
      formattedContext += `Preferred Skills: ${job.preferredSkills.join(', ')}\n`;
      formattedContext += `Compensation: ${job.stipendOrSalary}\n`;
      formattedContext += `Education Requirement: ${job.educationRequirement}\n\n`;
    }

    // Conflict detection pass
    const queryLower = query.toLowerCase();
    if (queryLower.includes('status') || queryLower.includes('closed') || queryLower.includes('available')) {
      const officialChunk = chunks.find(c => c.provenance.trustTier === 'Highest');
      const lowerChunk = chunks.find(c => c.provenance.trustTier !== 'Highest');
      if (officialChunk && lowerChunk && officialChunk.chunk.content.includes('Active') && lowerChunk.chunk.content.includes('Closed')) {
        conflicts.push({
          detected: true,
          topic: 'Job Availability Status',
          higherAuthoritySource: officialChunk.chunk.source,
          lowerAuthoritySource: lowerChunk.chunk.source,
          higherClaim: 'Position is currently accepting applications on official career portal',
          lowerClaim: 'Third-party listing indicates position may be expired',
          resolutionNote: 'The official company career portal is given precedence.'
        });
      }
    }

    return {
      structuredContext: formattedContext,
      chunksUsed: chunks,
      citations,
      conflicts,
      evidenceSummary: {
        userEvidence,
        jobEvidence,
        companyEvidence,
        careerGuides
      }
    };
  }
}
