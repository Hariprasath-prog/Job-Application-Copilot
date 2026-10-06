import { JobMatchBreakdown } from './job';

export type AgentRole = 'user' | 'assistant' | 'system' | 'tool';

export interface AgentStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  detail?: string;
  timestamp: string;
}

export interface AgentToolCall {
  id: string;
  toolName: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  status: 'running' | 'success' | 'error';
  errorMessage?: string;
  requiresApproval?: boolean;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  steps?: AgentStep[];
  toolCalls?: AgentToolCall[];
  matchSummary?: JobMatchBreakdown;
  actionCard?: {
    type: 'job_recommendation' | 'resume_tailored' | 'application_prepared' | 'followup_ready' | 'hitl_approval';
    payload: any;
  };
}

export interface HumanInTheLoopRequest {
  id: string;
  actionType: 'submit_application' | 'send_outreach' | 'alter_profile' | 'confirm_tailoring';
  title: string;
  summary: string;
  details: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
