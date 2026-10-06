import { JobListing, EmploymentType, WorkMode } from '../types/job';
import { CURATED_JOBS } from '../data/curatedJobs';

export interface SearchQueryFilters {
  role?: string;
  location?: string;
  skills?: string[];
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  maxExperience?: number;
  minMatchScore?: number;
  includeDemoData?: boolean;
}

export interface SearchExecutionResult {
  jobs: JobListing[];
  totalDiscovered: number;
  duplicatesRemoved: number;
  appliedFilters: SearchQueryFilters;
  parsedSearchCriteria: {
    targetRole?: string;
    detectedLocations?: string[];
    detectedSkills?: string[];
    detectedEmployment?: string;
    experienceFilter?: string;
  };
}

/**
 * Natural Language Query Parser.
 * Converts conversational search prompts into structured query filters.
 */
export function parseNaturalLanguageQuery(query: string): SearchQueryFilters & { parsedMeta: any } {
  const q = query.toLowerCase();
  const filters: SearchQueryFilters = {
    includeDemoData: true
  };
  const parsedMeta: any = {};

  // Detect Employment Type
  if (q.includes('intern') || q.includes('internship') || q.includes('summer')) {
    filters.employmentType = 'Internship';
    parsedMeta.detectedEmployment = 'Internship';
  } else if (q.includes('full-time') || q.includes('fulltime') || q.includes('fresher') || q.includes('graduate trainee')) {
    filters.employmentType = 'Full-time';
    parsedMeta.detectedEmployment = 'Full-time';
  }

  // Detect Location
  const knownLocations = ['bangalore', 'bengaluru', 'hyderabad', 'pune', 'delhi', 'mumbai', 'remote', 'india'];
  for (const loc of knownLocations) {
    if (q.includes(loc)) {
      filters.location = loc === 'bengaluru' ? 'Bangalore' : loc.charAt(0).toUpperCase() + loc.slice(1);
      parsedMeta.detectedLocations = [filters.location];
      break;
    }
  }

  // Detect Work Mode
  if (q.includes('remote')) {
    filters.workMode = 'Remote';
  } else if (q.includes('hybrid')) {
    filters.workMode = 'Hybrid';
  } else if (q.includes('on-site') || q.includes('onsite') || q.includes('in-office')) {
    filters.workMode = 'On-site';
  }

  // Detect Skills
  const knownSkills = ['java', 'python', 'c++', 'c', 'javascript', 'typescript', 'react', 'node', 'sql', 'dsa', 'git', 'spring boot', 'go', 'web development'];
  const detectedSkills: string[] = [];
  knownSkills.forEach(skill => {
    // Check word boundaries
    const regex = new RegExp(`\\b${skill.replace('+', '\\+')}\\b`, 'i');
    if (regex.test(q)) {
      detectedSkills.push(skill.toUpperCase());
    }
  });
  if (detectedSkills.length > 0) {
    filters.skills = detectedSkills;
    parsedMeta.detectedSkills = detectedSkills;
  }

  // Detect Role
  if (q.includes('software engineer') || q.includes('swe') || q.includes('sde')) {
    filters.role = 'Software Engineer';
  } else if (q.includes('java developer') || q.includes('backend')) {
    filters.role = 'Backend / Java';
  } else if (q.includes('frontend') || q.includes('web developer')) {
    filters.role = 'Frontend / Web';
  }

  return { ...filters, parsedMeta };
}

/**
 * Deduplicate listings into Canonical Jobs.
 * Deduplication rules:
 * - Same canonicalId
 * - Or same company + normalized title + primary city
 */
export function deduplicateJobs(rawJobs: JobListing[]): { canonicalJobs: JobListing[]; duplicatesCount: number } {
  const map = new Map<string, JobListing>();
  let duplicatesCount = 0;

  for (const job of rawJobs) {
    const key = job.canonicalId || `${job.company.toLowerCase().trim()}::${job.title.toLowerCase().trim()}::${job.location.split(',')[0].toLowerCase().trim()}`;
    
    if (map.has(key)) {
      duplicatesCount++;
      const existing = map.get(key)!;
      // Merge source info if not present
      const combinedSources = new Set(existing.duplicateSources || []);
      combinedSources.add(existing.source);
      combinedSources.add(job.source);
      existing.duplicateSources = Array.from(combinedSources).filter(s => s !== existing.source);
    } else {
      map.set(key, { ...job });
    }
  }

  return {
    canonicalJobs: Array.from(map.values()),
    duplicatesCount
  };
}

/**
 * Query aggregator combining available connectors.
 */
export function searchJobs(allJobs: JobListing[], queryText?: string, filters?: SearchQueryFilters): SearchExecutionResult {
  let workingList = [...allJobs];
  let naturalFilters: SearchQueryFilters = {};
  let parsedCriteria: any = {};

  if (queryText && queryText.trim()) {
    const parsed = parseNaturalLanguageQuery(queryText);
    naturalFilters = parsed;
    parsedCriteria = parsed.parsedMeta;
  }

  const mergedFilters: SearchQueryFilters = {
    ...naturalFilters,
    ...(filters || {})
  };

  const totalDiscovered = workingList.length;

  // Deduplicate first
  const { canonicalJobs, duplicatesCount } = deduplicateJobs(workingList);
  workingList = canonicalJobs;

  // Apply filters
  if (mergedFilters.role) {
    const roleLow = mergedFilters.role.toLowerCase();
    workingList = workingList.filter(j => 
      j.title.toLowerCase().includes(roleLow) ||
      (j.department && j.department.toLowerCase().includes(roleLow))
    );
  }

  if (mergedFilters.location && mergedFilters.location !== 'All') {
    const locLow = mergedFilters.location.toLowerCase();
    workingList = workingList.filter(j => 
      j.location.toLowerCase().includes(locLow) ||
      (locLow.includes('remote') && j.workMode === 'Remote')
    );
  }

  if (mergedFilters.employmentType && mergedFilters.employmentType !== ('All' as any)) {
    workingList = workingList.filter(j => j.employmentType === mergedFilters.employmentType);
  }

  if (mergedFilters.workMode && mergedFilters.workMode !== ('All' as any)) {
    workingList = workingList.filter(j => j.workMode === mergedFilters.workMode);
  }

  if (mergedFilters.maxExperience !== undefined && mergedFilters.maxExperience >= 0) {
    workingList = workingList.filter(j => j.minExperienceYears <= (mergedFilters.maxExperience || 0));
  }

  if (mergedFilters.skills && mergedFilters.skills.length > 0) {
    const filterSkillsNorm = mergedFilters.skills.map(s => s.toLowerCase());
    workingList = workingList.filter(j => {
      const jobSkills = [...j.requiredSkills, ...j.preferredSkills].map(s => s.toLowerCase());
      return filterSkillsNorm.some(fs => jobSkills.some(js => js.includes(fs) || fs.includes(js)));
    });
  }

  return {
    jobs: workingList,
    totalDiscovered,
    duplicatesRemoved: duplicatesCount,
    appliedFilters: mergedFilters,
    parsedSearchCriteria: parsedCriteria
  };
}
