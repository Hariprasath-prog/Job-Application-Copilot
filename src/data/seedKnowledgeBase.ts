import { ManagedDocument, DocumentChunk } from '../types/rag';
import { SemanticChunker } from '../services/rag/chunker';
import { EmbeddingFactory } from '../services/rag/embeddingProvider';
import { VectorStoreManager } from '../services/rag/vectorStore';

export const SEED_DOCUMENTS: {
  id: string;
  name: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'html';
  documentType: ManagedDocument['documentType'];
  visibility: 'private' | 'public';
  title: string;
  text: string;
  extraMetadata?: Record<string, any>;
}[] = [
  {
    id: 'doc_user_resume_hari_01',
    name: 'Hari_Kumar_Resume_2026.pdf',
    fileType: 'pdf',
    documentType: 'USER_RESUME',
    visibility: 'private',
    title: 'Hari Kumar Resume',
    text: `# Hari Kumar
Bangalore, Karnataka, India | +91 98765 43210 | hari.kumar@example.com
LinkedIn: linkedin.com/in/harikumar-cse | GitHub: github.com/harikumar-dev

## Summary
Motivated Computer Science undergraduate at R.V. College of Engineering (graduating 2026) with solid foundations in Data Structures & Algorithms, Core Java, C, and Web Development. Passionate about engineering reliable software systems and eager to contribute as a Software Engineering Intern.

## Education
B.Tech / B.E. in Computer Science and Engineering
R.V. College of Engineering, Bangalore (Graduating Batch 2026)
CGPA: 8.7 / 10.0 CGPA
Coursework: Data Structures & Algorithms, Object-Oriented Programming (Java), Database Management Systems (MySQL), Operating Systems, Computer Networks.

Higher Secondary Examination (12th Class)
National Public School, Bangalore (2022) | 92.4%

## Technical Skills
Languages: Java (Core Java, Collections, Multithreading basics), C, JavaScript (ES6+), HTML5, CSS3.
Frameworks & Libraries: React (Basics), Node.js (Basics), Express.js (Basics).
Databases & Storage: MySQL (Relational Schema Design, Joins, Indexing fundamentals).
Developer Tools: Git, GitHub, VS Code, IntelliJ IDEA, Linux / Bash, Postman.
Core Competencies: Data Structures & Algorithms (DSA), Object-Oriented Programming (OOP), System Architecture fundamentals.

## Projects
Online Bookstore & Inventory Management Portal (Java, MySQL, Servlets)
• Designed and developed a multi-tier e-commerce catalog application using Core Java and JDBC connection pooling.
• Built modular MVC architecture supporting 500+ catalog items with sub-second search times.
• Structured session tracking filters and role-based authentication for administrative inventory audits.
• Source Code: github.com/harikumar-dev/bookstore-portal

Interactive Student Task & Goal Tracker (JavaScript, HTML5, CSS3)
• Developed responsive single-page task scheduler featuring priority categorizing and local storage persistence.
• Implemented drag-and-drop task reordering with zero external UI libraries.

## Certifications
• Oracle Certified Associate, Java SE 8 Programmer (Score: 88%)
• HackerRank Problem Solving (Intermediate) - 5-star Gold Badge in Java & Problem Solving (200+ problems solved on LeetCode).

## Achievements
• Finalist at RVCE Intra-College Hackathon 2024 for developing campus lost-and-found portal.
• Academic Merit Scholarship recipient for top 5% batch performance in Data Structures coursework.`
  },
  {
    id: 'doc_user_project_bookstore_02',
    name: 'Online_Bookstore_Architecture_Spec.md',
    fileType: 'md',
    documentType: 'USER_PROJECT',
    visibility: 'private',
    title: 'Bookstore System Architecture',
    text: `# Online Bookstore & Inventory Management System Architecture Spec
Candidate Author: Hari Kumar | Repository: github.com/harikumar-dev/bookstore-portal

## Architecture Overview
The system utilizes a 3-tier model:
1. Presentation Layer: JSP / HTML5 with CSS3 responsive flexbox layouts.
2. Application Layer: Java Servlets handling HTTP requests, user sessions, and business validation.
3. Persistence Layer: MySQL relational database accessed via DAO (Data Access Object) pattern and JDBC Connection Pooling.

## Verified Technologies Implemented
• Language: Java (Java 8 / Java 11)
• Database: MySQL 8.0 with InnoDB engine
• Build & Dependencies: Apache Maven
• Version Control: Git / GitHub

## Database Design & Schema
Contains tables for books, categories, users, orders, and order_items with foreign key cascades and composite indexes on title and ISBN.

## Engineering Challenges Overcome
Prevented race conditions during inventory checkout by implementing synchronized transactional rollback blocks within JDBC DAO.`
  },
  {
    id: 'doc_jd_abc_technologies_03',
    name: 'ABC_Technologies_SE_Intern_JD.pdf',
    fileType: 'pdf',
    documentType: 'JOB_DESCRIPTION',
    visibility: 'public',
    title: 'ABC Technologies - Software Engineer Intern',
    extraMetadata: { jobId: 'job_abc_tech_01', company: 'ABC Technologies' },
    text: `# ABC Technologies - Software Engineer Intern Job Description
Location: Bangalore, Karnataka (Hybrid - 3 days office, 2 days remote)
Employment Type: Internship (6 months with Full-Time PPO conversion review)
Stipend: ₹35,000 - ₹45,000 / month

## About Company
ABC Technologies is an enterprise cloud and logistics platform powering next-generation supply chains across India and Southeast Asia. Our platform team processes over 10 million transactions daily with high reliability.

## Role Overview
We are looking for passionate Software Engineering Interns to join our platform team in Bangalore for our 2026 campus hiring cohort. You will write clean, well-tested code, assist in building microservices, and collaborate in agile sprint cycles.

## Required Qualifications
• Education: B.E. / B.Tech in Computer Science, Information Science, or related engineering discipline (2025 or 2026 graduating batches). Minimum CGPA: 7.0 / 10.0.
• Strong foundation in Object-Oriented Programming (Java preferred or C++).
• Solid understanding of Data Structures and Algorithms (Arrays, Linked Lists, Trees, Graphs, Sorting).
• Version control experience with Git and GitHub.
• Clear verbal and written technical communication.

## Preferred Qualifications
• Hands-on familiarity with Spring Boot or modern REST API development.
• Relational database skills: SQL, MySQL, or PostgreSQL query tuning.
• Familiarity with Linux terminal and containerization concepts (Docker).

## Responsibilities
• Develop and maintain RESTful web services in Java.
• Participate in design discussions and code reviews with senior staff engineers.
• Write unit and integration tests using JUnit and Mockito.
• Debug issues in staging and production environments.

## Benefits & Compensation
• Competitive monthly stipend: ₹35,000 - ₹45,000.
• Pre-Placement Offer (PPO) opportunity based on 6-month internship performance.
• Catered healthy breakfast and lunches provided at our Bangalore tech park office.
• Comprehensive mentorship from senior engineering architects.
• Policy Note: Relocation or accommodation allowance is NOT provided for internship roles; candidates must arrange local Bangalore accommodation.`
  },
  {
    id: 'doc_company_abc_culture_04',
    name: 'ABC_Technologies_Hiring_Process.md',
    fileType: 'md',
    documentType: 'COMPANY_INFORMATION',
    visibility: 'public',
    title: 'ABC Technologies Hiring Culture & Process',
    extraMetadata: { company: 'ABC Technologies' },
    text: `# ABC Technologies Engineering & Campus Hiring Guide
Official Campus Recruitment Insights

## Interview Process for SE Intern Roles
Round 1: Online Technical Assessment (60 mins)
• 2 DSA coding problems (Easy to Medium on LeetCode standard: Strings/HashMaps and Trees).
• 20 MCQs covering Core Java, OOP principles, SQL queries, and DBMS basics.

Round 2: Technical Interview (45 mins)
• Deep-dive into projects listed on candidate resume.
• Live coding and explanation of problem solving thought process.
• Java fundamentals: Collections Framework, HashMap collision handling, Polymorphism vs Inheritance.

Round 3: Techno-Managerial & Culture Fit (30 mins)
• Project architecture review and STAR-method behavioral inquiries.
• Collaboration, adaptability, and curiosity to learn backend technologies.`
  },
  {
    id: 'doc_jd_phonepe_05',
    name: 'PhonePe_GET_Backend_JD.pdf',
    fileType: 'pdf',
    documentType: 'JOB_DESCRIPTION',
    visibility: 'public',
    title: 'PhonePe - Graduate Engineer Trainee',
    extraMetadata: { jobId: 'job_phonepe_get_02', company: 'PhonePe' },
    text: `# PhonePe - Graduate Engineer Trainee (Backend)
Location: Bangalore, Karnataka | Employment Type: Full-time Trainee
Compensation: ₹12,00,000 - ₹16,00,000 CTC per annum

## Required Qualifications
• B.Tech/B.E. in Computer Science or Electrical Engineering (2025/2026 graduating batch).
• Strong coding skills in Java or Go.
• Deep understanding of concurrency, multithreading, and distributed transactional consistency.
• Excellent Data Structures & Algorithms proficiency.

## Preferred Qualifications
• Experience with Kafka, Redis, or Apache Cassandra.
• High throughput, low latency system design principles.`
  },
  {
    id: 'doc_interview_guide_06',
    name: 'Core_Java_and_DSA_Interview_Prep_2026.md',
    fileType: 'md',
    documentType: 'INTERVIEW_GUIDE',
    visibility: 'public',
    title: 'Core Java & DSA Interview Preparation Manual',
    text: `# Core Java & DSA Technical Interview Preparation Manual
Targeted for 2026 College Campus Placements & Internships

## High-Frequency Core Java Interview Questions
1. How does a HashMap work internally in Java 8+?
Explain buckets, hash computation, equals() contract, and the treeification threshold (when linked list length exceeds 8, converts to Red-Black tree).

2. JVM Memory Model & Garbage Collection:
Explain Heap vs Stack memory, Young Generation (Eden, Survivor spaces), Old Generation, and how Garbage Collector frees dereferenced objects.

3. Method Overloading vs Overriding:
Overloading is compile-time polymorphism with different parameter signatures. Overriding is runtime polymorphism using virtual method invocation.

## STAR Behavioral Interview Answers
When discussing college projects:
• Situation: Set the academic problem or customer need.
• Task: What specific component were you assigned to engineer?
• Action: Explain the technical steps you took (e.g. implementing MVC in Java, writing normalized SQL tables).
• Result: Quantifiable outcome (e.g. sub-second queries, zero failed transactions, positive grading).`
  },
  {
    id: 'doc_career_guide_07',
    name: 'Fresher_Tech_Resume_Guidelines_ATS.md',
    fileType: 'md',
    documentType: 'CAREER_GUIDE',
    visibility: 'public',
    title: 'Fresher Tech Resume Guidelines & ATS Compliance',
    text: `# Fresher Tech Resume Guidelines & ATS Compliance
Career Best Practices for Engineering Students

## Golden Rules for Truthful Tech Resumes
1. Never fabricate experience or tools you cannot defend in a 30-minute technical interview.
2. If a job requires Spring Boot but you only know Core Java, highlight your strong Java OOP foundations and express fast learning agility, rather than claiming false production experience.
3. Quantify project impact wherever possible (e.g., "handled 500+ items", "improved search performance by 40%").
4. Keep the resume to a single page for candidates with 0-2 years of experience.`
  },
  {
    id: 'doc_learning_resource_08',
    name: 'Spring_Boot_and_SQL_Transition_Roadmap.md',
    fileType: 'md',
    documentType: 'LEARNING_RESOURCE',
    visibility: 'public',
    title: 'Spring Boot & SQL 30-Day Transition Guide',
    text: `# Spring Boot & SQL 30-Day Transition Guide
Bridge the Gap from Core Java to Production Backend Engineer

## Week 1: Spring Framework Core
• Dependency Injection (IoC Container), Bean lifecycle, @Component, @Autowired.
• Build first Spring application without XML configuration.

## Week 2: Spring Boot & REST APIs
• Spring Boot Auto-configuration, @RestController, @GetMapping, @PostMapping.
• Request validation with Jakarta Validation and Postman testing.

## Week 3: Spring Data JPA & SQL Integration
• Connecting Spring Boot to MySQL database using Spring Data JPA.
• Repository interfaces (JpaRepository), writing JPQL and native SQL queries.

## Week 4: Capstone Mini-Project
• Build a secured REST API with CRUD operations, pagination, and Docker containerization.`
  }
];

