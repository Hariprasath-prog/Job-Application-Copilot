import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  ShieldCheck,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../../types/profile';
import { JobListing } from '../../types/job';
import { analyzeResumeForJob, tailorResumeForJob } from '../../services/resumeTailor';

interface ResumeStudioViewProps {
  profile: UserProfile;
  jobs: JobListing[];
  targetJob?: JobListing;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ResumeStudioView: React.FC<ResumeStudioViewProps> = ({
  profile,
  jobs,
  targetJob,
  onUpdateProfile
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(targetJob ? targetJob.id : jobs[0]?.id || '');
  const [copied, setCopied] = useState<boolean>(false);

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const atsAnalysis = currentJob ? analyzeResumeForJob(profile, currentJob) : null;
  const tailoredResult = currentJob ? tailorResumeForJob(profile, currentJob) : null;

  const handleCopyMarkdown = () => {
    if (tailoredResult) {
      navigator.clipboard.writeText(tailoredResult.markdownPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-good" style={{ fontSize: '0.7rem' }}>
                Resume Intelligence Engine
              </span>
              <span className="badge badge-verified" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Anti-Hallucination Policy Active
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Resume Studio & Truthful Tailoring</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '6px' }}>
              Analyze estimated ATS compatibility against real job postings and tailor your verified experiences without inventing false claims.
            </p>
          </div>

          {/* Job Target Selector */}
          <div style={{ minWidth: '280px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Tailor Resume Against Job:
            </label>
            <select
              className="select-field"
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {atsAnalysis && currentJob && (
        <>
          {/* Estimated ATS Compatibility Breakdown (Prompt section 10) */}
          <div className="glass-card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Estimated ATS Compatibility Diagnostics</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Targeted analysis for <strong>{currentJob.company}</strong> ({currentJob.title})
                </p>
              </div>

              <div style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>ESTIMATED ATS SCORE</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {atsAnalysis.estimatedAtsScore} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* Score Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Keyword Match</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                  {atsAnalysis.keywordMatchScore} / 100
                </div>
                <div className="progress-bar-bg" style={{ marginTop: '8px' }}>
                  <div className="progress-bar-fill" style={{ width: `${atsAnalysis.keywordMatchScore}%`, background: '#10b981' }} />
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Measurable Impact</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                  {atsAnalysis.impactScore} / 100
                </div>
                <div className="progress-bar-bg" style={{ marginTop: '8px' }}>
                  <div className="progress-bar-fill" style={{ width: `${atsAnalysis.impactScore}%`, background: '#38bdf8' }} />
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Readability & Layout</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8', marginTop: '2px' }}>
                  {atsAnalysis.readabilityScore} / 100
                </div>
                <div className="progress-bar-bg" style={{ marginTop: '8px' }}>
                  <div className="progress-bar-fill" style={{ width: `${atsAnalysis.readabilityScore}%`, background: '#818cf8' }} />
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Job Relevance</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>
                  {atsAnalysis.jobRelevanceScore} / 100
                </div>
                <div className="progress-bar-bg" style={{ marginTop: '8px' }}>
                  <div className="progress-bar-fill" style={{ width: `${atsAnalysis.jobRelevanceScore}%`, background: '#f59e0b' }} />
                </div>
              </div>
            </div>

            {/* Disclaimer per Section 10 */}
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-card)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>ℹ️</span>
              <span><strong>Notice:</strong> {atsAnalysis.disclaimer}</span>
            </div>
          </div>

          {/* Truth-Preserving Tailoring Section (Prompt section 11) */}
          {tailoredResult && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              {/* Left Column: Tailoring Changes & Safeguards */}
              <div className="glass-card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Tailored Adaptations</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Optimized for {currentJob.company} requirements
                    </p>
                  </div>
                  <span className="badge badge-high" style={{ fontSize: '0.675rem' }}>
                    Truthfulness &gt; Keyword Stuffing
                  </span>
                </div>

                {/* Highlighted Verified Skills */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Emphasized Verified Skills:
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {tailoredResult.highlightedSkills.map(s => (
                      <span key={s} className="badge badge-good" style={{ fontSize: '0.75rem' }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Anti-Hallucination Guard Audit */}
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}>
                    <ShieldCheck size={16} />
                    <span>Anti-Hallucination Guard: Missing Skills Audit</span>
                  </div>

                  {tailoredResult.truthfulnessAudit.skillsNotFabricated.length > 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {tailoredResult.truthfulnessAudit.adviceForMissingSkills.map((advice, i) => (
                        <div key={i}>• {advice}</div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#10b981' }}>
                      ✓ All required skills for this posting are grounded in your verified profile!
                    </div>
                  )}
                </div>

                {/* Prioritized Project */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Prioritized Project on Tailored Resume:
                  </label>
                  <div style={{
                    background: 'var(--bg-input)',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-card)'
                  }}>
                    <strong style={{ fontSize: '0.875rem' }}>{tailoredResult.prioritizedProjects[0]?.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Stack: {tailoredResult.prioritizedProjects[0]?.technologies.join(', ')}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                      {tailoredResult.prioritizedProjects[0]?.bullets[0]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Tailored Resume Document Preview */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Generated Resume Draft</h3>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleCopyMarkdown}
                  >
                    <Copy size={13} /> {copied ? 'Copied!' : 'Copy Markdown'}
                  </button>
                </div>

                <div style={{
                  background: 'var(--bg-input)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.775rem',
                  lineHeight: 1.6,
                  maxHeight: '440px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-primary)'
                }}>
                  {tailoredResult.markdownPreview}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
