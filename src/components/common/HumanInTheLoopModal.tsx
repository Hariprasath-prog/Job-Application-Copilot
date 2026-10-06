import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, FileText, Send, Eye } from 'lucide-react';
import { HumanInTheLoopRequest } from '../../types/agent';

interface HumanInTheLoopModalProps {
  request: HumanInTheLoopRequest;
  onApprove: (request: HumanInTheLoopRequest) => void;
  onReject: (request: HumanInTheLoopRequest) => void;
  onClose: () => void;
}

export const HumanInTheLoopModal: React.FC<HumanInTheLoopModalProps> = ({
  request,
  onApprove,
  onReject,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'coverLetter' | 'answers'>('overview');

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '740px', border: '1px solid #6366f1' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-card)',
          background: 'rgba(99, 102, 241, 0.08)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <div style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8'
          }}>
            <ShieldAlert size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-stretch" style={{ fontSize: '0.7rem' }}>
                Human-in-the-Loop Required
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Action Gate #AG-204
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{request.title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {request.summary}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-card)',
          padding: '0 24px',
          background: 'var(--bg-input)'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Submission Summary
          </button>
          <button
            onClick={() => setActiveTab('coverLetter')}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'coverLetter' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'coverLetter' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Generated Cover Letter
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'answers' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'answers' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Application Q&A Answers
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'var(--bg-input)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                fontSize: '0.875rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Target Company:</span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{request.details.company}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Role Applied:</span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{request.details.role}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Compensation / Stipend:</span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{request.details.stipend || 'Competitive'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Destination Portal:</span>
                  <div style={{ fontWeight: 600, marginTop: '2px', color: 'var(--primary)', wordBreak: 'break-all' }}>
                    {request.details.portalUrl}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '10px',
                fontSize: '0.85rem',
                color: '#fde68a'
              }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#f59e0b' }} />
                <div>
                  <strong>Trust & Safety Safeguard:</strong>
                  <div>
                    The agent has generated this application using only your verified profile credentials and projects.
                    Submitting this will transition the tracker status to <strong>"Applied"</strong> and automatically schedule a 7-day follow-up reminder.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coverLetter' && (
            <div style={{
              background: 'var(--bg-input)',
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              whiteSpace: 'pre-line',
              lineHeight: 1.6,
              maxHeight: '340px',
              overflowY: 'auto',
              fontFamily: 'var(--font-sans)',
              border: '1px solid var(--border-card)'
            }}>
              {request.details.coverLetter || 'No cover letter attached.'}
            </div>
          )}

          {activeTab === 'answers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '340px', overflowY: 'auto' }}>
              {request.details.answers?.map((item: any, i: number) => (
                <div key={i} style={{
                  background: 'var(--bg-input)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '6px' }}>
                    Q: {item.question}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.5 }}>
                    {item.answer}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <strong>Truth verification:</strong> {item.verifiedBasis}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-card)',
          background: 'var(--bg-input)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onReject(request)}
          >
            <XCircle size={15} /> Cancel Action
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Close Preview
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onApprove(request)}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <CheckCircle2 size={16} /> Approve & Record as Applied
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