export async function initializeSeedKnowledgeBase(userId: string = 'user_hari_kumar_01'): Promise<void> {
  const existingDocs = VectorStoreManager.getManagedDocuments(userId);
  if (existingDocs.length >= SEED_DOCUMENTS.length) {
    return; // Already initialized
  }

  for (const item of SEED_DOCUMENTS) {
    const existing = existingDocs.find(d => d.id === item.id);
    if (existing) continue;

    const managedDoc: ManagedDocument = {
      id: item.id,
      userId: item.visibility === 'private' ? userId : 'system',
      name: item.name,
      fileType: item.fileType,
      documentType: item.documentType,
      sizeBytes: item.text.length,
      hash: `hash_${item.id}_${item.text.length}`,
      status: 'embedding',
      chunksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      visibility: item.visibility,
      rawContent: item.text
    };

    const chunks: DocumentChunk[] = SemanticChunker.chunk(item.text, {
      documentId: item.id,
      userId: managedDoc.userId,
      documentType: item.documentType,
      source: item.name,
      title: item.title,
      visibility: item.visibility,
      extraMetadata: item.extraMetadata
    });

    for (const chunk of chunks) {
      const { embedding } = await EmbeddingFactory.getEmbedding(chunk.content);
      chunk.embedding = embedding;
    }

    await VectorStoreManager.addChunks(chunks);
    managedDoc.chunksCount = chunks.length;
    managedDoc.status = 'indexed';
    VectorStoreManager.saveManagedDocument(managedDoc);
  }
}
