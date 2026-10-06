import { UserProfile } from '../types/profile';
import { JobListing, JobMatchBreakdown, JobPriority } from '../types/job';

/**
 * Transparent Multi-Factor Job Matching Engine.
 * Produces deterministic, explainable match breakdown:
 * - Skill Match (35%)
 * - Education Match (20%)
 * - Experience Match (20%)
 * - Location Match (15%)
 * - Role Match (10%)
 */
export function calculateJobMatch(profile: UserProfile, job: JobListing): JobMatchBreakdown {
  // 1. Collect all user skills in normalized lower-case
  const userSkillSet = new Set<string>();
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9+#]/g, '');

  const allSkills = [
    ...profile.skills.languages,
    ...profile.skills.frameworks,
    ...profile.skills.databases,
    ...profile.skills.toolsAndPlatforms,
    ...profile.skills.coreConcepts
  ];

  allSkills.forEach(skill => {
    userSkillSet.add(normalize(skill));
    // Also add aliases
    if (skill.toLowerCase().includes('dsa') || skill.toLowerCase().includes('data structures')) {
      userSkillSet.add('dsa');
      userSkillSet.add('datastructures');
      userSkillSet.add('algorithms');
    }
    if (skill.toLowerCase().includes('oop') || skill.toLowerCase().includes('object-oriented')) {
      userSkillSet.add('oop');
      userSkillSet.add('objectorientedprogramming');
    }
    if (skill.toLowerCase().includes('git')) {
      userSkillSet.add('git');
      userSkillSet.add('github');
    }
  });

  // Also extract skills mentioned in projects
  profile.projects.forEach(p => {
    p.technologies.forEach(t => userSkillSet.add(normalize(t)));
  });

  const matchedSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];
  const whyYouMatch: string[] = [];
  const weaknessesOrGaps: string[] = [];
  const potentialConcerns: string[] = [];

  // Match required skills
  let reqMatchedCount = 0;
  job.requiredSkills.forEach(reqSkill => {
    const norm = normalize(reqSkill);
    const hasSkill = Array.from(userSkillSet).some(us => us.includes(norm) || norm.includes(us));
    if (hasSkill) {
      reqMatchedCount++;
      matchedSkills.push(reqSkill);
      whyYouMatch.push(`✓ ${reqSkill} required — your profile matches`);
    } else {
      missingRequiredSkills.push(reqSkill);
      weaknessesOrGaps.push(`⚠ Missing required skill: ${reqSkill}`);
    }
  });

  // Match preferred skills
  let prefMatchedCount = 0;
  job.preferredSkills.forEach(prefSkill => {
    const norm = normalize(prefSkill);
    const hasSkill = Array.from(userSkillSet).some(us => us.includes(norm) || norm.includes(us));
    if (hasSkill) {
      prefMatchedCount++;
      matchedSkills.push(`${prefSkill} (preferred)`);
      whyYouMatch.push(`✓ Preferred asset: ${prefSkill} — you have this background`);
    } else {
      missingPreferredSkills.push(prefSkill);
      weaknessesOrGaps.push(`⚠ Missing preferred skill: ${prefSkill}`);
    }
  });

  // Calculate skill score
  const totalReq = job.requiredSkills.length || 1;
  const totalPref = job.preferredSkills.length || 1;
  const reqRatio = reqMatchedCount / totalReq;
  const prefRatio = job.preferredSkills.length > 0 ? prefMatchedCount / totalPref : 1;
  const skillMatch = Math.round(reqRatio * 80 + prefRatio * 20);

  // 2. Education Match
  let educationMatch = 80;
  const userHasDegree = profile.education.some(e => {
    const deg = e.degree.toLowerCase();
    const field = e.fieldOfStudy.toLowerCase();
    return (deg.includes('b.tech') || deg.includes('b.e.') || deg.includes('bachelor')) &&
           (field.includes('computer') || field.includes('cse') || field.includes('it'));
  });

  if (userHasDegree) {
    educationMatch = 100;
    whyYouMatch.push('✓ B.E. / B.Tech Computer Science qualification aligns directly with degree requirement');
  } else if (profile.education.length > 0) {
    educationMatch = 85;
    whyYouMatch.push(`✓ Holds ${profile.education[0].degree} — engineering/technical background`);
  } else {
    educationMatch = 50;
    weaknessesOrGaps.push('⚠ No verified engineering degree on file');
  }

  // 3. Experience Match
  let experienceMatch = 100;
  const userYearsExp = profile.experience.length > 0 ? profile.experience.length * 0.5 : 0; // Fresher / 0 years

  if (job.minExperienceYears === 0) {
    experienceMatch = 100;
    whyYouMatch.push('✓ Fresher / Student friendly — 0 years experience required matches your current status');
  } else if (job.minExperienceYears <= 1) {
    experienceMatch = 85;
    whyYouMatch.push('✓ Entry-level role (0-1 years) — academic projects can compensate for formal experience');
  } else {
    const gap = job.minExperienceYears - userYearsExp;
    experienceMatch = Math.max(15, Math.round(100 - gap * 25));
    potentialConcerns.push(
      `Major experience gap: Posting strictly seeks ${job.experienceRequired}, while you currently have entry/fresher status.`
    );
  }

  // 4. Location Match
  let locationMatch = 70;
  const userLoc = profile.location.toLowerCase();
  const jobLoc = job.location.toLowerCase();
  const preferredLocs = profile.preferences.preferredLocations.map(l => l.toLowerCase());

  const matchesPreferred = preferredLocs.some(pl => jobLoc.includes(pl) || pl.includes('remote') && job.workMode === 'Remote');
  const matchesCurrent = userLoc.split(',').some(part => jobLoc.includes(part.trim()));

  if (job.workMode === 'Remote' || matchesCurrent || matchesPreferred) {
    locationMatch = 100;
    whyYouMatch.push(`✓ Location match: ${job.location} (${job.workMode}) fits your preferred locations`);
  } else {
    locationMatch = 50;
    weaknessesOrGaps.push(`⚠ Relocation may be required to ${job.location}`);
  }

  // 5. Role Match
  let roleMatch = 75;
  const targetRoles = profile.preferences.targetRoles.map(r => r.toLowerCase());
  const jobTitleNorm = job.title.toLowerCase();
  const isDirectRoleMatch = targetRoles.some(tr => jobTitleNorm.includes(tr) || tr.includes(jobTitleNorm));

  if (isDirectRoleMatch) {
    roleMatch = 100;
    whyYouMatch.push(`✓ Direct target role match for "${job.title}"`);
  } else if (jobTitleNorm.includes('software') || jobTitleNorm.includes('developer') || jobTitleNorm.includes('intern')) {
    roleMatch = 85;
    whyYouMatch.push(`✓ Related engineering title: ${job.title}`);
  }

  // 6. Eligibility Check
  let eligibility = 100;
  if (job.minExperienceYears >= 3) {
    eligibility = 40;
  }
  if (job.employmentType === 'Internship' && profile.preferences.employmentType.includes('Internship')) {
    whyYouMatch.push('✓ Internship status fits your student graduation timeline');
  }

  // Calculate Weighted Overall Score
  // Weights: Skill (35%), Education (20%), Experience (20%), Location (15%), Role (10%)
  const rawScore = (
    skillMatch * 0.35 +
    educationMatch * 0.20 +
    experienceMatch * 0.20 +
    locationMatch * 0.15 +
    roleMatch * 0.10
  );

  const overallScore = Math.min(99, Math.max(10, Math.round(rawScore)));

  // Determine Priority and Recommendation
  let priority: JobPriority = 'GOOD MATCH';
  let recommendation: 'APPLY' | 'CONSIDER WITH CAUTION' | 'STRETCH OPPORTUNITY' | 'DO NOT APPLY' = 'APPLY';
  let recommendationReason = '';

  if (job.minExperienceYears >= 3) {
    priority = 'STRETCH';
    recommendation = 'STRETCH OPPORTUNITY';
    recommendationReason = `Senior-level experience requirement (${job.experienceRequired}) is a significant barrier. Only apply if you have specialized open-source work or referral.`;
  } else if (overallScore >= 85) {
    priority = 'HIGH PRIORITY';
    recommendation = 'APPLY';
    recommendationReason = `Strong technical and education match (${overallScore}%). Your core competencies align with what this role seeks. Recommended to tailor resume and apply promptly.`;
  } else if (overallScore >= 70) {
    priority = 'GOOD MATCH';
    recommendation = 'APPLY';
    recommendationReason = `Good match (${overallScore}%). You have core foundations (${job.requiredSkills.slice(0, 2).join(', ')}). A few gaps exist (${missingRequiredSkills.join(', ') || missingPreferredSkills.join(', ')}), but highly realistic.`;
  } else if (overallScore >= 50) {
    priority = 'STRETCH';
    recommendation = 'CONSIDER WITH CAUTION';
    recommendationReason = `Moderate match (${overallScore}%). Notable gaps in required stack. Recommended to strengthen missing areas or highlight relevant academic projects.`;
  } else {
    priority = 'LOW MATCH';
    recommendation = 'DO NOT APPLY';
    recommendationReason = `Significant mismatch in experience or foundational requirements. Prioritize roles with higher alignment.`;
  }

  return {
    overallScore,
    skillMatch,
    educationMatch,
    experienceMatch,
    locationMatch,
    roleMatch,
    eligibility,
    matchedSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    whyYouMatch,
    weaknessesOrGaps,
    potentialConcerns,
    priority,
    recommendation,
    recommendationReason
  };
}
