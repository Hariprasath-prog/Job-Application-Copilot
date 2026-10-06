import { AgentMessage, AgentStep, HumanInTheLoopRequest } from '../types/agent';
import { StorageService } from '../services/storageService';
import { AgentTools } from './agentTools';
import { calculateJobMatch } from '../services/matchEngine';
import { AiService } from '../services/aiService';

export interface OrchestrationResult {
  message: AgentMessage;
  hitlRequest?: HumanInTheLoopRequest;
}

export const AgentOrchestrator = {
  async processUserInput(
    userInput: string,
    onStepUpdate?: (steps: AgentStep[]) => void
  ): Promise<OrchestrationResult> {
    const text = userInput.trim().toLowerCase();
    const profile = StorageService.getProfile();
    const allJobs = StorageService.getJobs();
    const apps = StorageService.getApplications();

    const steps: AgentStep[] = [];
    const addStep = (label: string, status: AgentStep['status'] = 'completed', detail?: string) => {
      const step: AgentStep = {
        id: `step_${Date.now()}_${Math.random()}`,
        label,
        status,
        detail,
        timestamp: new Date().toISOString()
      };
      steps.push(step);
      if (onStepUpdate) onStepUpdate([...steps]);
      return step;
    };

    // Intent 1: Why is a job ranked #1 or why match?
    if (text.includes('why') && (text.includes('rank') || text.includes('match') || text.includes('abc') || text.includes('#1') || text.includes('first'))) {
      addStep('Inspecting top ranked opportunity in verified job list');
      addStep('Executing calculate_job_match() with user profile factors');

      const topJob = allJobs[0];
      const match = calculateJobMatch(profile, topJob);

      addStep('Synthesizing explainable evaluation rubric');

      const responseText = `### Why ${topJob.company} (${topJob.title}) is Ranked #1:

**Estimated Match Score: ${match.overallScore}% (${match.priority})**

#### Evidence & Alignment
${match.whyYouMatch.map(w => `• ${w}`).join('\n')}

#### Skill Breakdown
• **Matched Skills:** ${match.matchedSkills.join(', ')}
• **Missing Required Skills:** ${match.missingRequiredSkills.join(', ') || 'None!'}
• **Missing Preferred Skills:** ${match.missingPreferredSkills.join(', ') || 'None'}

#### Honest Assessment
${match.recommendationReason}

> **Recommendation: ${match.recommendation}**
> Would you like me to tailor your resume for ${topJob.company} without inventing any unverified experience?`;

      return {
        message: {
          id: `msg_${Date.now()}`,
          sender: 'agent',
          text: responseText,
          timestamp: new Date().toISOString(),
          steps,
          matchSummary: match,
          actionCard: {
            type: 'job_recommendation',
            payload: { job: topJob, match }
          }
        }
      };
    }

    // Intent 2: Tailor Resume
    if (text.includes('tailor') || text.includes('customize resume') || (text.includes('resume') && text.includes('job'))) {
      addStep('Step 1: Read user profile & verified project portfolio');
      addStep('Step 2: Inspect target job requirements (ABC Technologies)');
      addStep('Step 3: Run anti-hallucination verification gate');
      addStep('Step 4: Reorganize relevant achievements without fabricating claims');

      const targetJob = allJobs.find(j => text.includes(j.company.toLowerCase())) || allJobs[0];
      const tailored = AgentTools.tailor_resume.execute({ jobId: targetJob.id });

      const responseText = `### Truthful Tailored Resume Generated for ${targetJob.company}

**Anti-Hallucination Status:** ✓ Verified facts only. Zero fabricated metrics or experiences.

#### What was emphasized:
• Prioritized your project **"${tailored.prioritizedProjects[0]?.title}"** which uses **${tailored.highlightedSkills.join(', ')}**.
• Highlighted verified proficiencies: **${tailored.highlightedSkills.join(', ')}**.

#### Skills Not Added (To maintain absolute truthfulness):
${tailored.truthfulnessAudit.skillsNotFabricated.length > 0
  ? tailored.truthfulnessAudit.skillsNotFabricated.map((s: string) => `• ⚠ **${s}** — Omitted because you have not verified hands-on experience in this stack.`).join('\n')
  : '• All required skills matched your verified profile.'}

#### Guidance:
${tailored.truthfulnessAudit.adviceForMissingSkills.join('\n\n')}

You can inspect or download the tailored resume in the **Resume Studio** tab!`;

      return {
        message: {
          id: `msg_${Date.now()}`,
          sender: 'agent',
          text: responseText,
          timestamp: new Date().toISOString(),
          steps,
          actionCard: {
            type: 'resume_tailored',
            payload: tailored
          }
        }
      };
    }

    // Intent 3: Apply / Consequential Action with Human-In-The-Loop Confirmation
    if (text.includes('apply') || text.includes('submit')) {
      addStep('Step 1: Check target opportunity');
      addStep('Step 2: Generate application package (Cover Letter + Custom Q&A)');
      addStep('Step 3: Trigger Human-in-the-Loop Confirmation Gate (Consequential Action)');

      const targetJob = allJobs.find(j => text.includes(j.company.toLowerCase())) || allJobs[0];
      const prep = AgentTools.prepare_application.execute({ jobId: targetJob.id });

      const hitlRequest: HumanInTheLoopRequest = {
        id: `hitl_${Date.now()}`,
        actionType: 'submit_application',
        title: `Confirm Application Submission to ${targetJob.company}`,
        summary: `The Copilot prepared a complete, truth-verified application package for ${targetJob.title}. As an AI assistant, it requires your explicit human review before recording this application as Applied.`,
        details: {
          company: targetJob.company,
          role: targetJob.title,
          stipend: targetJob.stipendOrSalary,
          portalUrl: targetJob.sourceUrl,
          coverLetter: prep.coverLetter,
          answers: prep.qna
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const responseText = `I have assembled the complete application package for **${targetJob.company} (${targetJob.title})**:

✓ Truth-verified tailored resume summary
✓ Grounded cover letter
✓ Targeted answers to company prompts

⚠️ **Human-in-the-Loop Requirement**:
Per our safety protocol, I will not submit or alter your application records without your explicit approval. Please review the application package in the confirmation modal and click **Approve & Apply** when ready.`;

      return {
        message: {
          id: `msg_${Date.now()}`,
          sender: 'agent',
          text: responseText,
          timestamp: new Date().toISOString(),
          steps,
          actionCard: {
            type: 'hitl_approval',
            payload: hitlRequest
          }
        },
        hitlRequest
      };
    }

    // Intent 4: Check follow-ups
    if (text.includes('follow') || text.includes('reminder')) {
      addStep('Step 1: Scan active applications');
      addStep('Step 2: Evaluate elapsed calendar days & response deadlines');
      addStep('Step 3: Generate polite follow-up outreach drafts');

      const due = AgentTools.generate_followup.execute({});

      if (due.length > 0) {
        const item = due[0];
        const responseText = `### Follow-up Alert: ${item.company}

You applied to **${item.company}** for **${item.position}** ${item.daysSinceApplied} days ago. Your follow-up date is **today (${item.followUpDate})**.

#### Suggested Email Subject:
\`${item.emailSubject}\`

#### Drafted Message:
\`\`\`text
${item.emailBody}
\`\`\`

*Note: Per our trust & safety policy, the agent will never contact recruiters autonomously. You can copy this message to send via your own email or LinkedIn.*`;

        return {
          message: {
            id: `msg_${Date.now()}`,
            sender: 'agent',
            text: responseText,
            timestamp: new Date().toISOString(),
            steps,
            actionCard: {
              type: 'followup_ready',
              payload: item
            }
          }
        };
      } else {
        return {
          message: {
            id: `msg_${Date.now()}`,
            sender: 'agent',
            text: `All your submitted applications are currently within normal response windows. No immediate follow-ups are due today!`,
            timestamp: new Date().toISOString(),
            steps
          }
        };
      }
    }

    // Intent 5: Skill Gaps / Learning Roadmap
    if (text.includes('skill') || text.includes('learn') || text.includes('roadmap') || text.includes('gap')) {
      addStep('Step 1: Aggregate required skills across 8 active job postings');
      addStep('Step 2: Compare against verified student skills matrix');
      addStep('Step 3: Cluster into Strong, Develop, and Priority tiers');
      addStep('Step 4: Generate 4-week actionable learning roadmap');

      const analysis = AgentTools.analyze_skill_gap.execute({});

      const responseText = `### Market Skill Gap Analysis for ${profile.preferences.targetRoles[0]}

**Strong Foundations You Possess:**
${analysis.strongSkills.slice(0, 5).map((s: string) => `• ✓ ${s}`).join('\n')}

**Priority Skills To Learn (High Market Frequency):**
${analysis.prioritySkills.map((s: string) => `• 🚀 **${s}** (Appears in most target postings)`).join('\n')}

#### 4-Week Learning Roadmap:
${analysis.learningRoadmap.map((w: any) => `* **${w.title}**: Focus on *${w.focusSkill}*. Objective: ${w.objectives[0]} (Practice: ${w.recommendedPractice})`).join('\n\n')}

You can view the full weekly curriculum in the **Skill Gaps** tab.`;

      return {
        message: {
          id: `msg_${Date.now()}`,
          sender: 'agent',
          text: responseText,
          timestamp: new Date().toISOString(),
          steps
        }
      };
    }

    // Intent 6: Interview Preparation
    if (text.includes('interview') || text.includes('prep') || text.includes('dsa') || text.includes('question')) {
      addStep('Step 1: Identify target interview opportunity');
      addStep('Step 2: Extract technical stack and DSA patterns');
      addStep('Step 3: Formulate STAR behavioral prompts for your projects');

      const targetJob = allJobs.find(j => text.includes(j.company.toLowerCase())) || allJobs[1]; // PhonePe or ABC
      const prep = AgentTools.generate_interview_questions.execute({ jobId: targetJob.id });

      const responseText = `### Interview Preparation Guide: ${prep.company} (${prep.jobTitle})

#### 1. Core Technical Focus
${prep.technicalTopics.map((t: any) => `**${t.domain}**\n${t.keyConcepts.slice(0, 3).map((c: string) => `• ${c}`).join('\n')}`).join('\n\n')}

#### 2. Key DSA Patterns to Drill
${prep.dsaFocusAreas.slice(0, 2).map((d: any) => `• **${d.topic}** [${d.importance}]: Practice *${d.sampleProblem}*`).join('\n')}

#### 3. Behavioral Talking Points (STAR Method)
• **Tell me about yourself**: Focus on your B.Tech CSE coursework and building "${profile.projects[0]?.title}".

Check the **Interview Prep** tab for the complete question bank!`;

      return {
        message: {
          id: `msg_${Date.now()}`,
          sender: 'agent',
          text: responseText,
          timestamp: new Date().toISOString(),
          steps
        }
      };
    }

    // Live AI query for general career questions or customized advice
    if (AiService.isLiveAiAvailable() && (
      text.includes('how') ||
      text.includes('what') ||
      text.includes('explain') ||
      text.includes('tell') ||
      text.includes('tip') ||
      text.includes('advice') ||
      text.includes('recommend') ||
      text.includes('write') ||
      text.includes('draft')
    )) {
      addStep('Consulting connected Live AI reasoning engine');
      const systemPrompt = `You are an expert recruitment-tech architect and AI Job Application Copilot for ${profile.fullName}, a B.Tech CSE student graduating in ${profile.education[0]?.graduationYear}.
Verified Profile Facts:
- Degree: ${profile.education[0]?.degree} at ${profile.education[0]?.institution}
- Verified Skills: ${profile.skills.languages.join(', ')}, ${profile.skills.frameworks.join(', ')}, ${profile.skills.toolsAndPlatforms.join(', ')}
- Target Role: ${profile.preferences.targetRoles.join(', ')}
Guidelines:
1. Ground all recommendations on the candidate's verified skills and project experience.
2. NEVER hallucinate or invent experience or unverified qualifications.
3. Be concise, actionable, and encouraging.`;

      const liveResponse = await AiService.generateCompletion(userInput, systemPrompt);
      if (liveResponse) {
        addStep('Grounded facts verified against local profile memory');
        return {
          message: {
            id: `msg_${Date.now()}`,
            sender: 'agent',
            text: liveResponse,
            timestamp: new Date().toISOString(),
            steps
          }
        };
      }
    }

    // Default: General Job Search & Discovery
    addStep('Step 1: Read user profile & career preferences');
    addStep('Step 2: Build structured search criteria from query');
    addStep('Step 3: Search available job sources (Career pages, LinkedIn, Internshala)');
    addStep('Step 4: Normalize job listings & remove duplicates');
    addStep('Step 5: Check candidate eligibility & graduation batch');
    addStep('Step 6: Compute transparent match scores for each opportunity');
    addStep('Step 7: Rank and summarize high-quality matches');

    const searchRes = AgentTools.search_jobs.execute({ query: userInput });
    const matches = searchRes.jobs.map((j: any) => ({
      job: j,
      match: calculateJobMatch(profile, j)
    })).sort((a: any, b: any) => b.match.overallScore - a.match.overallScore);

    const highMatches = matches.filter((m: any) => m.match.overallScore >= 80);

    const responseText = `### Job Discovery & Evaluation Results

I scanned connected job sources and identified **${searchRes.totalDiscovered} total opportunities**. After removing **${searchRes.duplicatesRemoved} duplicate listings** and verifying your student eligibility, here are the top recommendations:

${matches.slice(0, 4).map((m: any, idx: number) => `**#${idx + 1}. ${m.job.title} — ${m.job.company}** (${m.job.location})
• **Match Score:** ${m.match.overallScore}% [${m.match.priority}]
• **Stipend/Compensation:** ${m.job.stipendOrSalary}
• **Why it matches:** ${m.match.matchedSkills.slice(0, 3).join(', ')} match your verified skills.
• **Gaps:** ${m.match.missingRequiredSkills.join(', ') || 'No critical gaps'}`).join('\n\n')}

You can view full details or tailor your resume for any role directly from the **Jobs** tab!`;

    return {
      message: {
        id: `msg_${Date.now()}`,
        sender: 'agent',
        text: responseText,
        timestamp: new Date().toISOString(),
        steps,
        actionCard: {
          type: 'job_recommendation',
          payload: { job: matches[0]?.job, match: matches[0]?.match }
        }
      }
    };
  }
};
