import React from 'react';
import { Bot, Bell, Moon, Sun, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { UserProfile } from '../../types/profile';

interface HeaderProps {
  profile: UserProfile;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenCopilot: () => void;
  onRestartOnboarding: () => void;
  dueFollowUpCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  theme,
  onToggleTheme,
  onOpenCopilot,
  onRestartOnboarding,
  dueFollowUpCount
}) => {
  return (
    <header style={{
      height: '68px',
      borderBottom: '1px solid var(--border-card)',
      background: 'var(--bg-sidebar)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--primary-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
              Job Application Copilot
            </span>
            <span className="badge badge-good" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
              Autonomous Agent v2.4
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={12} color="#10b981" />
            <span>Anti-Hallucination & HITL Guard Active</span>
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Follow-up reminder alert if due */}
        {dueFollowUpCount > 0 && (
          <div
            className="badge badge-stretch"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              animation: 'pulse 2s infinite'
            }}
          >
            <Bell size={13} />
            <span>{dueFollowUpCount} Follow-up Due Today</span>
          </div>
        )}

        {/* Guided walkthrough trigger */}
        <button
          className="btn btn-outline btn-sm"
          onClick={onRestartOnboarding}
          title="Restart Onboarding Walkthrough"
        >
          <HelpCircle size={15} />
          <span>Product Tour</span>
        </button>

        {/* Theme toggle */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onToggleTheme}
          title="Toggle Light / Dark Mode"
          style={{ padding: '8px 12px' }}
        >
          {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6366f1" />}
        </button>

        {/* AI Copilot Drawer Button */}
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenCopilot}
          style={{ gap: '8px', padding: '8px 16px' }}
        >
          <Bot size={16} />
          <span>Ask Copilot</span>
        </button>

        {/* Profile Avatar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '12px',
          borderLeft: '1px solid var(--border-card)'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            {profile.fullName.charAt(0)}
          </div>
          <div style={{ display: 'none', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>{profile.fullName}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{profile.preferences.targetRoles[0]}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
