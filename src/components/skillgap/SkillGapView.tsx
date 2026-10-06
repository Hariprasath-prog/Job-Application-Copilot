import React from 'react';
import { TrendingUp, CheckCircle2, ArrowRight, Zap, Target, BookOpen, Calendar } from 'lucide-react';
import { UserProfile } from '../../types/profile';
import { JobListing } from '../../types/job';
import { analyzeSkillGaps } from '../../services/skillGapService';

interface SkillGapViewProps {
  profile: UserProfile;
  jobs: JobListing[];
}

export const SkillGapView: React.FC<SkillGapViewProps> = ({ profile, jobs }) => {
  const analysis = analyzeSkillGaps(profile, jobs);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-good" style={{ fontSize: '0.7rem' }}>
            Career Intelligence Module
          </span>
          <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
            Market Benchmarked
          </span>
        </div>
        <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Skill Gap Analysis & Learning Roadmap</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '6px' }}>
          Real-time skill comparison against requirements extracted from connected engineering listings. Focus on what companies actually test for.
        </p>
      </div>

      {/* Skill Clusters (Strong, Develop, Priority) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
        {/* Strong Foundations */}
        <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle2 size={18} color="#10b981" />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Strong Foundations</h3>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Verified proficiencies that match market postings directly.
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {analysis.strongSkills.slice(0, 8).map(s => (
              <span key={s} className="badge badge-high" style={{ fontSize: '0.75rem' }}>
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Develop Skills */}
        <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Develop & Solidify</h3>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Secondary assets that appear as preferred requirements in entry-level roles.
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {analysis.developSkills.map(s => (
              <span key={s} className="badge badge-stretch" style={{ fontSize: '0.75rem' }}>
                ⚡ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Priority Focus */}
        <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #6366f1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Target size={18} color="#6366f1" />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>High Market Priority</h3>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Appears frequently in candidate filters. Mastering these unlocks the highest score uplift.
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {analysis.prioritySkills.map(s => (
              <span key={s} className="badge badge-good" style={{ fontSize: '0.75rem' }}>
                🚀 {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Week Actionable Learning Roadmap (Prompt section 17) */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Calendar size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Curated 4-Week Actionable Learning Roadmap</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          {analysis.learningRoadmap.map(week => (
            <div
              key={week.week}
              style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                border: '1px solid var(--border-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-good" style={{ fontSize: '0.7rem' }}>
                  Week {week.week}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>7-day focus</span>
              </div>

              <h4 style={{ fontSize: '1rem', margin: 0 }}>{week.title}</h4>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <strong>Key Focus Area:</strong> <span style={{ color: 'var(--primary)' }}>{week.focusSkill}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Milestone Objectives:
                </span>
                <ul style={{ paddingLeft: '16px', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {week.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                marginTop: 'auto',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-card)',
                fontSize: '0.75rem',
                color: '#10b981'
              }}>
                <strong>Deliverable:</strong> {week.recommendedPractice}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
