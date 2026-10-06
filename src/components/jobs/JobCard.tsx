import React from 'react';
import { MapPin, Building, Sparkles, Check, AlertTriangle, ArrowRight, Layers } from 'lucide-react';
import { JobListing, JobMatchBreakdown } from '../../types/job';
import { MatchScoreGauge } from '../common/MatchScoreGauge';

interface JobCardProps {
  job: JobListing;
  match: JobMatchBreakdown;
  onViewJob: (job: JobListing) => void;
  onAnalyze: (job: JobListing) => void;
  onTailorResume: (job: JobListing) => void;
  onApply: (job: JobListing) => void;
  isSaved?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  match,
  onViewJob,
  onAnalyze,
  onTailorResume,
  onApply,
  isSaved
}) => {
  const getPriorityBadgeClass = () => {
    switch (match.priority) {
      case 'HIGH PRIORITY': return 'badge-high';
      case 'GOOD MATCH': return 'badge-good';
      case 'STRETCH': return 'badge-stretch';
      case 'LOW MATCH': return 'badge-low';
      default: return 'badge-good';
    }
  };

  return (
    <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
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
                style={{ fontSize: '1.1rem', cursor: 'pointer', margin: 0 }}
                onClick={() => onViewJob(job)}
              >
                {job.title}
              </h3>
              <span className={`badge ${getPriorityBadgeClass()}`}>
                {match.priority}
              </span>
              {job.isDemoData && (
                <span className="badge badge-demo" style={{ fontSize: '0.625rem' }}>
                  DEMO DATA
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <MapPin size={13} /> {job.location} ({job.workMode})
              </span>
              <span>•</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{job.stipendOrSalary}</span>
            </div>
          </div>
        </div>

        {/* Match Gauge */}
        <MatchScoreGauge score={match.overallScore} size="sm" showLabel={true} />
      </div>

      {/* Description Snippet */}
      <p style={{
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {job.description}
      </p>

      {/* Skill Match Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Skills:</span>
        {match.matchedSkills.slice(0, 3).map((skill, i) => (
          <span
            key={i}
            style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Check size={11} /> {skill}
          </span>
        ))}
        {match.missingRequiredSkills.slice(0, 2).map((skill, i) => (
          <span
            key={i}
            style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <AlertTriangle size={11} /> {skill}
          </span>
        ))}
      </div>

      {/* Duplicate / Canonical Indicator */}
      {job.duplicateSources && job.duplicateSources.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.725rem',
          color: 'var(--text-muted)',
          paddingTop: '6px',
          borderTop: '1px solid var(--border-card)'
        }}>
          <Layers size={13} color="var(--primary)" />
          <span>
            <strong>Canonical Listing:</strong> Merged duplicate entries found on {job.duplicateSources.join(' and ')}.
          </span>
        </div>
      )}

      {/* Action Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-card)'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Source: <strong style={{ color: 'var(--text-secondary)' }}>{job.source}</strong>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onViewJob(job)}
          >
            View Details
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAnalyze(job)}
          >
            Analyze Match
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onTailorResume(job)}
          >
            Tailor Resume
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onApply(job)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
