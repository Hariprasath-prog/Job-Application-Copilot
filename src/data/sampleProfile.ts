import { UserProfile } from '../types/profile';

export const SAMPLE_STUDENT_PROFILE: UserProfile = {
  id: 'user_hari_kumar_01',
  fullName: 'Hari Kumar',
  email: 'hari.kumar@example.com',
  phone: '+91 98765 43210',
  location: 'Bangalore, Karnataka, India',
  headline: 'Aspiring Software Engineer | B.Tech CSE (2026) | Java • C • Web Development • DSA',
  summary: 'Motivated Computer Science undergraduate with solid foundation in Data Structures, Algorithms, Core Java, C, and Web Technologies. Passionate about building reliable software systems and eager to contribute as a Software Engineering Intern.',
  githubUrl: 'https://github.com/harikumar-dev',
  linkedinUrl: 'https://linkedin.com/in/harikumar-cse',
  portfolioUrl: 'https://harikumar.dev',
  codingProfiles: [
    {
      platform: 'LeetCode',
      url: 'https://leetcode.com/u/harikumar_cse',
      handle: 'harikumar_cse (200+ solved)'
    },
    {
      platform: 'GitHub',
      url: 'https://github.com/harikumar-dev',
      handle: 'harikumar-dev (14 public repos)'
    }
  ],
  education: [
    {
      id: 'edu_1',
      degree: 'B.Tech / B.E.',
      fieldOfStudy: 'Computer Science and Engineering',
      institution: 'R.V. College of Engineering, Bangalore',
      graduationYear: 2026,
      cgpaOrPercentage: '8.7 / 10.0 CGPA',
      currentStatus: 'Studying'
    },
    {
      id: 'edu_2',
      degree: 'Higher Secondary (12th Class)',
      fieldOfStudy: 'Physics, Chemistry, Mathematics & CS',
      institution: 'National Public School, Bangalore',
      graduationYear: 2022,
      cgpaOrPercentage: '92.4%',
      currentStatus: 'Graduated'
    }
  ],
  skills: {
    languages: ['Java', 'C', 'JavaScript', 'HTML5', 'CSS3'],
    frameworks: ['React (Basics)', 'Node.js (Basics)'],
    databases: ['MySQL (Basics)'],
    toolsAndPlatforms: ['Git', 'GitHub', 'VS Code', 'IntelliJ IDEA', 'Linux / Bash'],
    coreConcepts: ['Data Structures & Algorithms (DSA)', 'Object-Oriented Programming (OOP)', 'Database Management Systems (DBMS)', 'Operating Systems']
  },
  projects: [
    {
      id: 'proj_1',
      title: 'Online Bookstore & Inventory Portal',
      technologies: ['Java', 'MySQL', 'Servlets', 'HTML', 'CSS'],
      description: 'Built a multi-tier e-commerce catalog featuring search, cart management, and inventory stock tracking.',
      bullets: [
        'Implemented MVC architecture using Core Java and JDBC connection pooling for MySQL database.',
        'Designed normalized relational schema supporting over 500 catalog items with sub-second search times.',
        'Structured modular validation filters for session tracking and user authentication.'
      ],
      githubUrl: 'https://github.com/harikumar-dev/bookstore-portal'
    },
    {
      id: 'proj_2',
      title: 'Interactive Student Task & Goal Tracker',
      technologies: ['JavaScript', 'HTML5', 'CSS3', 'Local Storage API'],
      description: 'Lightweight productivity web application for college coursework planning with priority scheduling.',
      bullets: [
        'Engineered responsive drag-and-drop task boards using pure vanilla JavaScript and CSS Grid.',
        'Integrated local persistent storage with JSON backup and dynamic status badge filtering.',
        'Achieved 100/100 Lighthouse performance and accessibility scores.'
      ],
      githubUrl: 'https://github.com/harikumar-dev/student-task-tracker',
      liveUrl: 'https://harikumar-dev.github.io/student-task-tracker'
    },
    {
      id: 'proj_3',
      title: 'Custom Memory Allocator Simulation',
      technologies: ['C', 'Linux', 'GDB'],
      description: 'Academic systems project implementing malloc and free memory management simulation in C.',
      bullets: [
        'Implemented first-fit and best-fit memory allocation algorithms in C with block splitting and coalescing.',
        'Benchmarked heap utilization and fragmentation overhead against standard glibc allocation.'
      ],
      githubUrl: 'https://github.com/harikumar-dev/c-memory-allocator'
    }
  ],
  experience: [], // Student has no prior corporate internships yet, exactly as described in section 3
  certifications: [
    {
      id: 'cert_1',
      name: 'Java Programming Masterclass',
      issuer: 'Udemy / Tim Buchalka',
      issueDate: '2024-04'
    },
    {
      id: 'cert_2',
      name: 'Data Structures and Algorithms Specialization',
      issuer: 'Coursera / UC San Diego',
      issueDate: '2024-09'
    }
  ],
  achievements: [
    'Solved 200+ LeetCode problems (Array, String, HashMap, Two-Pointers, Binary Search, Trees).',
    'Department Hackathon 2nd Runner Up for Campus Problem Solver prototype (2024).',
    'Active Technical Member of Campus Open Source & Coding Club.'
  ],
  preferences: {
    targetRoles: ['Software Engineer Intern', 'Java Developer Intern', 'Graduate Engineer Trainee', 'Frontend Developer Intern'],
    preferredLocations: ['Bangalore', 'Hyderabad', 'Pune', 'Remote'],
    workMode: ['Hybrid', 'Remote', 'On-site'],
    employmentType: ['Internship', 'Full-time'],
    expectedStipendOrSalary: '₹25,000 - ₹50,000 / month',
    workAuthorization: 'Authorized to work in India (Citizen)',
    noticePeriod: 'Immediate (College NOC available for 6-month intern)',
    graduationBatch: '2026 Batch'
  },
  resumeFileName: 'Hari_Kumar_Resume_Software_Intern.pdf',
  resumeParsedAt: '2026-10-06T10:00:00.000Z',
  updatedAt: new Date().toISOString()
};
