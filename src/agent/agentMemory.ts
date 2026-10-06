import { UserProfile } from '../types/profile';
import { ApplicationRecord } from '../types/application';
import { AgentMessage } from '../types/agent';

export interface AgentMemorySnapshot {
  verifiedProfileFacts: string[];
  recentConversations: { role: string; summary: string }[];
  activeApplicationsCount: number;
  dueFollowUpsCount: number;
}

export const AgentMemory = {
  getMemorySnapshot(profile: UserProfile, apps: ApplicationRecord[], messages: AgentMessage[]): AgentMemorySnapshot {
    const verifiedProfileFacts = [
      `Name: ${profile.fullName}`,
      `Education: ${profile.education[0]?.degree} in ${profile.education[0]?.fieldOfStudy} (${profile.education[0]?.institution}, Batch ${profile.education[0]?.graduationYear})`,
      `Skills: ${profile.skills.languages.join(', ')} | Tools: ${profile.skills.toolsAndPlatforms.join(', ')}`,
      `Verified Projects: ${profile.projects.map(p => p.title).join(', ')}`,
      `Target Roles: ${profile.preferences.targetRoles.join(', ')}`,
      `Preferred Locations: ${profile.preferences.preferredLocations.join(', ')} (${profile.preferences.workMode.join('/')})`
    ];

    const recentConversations = messages.slice(-5).map(m => ({
      role: m.sender,
      summary: m.text.slice(0, 100) + (m.text.length > 100 ? '...' : '')
    }));

    const activeApplicationsCount = apps.filter(a => a.stage !== 'Rejected').length;
    const dueFollowUpsCount = apps.filter(a => a.followUpStatus === 'Due Today').length;

    return {
      verifiedProfileFacts,
      recentConversations,
      activeApplicationsCount,
      dueFollowUpsCount
    };
  }
};
