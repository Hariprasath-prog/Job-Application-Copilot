import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  KanbanSquare,
  FileText,
  UserCheck,
  TrendingUp,
  BrainCircuit,
  Bot,
  BarChart3,
  Settings,
  Flame
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'jobs'
  | 'applications'
  | 'resume'
  | 'profile'
  | 'skillgaps'
  | 'interview'
  | 'copilot'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  applicationsCount: number;
  jobsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  applicationsCount,
  jobsCount
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'jobs', label: 'Job Discovery', icon: <Briefcase size={18} />, badge: jobsCount },
    { id: 'applications', label: 'Applications', icon: <KanbanSquare size={18} />, badge: applicationsCount },
    { id: 'resume', label: 'Resume Studio', icon: <FileText size={18} /> },
    { id: 'profile', label: 'Career Profile', icon: <UserCheck size={18} /> },
    { id: 'skillgaps', label: 'Skill Gaps & Map', icon: <TrendingUp size={18} /> },
    { id: 'interview', label: 'Interview Prep', icon: <BrainCircuit size={18} /> },
    { id: 'copilot', label: 'AI Copilot Chat', icon: <Bot size={18} />, badge: 'Agent' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'settings', label: 'Settings & Connectors', icon: <Settings size={18} /> }
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-card)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 14px',
      gap: '24px',
      flexShrink: 0
    }}>
      {/* Target Role Tag */}
      <div style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Flame size={14} color="#f59e0b" />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Search Goal
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Software Engineer Intern
        </div>
        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Bangalore • Hybrid / Remote
        </div>
      </div>

      {/* Nav Link List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: isActive ? 'var(--primary)' : 'inherit' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--primary)' : 'var(--bg-card)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  border: '1px solid var(--border-card)',
                  fontWeight: 600
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Agent Health Indicator */}
      <div style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(16, 185, 129, 0.06)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        fontSize: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 600 }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
          <span>Connectors Online</span>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>
          4 Feeds Active • 0 Hallucinations
        </span>
      </div>
    </aside>
  );
};
