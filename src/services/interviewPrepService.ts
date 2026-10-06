import { UserProfile } from '../types/profile';
import { JobListing } from '../types/job';

export interface InterviewPrepGuide {
  jobTitle: string;
  company: string;
  technicalTopics: {
    domain: string;
    keyConcepts: string[];
    sampleQuestions: string[];
  }[];
  dsaFocusAreas: {
    topic: string;
    importance: 'High' | 'Critical' | 'Medium';
    patterns: string[];
    sampleProblem: string;
  }[];
  behavioralQuestions: {
    question: string;
    framework: string;
    suggestedTalkingPoint: string;
  }[];
  projectDeepDives: {
    projectTitle: string;
    likelyQuestions: string[];
  }[];
  companyTips: string[];
}

export function generateInterviewPrep(profile: UserProfile, job: JobListing): InterviewPrepGuide {
  const requiresJava = job.requiredSkills.some(s => s.toLowerCase().includes('java')) ||
                       job.description.toLowerCase().includes('java');

  const technicalTopics: InterviewPrepGuide['technicalTopics'] = [];

  if (requiresJava) {
    technicalTopics.push({
      domain: 'Core Java Fundamentals',
      keyConcepts: [
        'OOP 4 Pillars (Polymorphism, Inheritance, Encapsulation, Abstraction)',
        'Java Collections Framework (ArrayList vs LinkedList, HashMap internals, HashSet)',
        'Exception Handling (Checked vs Unchecked, try-with-resources)',
        'Memory Model & JVM (Heap vs Stack, Garbage Collection basics)',
        'Strings (String vs StringBuilder vs StringBuffer, Immutability)'
      ],
      sampleQuestions: [
        'How does HashMap work internally in Java? What happens during a hash collision?',
        'What is the difference between Comparable and Comparator interfaces?',
        'Explain why String is immutable in Java and its security/performance advantages.',
        'What is the difference between "==" and ".equals()" in Java?'
      ]
    });
  }

  technicalTopics.push({
    domain: 'Database & SQL Foundations',
    keyConcepts: [
      'Relational modeling & Normalization (1NF, 2NF, 3NF)',
      'ACID properties & Transaction Isolation levels',
      'Indexing basics (B-Tree indexes, Clustered vs Non-Clustered)',
      'JOIN types (INNER, LEFT, RIGHT, FULL OUTER)'
    ],
    sampleQuestions: [
      'Write a query to find the second highest salary in an Employee table.',
      'Explain when an index can degrade write performance.',
      'What are the differences between DROP, TRUNCATE, and DELETE?'
    ]
  });

  const dsaFocusAreas: InterviewPrepGuide['dsaFocusAreas'] = [
    {
      topic: 'Arrays & Two-Pointers / Sliding Window',
      importance: 'Critical',
      patterns: ['Opposite direction pointers', 'Fixed/Dynamic sliding window', 'Prefix sum'],
      sampleProblem: 'Two Sum, 3Sum, Longest Substring Without Repeating Characters'
    },
    {
      topic: 'HashMaps & HashSets',
      importance: 'Critical',
      patterns: ['Frequency counting', 'Subarray sum equals K', 'Anagram grouping'],
      sampleProblem: 'Group Anagrams, Subarray Sum Divisible by K'
    },
    {
      topic: 'Binary Search & Monotonic Conditions',
      importance: 'High',
      patterns: ['Search in rotated sorted array', 'Binary search on answer domain'],
      sampleProblem: 'Search in Rotated Sorted Array, Find Peak Element'
    },
    {
      topic: 'Binary Trees & Traversals',
      importance: 'High',
      patterns: ['BFS level-order traversal', 'DFS pre/in/post order', 'LCA calculation'],
      sampleProblem: 'Lowest Common Ancestor, Maximum Depth of Binary Tree'
    }
  ];

  const primaryProj = profile.projects[0];
  const projectDeepDives: InterviewPrepGuide['projectDeepDives'] = profile.projects.map(p => ({
    projectTitle: p.title,
    likelyQuestions: [
      `Why did you choose ${p.technologies.slice(0, 3).join(', ')} over other alternatives?`,
      `How did you handle error conditions or invalid inputs in ${p.title}?`,
      `If 10,000 concurrent users accessed this system, what would break first and how would you optimize it?`
    ]
  }));

  const behavioralQuestions: InterviewPrepGuide['behavioralQuestions'] = [
    {
      question: 'Tell me about yourself.',
      framework: 'Present -> Past -> Future',
      suggestedTalkingPoint: `Highlight your B.Tech CSE studies, passion for software craftsmanship, project experience with ${primaryProj ? primaryProj.title : 'web and systems apps'}, and why ${job.company} is the ideal next step.`
    },
    {
      question: 'Describe a difficult bug or technical roadblock you encountered and how you solved it.',
      framework: 'STAR (Situation, Task, Action, Result)',
      suggestedTalkingPoint: `Use your experience building ${primaryProj ? primaryProj.title : 'your academic project'}, explaining how you used debugging logs/tools to diagnose root cause.`
    },
    {
      question: `Why are you interested in joining ${job.company}?`,
      framework: 'Company Value Alignment',
      suggestedTalkingPoint: `Mention ${job.company}'s focus on high scale engineering, and how the ${job.title} role gives you real ownership to apply your Java/DSA foundation.`
    }
  ];

  const companyTips = [
    `Research ${job.company}'s latest engineering blogs, open-source repositories, or architecture talks.`,
    'Be vocal during coding rounds: talk through edge cases, time/space complexity before writing syntax.',
    'Ask thoughtful questions at the end about deployment cadence, mentorship structure, and intern project scope.'
  ];

  return {
    jobTitle: job.title,
    company: job.company,
    technicalTopics,
    dsaFocusAreas,
    behavioralQuestions,
    projectDeepDives,
    companyTips
  };
}
