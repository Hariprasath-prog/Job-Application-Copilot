import React, { useState } from 'react';
import {
  X,
  Cpu,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Code,
  Shield,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';
import { RagDebugTrace } from '../../types/rag';

interface RagDebugModalProps {
  trace: RagDebugTrace | null;
  onClose: () => void;
}

export const RagDebugModal: React.FC<RagDebugModalProps> = ({ trace, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'retrieval' | 'context' | 'metrics'>('pipeline');

  if (!trace) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '920px',
        maxHeight: '90vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <Cpu size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  RAG Architecture Developer Inspector
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 600
                }}>
                  Trace: {trace.id.slice(0, 14)}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Observability audit of Hybrid Retrieval, Reranking, Grounding & Citations
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
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-card)',
          background: 'var(--bg-card)',
          padding: '0 16px'
        }}>
          {[
            { id: 'pipeline', label: '1. Pipeline Overview', icon: <Activity size={15} /> },
            { id: 'retrieval', label: '2. Hybrid Retrieval & Reranker', icon: <Search size={15} /> },
            { id: 'context', label: '3. Grounded Context Preview', icon: <Code size={15} /> },
            { id: 'metrics', label: '4. Latency & Security Audit', icon: <Clock size={15} /> }
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
                  padding: '12px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'pipeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Flow Steps */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px'
              }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>1. Intent Detected</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>{trace.intent}</div>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>2. Vector + BM25 Chunks</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                    {trace.vectorResultsCount} Vector | {trace.keywordResultsCount} BM25
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>3. Top Reranked</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
                    {trace.topChunks.length} Chunks Retained
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>4. Total Latency</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {trace.latencyMs.total} ms
                  </div>
                </div>
              </div>

              {/* Query Expansion Box */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Original User Query:
                  </span>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                    "{trace.query}"
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <ArrowRight size={14} />
                  <span style={{ fontSize: '0.725rem', textTransform: 'uppercase' }}>Multi-Faceted Rewritten Query:</span>
                </div>

                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--primary)',
                  background: 'rgba(99, 102, 241, 0.08)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                  {trace.rewrittenQuery}
                </div>
              </div>

              {/* Citations Generated */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Verified Citations Bound to Output: ({trace.citations.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {trace.citations.map(c => (
                    <div key={c.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      fontSize: '0.75rem',
                      color: 'var(--text-primary)'
                    }}>
                      <CheckCircle2 size={12} color="#10b981" />
                      <strong>{c.source}</strong> — <span>{c.section}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'retrieval' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Candidates merged via Reciprocal Rank Fusion (RRF) and scored by the multi-factor Reranker:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {trace.topChunks.map((item, idx) => (
                  <div key={item.chunk.id} style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--primary)',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          #{idx + 1}
                        </span>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {item.chunk.source}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          • {item.chunk.section}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem' }}>
                        <span>Vector: <strong>{(item.vectorScore * 100).toFixed(0)}%</strong></span>
                        <span>BM25: <strong>{(item.keywordScore * 100).toFixed(0)}%</strong></span>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                          Rerank: {(item.rerankScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '0.775rem',
                      color: 'var(--text-secondary)',
                      background: 'rgba(0,0,0,0.2)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      lineHeight: 1.5,
                      fontFamily: 'monospace'
                    }}>
                      {item.chunk.content.slice(0, 220)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'context' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Characters Formatted: {trace.groundedContextLength} chars
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Provider: {trace.embeddingProvider}
                </span>
              </div>
              <pre style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-primary)',
                fontSize: '0.775rem',
                lineHeight: 1.5,
                maxHeight: '400px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace'
              }}>
                {trace.rawResponse}
              </pre>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Latency Breakdown */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px'
              }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Query Analysis</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {trace.latencyMs.analysis} ms
                  </div>
                </div>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hybrid Retrieval</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {trace.latencyMs.retrieval} ms
                  </div>
                </div>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reranking Stage</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {trace.latencyMs.rerank} ms
                  </div>
                </div>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Grounded Generation</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {trace.latencyMs.generation} ms
                  </div>
                </div>
              </div>

              {/* Access Control & Security Details */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
                  <Shield size={16} />
                  <span>Security & Isolation Enforcement</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  • Active Authenticated User ID: <code>{trace.activeUserId}</code><br />
                  • Cross-user Document Isolation: <strong>ENFORCED AT VECTOR DATABASE LAYER</strong><br />
                  • Public vs Private Document Permission Gate: <strong>ACTIVE</strong><br />
                  • Target Scoped Opportunity: <code>{trace.filtersApplied.jobId || 'GLOBAL'}</code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-sidebar)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Vector Store: In-Memory / LocalStorage • Cosine Distance
          </span>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
