import React, { useState } from 'react';
import { BrainCircuit, BookOpen, CheckCircle2, ChevronRight, Terminal, HelpCircle, Building } from 'lucide-react';
import { UserProfile } from '../../types/profile';
import { JobListing } from '../../types/job';
import { generateInterviewPrep } from '../../services/interviewPrepService';

interface InterviewPrepViewProps {
  profile: UserProfile;
  jobs: JobListing[];
}

export const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({ profile, jobs }) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[1]?.id || jobs[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'technical' | 'dsa' | 'behavioral' | 'projects'>('technical');

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const prepGuide = currentJob ? generateInterviewPrep(profile, currentJob) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-stretch" style={{ fontSize: '0.7rem' }}>
              Interview Preparation Agent
            </span>
            <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
              Job-Specific Question Bank
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Interview Preparation Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Structured technical drills, high-frequency DSA patterns, and behavioral STAR talking points.
          </p>
        </div>

        {/* Target Job Selector */}
        <div style={{ minWidth: '280px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Prepare for Interview at:
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

      {prepGuide && (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Sub Navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-card)',
            background: 'var(--bg-input)',
            padding: '0 20px',
            overflowX: 'auto'
          }}>
            {[
              { id: 'technical', label: 'Technical Concepts & Q&A', icon: <Terminal size={15} /> },
              { id: 'dsa', label: 'DSA Focus Areas & Patterns', icon: <BrainCircuit size={15} /> },
              { id: 'behavioral', label: 'Behavioral & STAR Questions', icon: <HelpCircle size={15} /> },
              { id: 'projects', label: 'Project Defense Deep Dives', icon: <BookOpen size={15} /> }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 18px',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ color: isActive ? 'var(--primary)' : 'inherit' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ padding: '28px' }}>
            {/* TAB 1: Technical Concepts */}
            {activeTab === 'technical' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {prepGuide.technicalTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-input)',
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-card)'
                    }}
                  >
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '8px' }}>
                      {topic.domain}
                    </h3>

                    <div style={{ marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Key Theoretical Mechanics:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {topic.keyConcepts.map((c, i) => (
                          <span key={i} className="badge" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.725rem' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        Frequently Asked Interview Questions:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {topic.sampleQuestions.map((q, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--bg-card)',
                              fontSize: '0.85rem',
                              border: '1px solid var(--border-card)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <ChevronRight size={14} color="var(--primary)" />
                            <span>{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: DSA Focus */}
            {activeTab === 'dsa' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                {prepGuide.dsaFocusAreas.map((dsa, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-input)',
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '1rem', margin: 0 }}>{dsa.topic}</h4>
                      <span className={dsa.importance === 'Critical' ? 'badge badge-stretch' : 'badge badge-good'} style={{ fontSize: '0.675rem' }}>
                        {dsa.importance} Priority
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Key Algorithmic Patterns:
                      </span>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {dsa.patterns.map((p, pIdx) => (
                          <span key={pIdx} style={{ fontSize: '0.725rem', padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)' }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-card)',
                      fontSize: '0.78rem',
                      color: '#10b981'
                    }}>
                      <strong>Sample LeetCode Problems:</strong> {dsa.sampleProblem}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Behavioral STAR Framework */}
            {activeTab === 'behavioral' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {prepGuide.behavioralQuestions.map((bq, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-input)',
                      padding: '18px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                        Q: {bq.question}
                      </strong>
                      <span className="badge badge-good" style={{ fontSize: '0.7rem' }}>
                        Framework: {bq.framework}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      <strong>Suggested Angle:</strong> {bq.suggestedTalkingPoint}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: Project Deep Dives */}
            {activeTab === 'projects' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {prepGuide.projectDeepDives.map((pd, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-input)',
                      padding: '18px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-card)'
                    }}
                  >
                    <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '10px' }}>
                      Project: {pd.projectTitle}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pd.likelyQuestions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          style={{
                            padding: '10px 14px',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.825rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span style={{ color: '#f59e0b', fontWeight: 700 }}>•</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
