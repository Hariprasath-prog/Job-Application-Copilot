import React, { useState } from 'react';
import {
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Layers,
  X,
  Send,
  HelpCircle
} from 'lucide-react';
import { JobListing, JobMatchBreakdown } from '../../types/job';
import { MatchScoreGauge } from '../common/MatchScoreGauge';

interface JobDetailModalProps {
  job: JobListing;
  match: JobMatchBreakdown;
  onClose: () => void;
  onTailorResume: (job: JobListing) => void;
  onPrepareApplication: (job: JobListing) => void;
  onSaveToKanban: (job: JobListing) => void;
  isSaved?: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  match,
  onClose,
  onTailorResume,
  onPrepareApplication,
  onSaveToKanban,
  isSaved
}) => {
  const [activeTab, setActiveTab] = useState<'match' | 'description' | 'eligibility'>('match');

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '820px' }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.4rem',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              {job.company.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{job.title}</h2>
                <span className={`badge ${match.priority === 'HIGH PRIORITY' ? 'badge-high' : 'badge-good'}`}>
                  {match.priority}
                </span>
                {job.isDemoData && (
                  <span className="badge badge-demo" style={{ fontSize: '0.65rem' }}>
                    DEMO DATA
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company}</span>
                <span>•</span>
                <span>{job.location} ({job.workMode})</span>
                <span>•</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{job.stipendOrSalary}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <MatchScoreGauge score={match.overallScore} size="md" showLabel={true} />
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Header */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-card)',
          padding: '0 28px',
          background: 'var(--bg-input)'
        }}>
          <button
            onClick={() => setActiveTab('match')}
            style={{
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'match' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'match' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            AI Match Analysis
          </button>
          <button
            onClick={() => setActiveTab('description')}
            style={{
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'description' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'description' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Job Description & Stack
          </button>
          <button
            onClick={() => setActiveTab('eligibility')}
            style={{
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'eligibility' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'eligibility' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Eligibility & Source Info
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px 28px', maxHeight: '420px', overflowY: 'auto' }}>
          {/* TAB 1: AI Match Analysis */}
          {activeTab === 'match' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Detailed Breakdown Gauges */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '10px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Skill Match</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>{match.skillMatch}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Education</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6366f1' }}>{match.educationMatch}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Experience</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>{match.experienceMatch}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Location</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{match.locationMatch}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Role Alignment</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ec4899' }}>{match.roleMatch}%</div>
                </div>
              </div>

              {/* Recommendation Box */}
              <div style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={16} color="var(--primary)" />
                  <strong style={{ fontSize: '0.9rem' }}>Agent Recommendation: {match.recommendation}</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {match.recommendationReason}
                </p>
              </div>

              {/* Why You Match */}
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Why You Are a Fit
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {match.whyYouMatch.map((point, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Skills & Weaknesses */}
              {(match.missingRequiredSkills.length > 0 || match.missingPreferredSkills.length > 0) && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} /> Missing Skills & Potential Gaps
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {match.weaknessesOrGaps.map((point, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {point}
                      </div>
                    ))}
                    {match.potentialConcerns.map((point, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: '#ef4444' }}>
                        ⚠ {point}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Description */}
          {activeTab === 'description' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>About the Role</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {job.description}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Required Technical Skills</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {job.requiredSkills.map(s => (
                    <span key={s} className="badge badge-good" style={{ fontSize: '0.75rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {job.preferredSkills.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Preferred Skills (Bonus)</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {job.preferredSkills.map(s => (
                      <span key={s} className="badge" style={{ fontSize: '0.75rem', background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Eligibility & Source */}
          {activeTab === 'eligibility' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Education Eligibility:</span>
                <div>{job.educationRequirement}</div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Experience Requirement:</span>
                <div>{job.experienceRequired}</div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Original Source:</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{job.source}</strong> (Posted: {job.postedDate} • Deadline: {job.deadline || 'Rolling'})
                  </div>
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Open Official Link <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid var(--border-card)',
          background: 'var(--bg-input)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onSaveToKanban(job)}
          >
            {isSaved ? '✓ Saved to Tracker' : '+ Save to Kanban'}
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onTailorResume(job)}
            >
              <FileText size={15} /> Tailor Resume
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onPrepareApplication(job)}
            >
              <Send size={15} /> Prepare Application Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
