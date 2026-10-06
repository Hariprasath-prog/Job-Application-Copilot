import React from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, AlertCircle, PieChart, Info } from 'lucide-react';
import { ApplicationRecord } from '../../types/application';
import { JobListing } from '../../types/job';
import { calculateAnalytics } from '../../services/analyticsService';

interface AnalyticsViewProps {
  applications: ApplicationRecord[];
  jobs: JobListing[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ applications, jobs }) => {
  const stats = calculateAnalytics(applications, jobs);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
            Zero-Hallucination Metrics
          </span>
          <span className="badge badge-good" style={{ fontSize: '0.7rem' }}>
            Application Intelligence
          </span>
        </div>
        <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Application & Conversion Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '6px' }}>
          Real, verifiable numbers computed directly from your pipeline status. No inflated statistics or fake benchmarks.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>APPLICATIONS SUBMITTED</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
            {stats.totalApplications}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Tracked in pipeline
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RESPONSE RATE</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#38bdf8' }}>
            {stats.responseRate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Employers acknowledging review
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>INTERVIEW RATE</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#f59e0b' }}>
            {stats.interviewRate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Interviews per application
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OFFER RATE</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>
            {stats.offerRate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Confirmed offers extended
          </span>
        </div>
      </div>

      {/* Funnel & Top Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Pipeline Funnel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Application Progression Funnel</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.funnel.map((f: { stage: string; count: number; percentage: number }) => (
              <div key={f.stage} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                  <span>{f.stage}</span>
                  <strong>{f.count} ({f.percentage}%)</strong>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.max(f.percentage, 4)}%`,
                      background: f.stage === 'Offer' ? '#10b981' : f.stage === 'Interview' ? '#f59e0b' : 'var(--primary)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Missing Skills in Job Market */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Most Demanded Market Skills</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Frequency of skills required across 8 target software engineering postings:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.topMissingSkills.map((item: { skill: string; frequency: number }, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}
              >
                <span><strong>{item.skill}</strong></span>
                <span className="badge badge-good" style={{ fontSize: '0.725rem' }}>
                  {item.frequency}% of postings
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
