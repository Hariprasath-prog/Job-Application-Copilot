import { UserProfile } from '../types/profile';
import { JobListing } from '../types/job';

export interface SkillGapAnalysis {
  strongSkills: string[];
  developSkills: string[];
  prioritySkills: string[];
  topMarketDemands: { skill: string; frequency: number }[];
  learningRoadmap: {
    week: number;
    title: string;
    focusSkill: string;
    objectives: string[];
    recommendedPractice: string;
  }[];
}

export function analyzeSkillGaps(profile: UserProfile, jobs: JobListing[]): SkillGapAnalysis {
  // Aggregate all skills demanded across available jobs
  const skillFrequencyMap = new Map<string, number>();

  jobs.forEach(job => {
    [...job.requiredSkills, ...job.preferredSkills].forEach(skill => {
      const canonical = skill.trim();
      skillFrequencyMap.set(canonical, (skillFrequencyMap.get(canonical) || 0) + 1);
    });
  });

  const sortedDemands = Array.from(skillFrequencyMap.entries())
    .map(([skill, frequency]) => ({ skill, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  // User's verified skills
  const userSkillList = [
    ...profile.skills.languages,
    ...profile.skills.frameworks,
    ...profile.skills.databases,
    ...profile.skills.toolsAndPlatforms,
    ...profile.skills.coreConcepts
  ];

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const userSkillSet = new Set(userSkillList.map(normalize));

  const strongSkills: string[] = [];
  const developSkills: string[] = [];
  const prioritySkills: string[] = [];

  // Categorize
  userSkillList.forEach(us => {
    strongSkills.push(us);
  });

  sortedDemands.forEach(({ skill, frequency }) => {
    const norm = normalize(skill);
    const hasSkill = Array.from(userSkillSet).some(s => s.includes(norm) || norm.includes(s));

    if (!hasSkill) {
      if (frequency >= 3) {
        if (!prioritySkills.includes(skill)) prioritySkills.push(skill);
      } else {
        if (!developSkills.includes(skill)) developSkills.push(skill);
      }
    }
  });

  // Build 4-week roadmap
  const top4Priority = prioritySkills.length >= 4
    ? prioritySkills.slice(0, 4)
    : [...prioritySkills, 'REST APIs', 'Spring Boot', 'System Design Basics'].slice(0, 4);

  const learningRoadmap = [
    {
      week: 1,
      title: `Week 1: Foundations & ${top4Priority[0] || 'Core Java Collections'}`,
      focusSkill: top4Priority[0] || 'Java Collections & Generics',
      objectives: [
        'Master internal mechanics of HashMap, ArrayList, and ConcurrentHashMap.',
        'Solve 15 targeted LeetCode problems utilizing custom comparators and heap structures.',
        'Write unit tests measuring time complexity guarantees.'
      ],
      recommendedPractice: 'Implement a custom LRU Cache using Doubly Linked List and HashMap.'
    },
    {
      week: 2,
      title: `Week 2: Data Persistence & ${top4Priority[1] || 'Relational SQL Optimization'}`,
      focusSkill: top4Priority[1] || 'SQL & Database Indexing',
      objectives: [
        'Understand B-Tree indexes, composite keys, and EXPLAIN query plan analysis.',
        'Practice writing complex GROUP BY, HAVING, and window function queries.',
        'Connect Java backend with connection pool (HikariCP) and JDBC.'
      ],
      recommendedPractice: 'Design schema for a high-traffic e-commerce order service and benchmark join performance.'
    },
    {
      week: 3,
      title: `Week 3: Backend Services & ${top4Priority[2] || 'RESTful API Engineering'}`,
      focusSkill: top4Priority[2] || 'REST APIs & HTTP Standards',
      objectives: [
        'Learn HTTP semantics (idempotency, status codes, headers, CORS, JWT tokens).',
        'Build structured request validation and global exception handlers.',
        'Document endpoints with OpenAPI / Swagger documentation.'
      ],
      recommendedPractice: 'Create a micro-service with CRUD endpoints, authentication middleware, and Postman tests.'
    },
    {
      week: 4,
      title: `Week 4: Enterprise Frameworks & ${top4Priority[3] || 'Spring Boot Architecture'}`,
      focusSkill: top4Priority[3] || 'Spring Boot & Dependency Injection',
      objectives: [
        'Understand Inversion of Control (IoC), Dependency Injection, and Spring Beans.',
        'Configure Spring Data JPA and automated repository methods.',
        'Deploy sample API containerized with Docker or live cloud instance.'
      ],
      recommendedPractice: 'Deliver a full-stack student portal with Spring Boot backend, MySQL, and Git repository.'
    }
  ];

  return {
    strongSkills: Array.from(new Set(strongSkills)),
    developSkills: Array.from(new Set(developSkills)).slice(0, 6),
    prioritySkills: Array.from(new Set(prioritySkills)).slice(0, 6),
    topMarketDemands: sortedDemands.slice(0, 8),
    learningRoadmap
  };
}
