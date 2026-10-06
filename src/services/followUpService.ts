import { ApplicationRecord } from '../types/application';
import { UserProfile } from '../types/profile';

export interface FollowUpItem {
  applicationId: string;
  company: string;
  position: string;
  daysSinceApplied: number;
  followUpDate: string;
  isDue: boolean;
  emailSubject: string;
  emailBody: string;
  linkedInMessage: string;
}

export function detectDueFollowUps(applications: ApplicationRecord[], profile: UserProfile): FollowUpItem[] {
  const now = new Date();
  const results: FollowUpItem[] = [];

  applications.forEach(app => {
    if (app.stage === 'Applied' || app.stage === 'Interview') {
      const appliedDate = app.dateApplied ? new Date(app.dateApplied) : new Date(app.dateDiscovered);
      const diffTime = Math.abs(now.getTime() - appliedDate.getTime());
      const daysSinceApplied = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Due if >= 7 days or explicit followUpDate is today or past
      const targetFollowUp = app.followUpDate ? new Date(app.followUpDate) : new Date(appliedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const isDue = now >= targetFollowUp || daysSinceApplied >= 7;

      const emailSubject = `Inquiry regarding Application: ${app.job.title} — ${profile.fullName}`;
      const emailBody = `Dear ${app.recruiterContact?.name || 'Hiring Team'} at ${app.job.company},

I hope you are having a productive week.

I am writing to respectfully follow up on my application for the ${app.job.title} position, submitted approximately ${daysSinceApplied} days ago on ${appliedDate.toLocaleDateString()}.

I remain extremely enthusiastic about the prospect of contributing to ${app.job.company}. Given my background in ${profile.skills.languages.slice(0, 3).join(', ')} and our alignment on foundational computer science principles, I would welcome any update you might have regarding the next steps in your recruitment process.

Please let me know if any additional information or work samples would be helpful. Thank you once again for your time and consideration.

Warm regards,
${profile.fullName}
${profile.phone} | ${profile.email}
${profile.linkedinUrl}`;

      const linkedInMessage = `Hi ${app.recruiterContact?.name || 'there'}, hope you're doing well! I recently applied for the ${app.job.title} role at ${app.job.company}. I'm following up to reiterate my strong enthusiasm for the role and team. Please let me know if there's any update or further details I can provide. Thank you! — ${profile.fullName}`;

      results.push({
        applicationId: app.id,
        company: app.job.company,
        position: app.job.title,
        daysSinceApplied,
        followUpDate: targetFollowUp.toISOString().split('T')[0],
        isDue,
        emailSubject,
        emailBody,
        linkedInMessage
      });
    }
  });

  return results;
}
