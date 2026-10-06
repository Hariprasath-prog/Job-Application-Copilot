import React from 'react';
import {
  Briefcase,
  Users,
  Award,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileText,
  Building,
  MapPin
} from 'lucide-react';
import { UserProfile } from '../../types/profile';
import { JobListing, JobMatchBreakdown } from '../../types/job';
import { ApplicationRecord } from '../../types/application';
import { MatchScoreGauge } from '../common/MatchScoreGauge';
import { calculateJobMatch } from '../../services/matchEngine';
import { detectDueFollowUps } from '../../services/followUpService';

interface DashboardViewProps {
  profile: UserProfile;
  jobs: JobListing[];
  applications: ApplicationRecord[];
  onSelectJob: (job: JobListing) => void;
  onNavigateTab: (tab: any) => void;
  onOpenApplication: (app: ApplicationRecord) => void;
  onTailorResume: (job: JobListing) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  jobs,
  applications,
  onSelectJob,
  onNavigateTab,
  onOpenApplication,
  onTailorResume
}) => {
  // Pre-calculate matches for curated jobs
  const jobMatches = jobs.map(job => ({
    job,
    match: calculateJobMatch(profile, job)
  })).sort((a, b) => b.match.overallScore - a.match.overallScore);

  const highMatchJobs = jobMatches.filter(jm => jm.match.overallScore >= 80);
  const dueFollowUps = detectDueFollowUps(applications, profile);

  // Application Funnel counts
  const appliedCount = applications.filter(a => a.stage === 'Applied').length;
  const interviewCount = applications.filter(a => a.stage === 'Interview' || a.stage === 'Assessment').length;
  const offerCount = applications.filter(a => a.stage === 'Offer').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Greeting & Career Target Banner */}
      <div className="glass-card" style={{
        padding: '24px 30px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.05) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Good day,</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {profile.fullName.split(' ')[0]} 👋
            </span>
            <span className="badge badge-verified" style={{ fontSize: '0.675rem' }}>
              Verified Profile
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>
            Your AI Job Search & Application Copilot
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '650px' }}>
            Currently orchestrating applications for <strong>{profile.preferences.targetRoles[0]}</strong> across Bangalore and Hybrid feeds.
            The agent continuously reasons over your verified credentials without fabricating experience.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-primary"
            onClick={() => onNavigateTab('jobs')}
          >
            <Briefcase size={16} /> Explore All Jobs
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigateTab('copilot')}
          >
            <Sparkles size={16} /> Chat with Copilot
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CAREER TARGET</span>
            <Briefcase size={18} color="#6366f1" />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{profile.preferences.targetRoles[0]}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Batch: {profile.education[0]?.graduationYear || '2026'} • 0-1 Yrs Exp
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>APPLICATIONS SENT</span>
            <Building size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{applications.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
            {appliedCount} in active review
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>INTERVIEWS</span>
            <Users size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{interviewCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            PhonePe Round 1 Active
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>OFFERS RECEIVED</span>
            <Award size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{offerCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
            Infosys Specialist Programmer
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>HIGH-MATCH JOBS</span>
            <Flame size={18} color="#ec4899" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{highMatchJobs.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            ≥ 80% Match in your target cities
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        {/* Left Column: Top Recommended Jobs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Top Recommended Opportunities</h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Deterministic match scoring against verified coursework and projects
              </p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onNavigateTab('jobs')}
            >
              View All ({jobs.length}) <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {jobMatches.slice(0, 3).map(({ job, match }) => (
              <div
                key={job.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: 'var(--primary)',
                    flexShrink: 0
                  }}>
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3
                        style={{ fontSize: '1.05rem', cursor: 'pointer', margin: 0 }}
                        onClick={() => onSelectJob(job)}
                      >
                        {job.title}
                      </h3>
                      {job.isDemoData && (
                        <span className="badge badge-demo" style={{ fontSize: '0.625rem' }}>
                          DEMO DATA
                        </span>
                      )}
                      <span className={`badge ${match.priority === 'HIGH PRIORITY' ? 'badge-high' : 'badge-good'}`}>
                        {match.priority}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <span><strong>{job.company}</strong></span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {job.location} ({job.workMode})
                      </span>
                      <span>•</span>
                      <span>{job.stipendOrSalary}</span>
                    </div>

                    {/* Skill Match Snippet */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {match.matchedSkills.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.725rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            fontWeight: 500
                          }}
                        >
                          ✓ {s}
                        </span>
                      ))}
                      {match.missingRequiredSkills.slice(0, 2).map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.725rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: '#f59e0b',
                            fontWeight: 500
                          }}
                        >
                          ⚠ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <MatchScoreGauge score={match.overallScore} size="sm" showLabel={false} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectJob(job)}
                    >
                      Analyze
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onTailorResume(job)}
                    >
                      Tailor Resume
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Actions & Follow-ups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Upcoming Actions Card (prompt section 18) */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Clock size={18} color="#6366f1" />
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Upcoming Actions</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Action 1: Due follow-up */}
              {dueFollowUps.length > 0 && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fbbf24' }}>
                      Follow up with {dueFollowUps[0].company}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Submitted 8 days ago. Follow-up reminder is due today.
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: '8px', fontSize: '0.725rem', padding: '4px 8px', color: '#fbbf24', borderColor: '#f59e0b' }}
                      onClick={() => {
                        const target = applications.find(a => a.id === dueFollowUps[0].applicationId);
                        if (target) onOpenApplication(target);
                      }}
                    >
                      View Draft Message
                    </button>
                  </div>
                </div>
              )}

              {/* Action 2: Apply to top job */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                    Apply to ABC Technologies (91% Match)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Tailor resume highlighting Java & Bookstore project.
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '8px', fontSize: '0.725rem', padding: '4px 8px' }}
                    onClick={() => onTailorResume(jobs[0])}
                  >
                    Tailor & Prepare
                  </button>
                </div>
              </div>

              {/* Action 3: Interview prep */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <Sparkles size={16} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                    Prepare for PhonePe Round 1 (Java Concurrency & DSA)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Technical interview scheduled in 2 days.
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '8px', fontSize: '0.725rem', padding: '4px 8px' }}
                    onClick={() => onNavigateTab('interview')}
                  >
                    Open Interview Prep
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Application Funnel Status */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Application Funnel</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { stage: 'Saved', count: applications.filter(a => a.stage === 'Saved').length, color: '#94a3b8' },
                { stage: 'Ready to Apply', count: applications.filter(a => a.stage === 'Ready to Apply').length, color: '#38bdf8' },
                { stage: 'Applied', count: applications.filter(a => a.stage === 'Applied').length, color: '#6366f1' },
                { stage: 'Interview', count: applications.filter(a => a.stage === 'Interview').length, color: '#f59e0b' },
                { stage: 'Offer', count: applications.filter(a => a.stage === 'Offer').length, color: '#10b981' }
              ].map(f => (
                <div key={f.stage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{f.stage}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{f.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
