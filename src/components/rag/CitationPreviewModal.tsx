import React from 'react';
import { X, FileText, ShieldCheck, CheckCircle2, Bookmark, Layers } from 'lucide-react';
import { Citation } from '../../types/rag';

interface CitationPreviewModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationPreviewModal: React.FC<CitationPreviewModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  const trustColor = citation.trustTier === 'Highest' ? '#10b981' : citation.trustTier === 'Medium' ? '#6366f1' : '#f59e0b';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '560px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-sidebar)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="var(--primary)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Verified Document Source
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                RAG Grounded Citation Evidence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            background: 'var(--bg-card-hover)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-card)'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Source Document
              </span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', wordBreak: 'break-all' }}>
                {citation.source}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Section & Location
              </span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {citation.section} {citation.page ? `(Page ${citation.page})` : ''}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Trust Authority Tier
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: trustColor }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: trustColor }}>
                  {citation.trustTier} Authority
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Verification Protocol
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                <ShieldCheck size={14} />
                <span>Cryptographically Hashed</span>
              </div>
            </div>
          </div>

          {/* Snippet Quote */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Bookmark size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Exact Evidence Passage
              </span>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              fontStyle: 'italic',
              fontFamily: 'monospace'
            }}>
              "{citation.quoteSnippet}"
            </div>
          </div>

          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>This evidence chunk was retrieved via Hybrid Search and ranked for factual answer grounding.</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-sidebar)'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            Close Evidence
          </button>
        </div>
      </div>
    </div>
  );
};
