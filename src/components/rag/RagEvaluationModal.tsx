import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  BarChart2,
  RefreshCw,
  Award,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { RagEvaluationService, EvaluationSuiteResult } from '../../services/rag/ragEvaluation';

interface RagEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RagEvaluationModal: React.FC<RagEvaluationModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluationSuiteResult | null>(null);

  if (!isOpen) return null;

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    try {
      const res = await RagEvaluationService.runFullEvaluation();
      setResult(res);
    } catch (err) {
      console.error('Failed to run RAG evaluation:', err);
    } finally {
      setIsRunning(false);
    }
  };

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
        maxWidth: '960px',
        maxHeight: '92vh',
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
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Award size={20} color="#10b981" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                RAG Architecture Benchmark & Hallucination Testing
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Quantified evaluation of Recall@K, Precision@K, MRR, Groundedness, and Hallucination Resistance
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

        {/* Content Area */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action Trigger Banner */}
          <div style={{
            padding: '18px 22px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Execute Automated Acceptance Test Suite
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Runs 8 comprehensive test cases across verified candidate documents, official JDs, and negative hallucination triggers.
              </div>
            </div>

            <button
              onClick={handleRunEvaluation}
              disabled={isRunning}
              className="btn btn-primary"
              style={{ padding: '10px 20px', gap: '8px' }}
            >
              {isRunning ? (
                <>
                  <RefreshCw size={16} className="spin-slow" /> Running Benchmark...
                </>
              ) : (
                <>
                  <Play size={16} /> Run RAG Benchmark
                </>
              )}
            </button>
          </div>

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Summary Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '14px'
              }}>
                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ fontSize: '0.725rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase' }}>
                    Overall Benchmark Score
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
                    {result.overallScore}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {result.passedCount} of {result.totalTests} tests passed
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Retrieval Accuracy
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '6px' }}>
                    {result.retrievalAccuracy}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Recall@K & MRR weighted
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                  <div style={{ fontSize: '0.725rem', color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Hallucination Prevention
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
                    {result.hallucinationPreventionRate}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Rejection of unverified claims
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ fontSize: '0.725rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase' }}>
                    Factual Groundedness
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
                    {result.groundednessRate}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Strict evidence alignment
                  </div>
                </div>
              </div>

              {/* Test Cases Table */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Granular Test Suite Results
                </h4>

                <div style={{
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 14px' }}>Query & Objective</th>
                        <th style={{ padding: '10px 14px' }}>Expected Docs</th>
                        <th style={{ padding: '10px 14px' }}>Recall@K</th>
                        <th style={{ padding: '10px 14px' }}>MRR</th>
                        <th style={{ padding: '10px 14px' }}>Groundedness</th>
                        <th style={{ padding: '10px 14px' }}>Anti-Hallucination</th>
                        <th style={{ padding: '10px 14px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.metrics.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-card)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '12px 14px', maxWidth: '300px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>"{m.query}"</div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.notes}</div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--bg-card-hover)', borderRadius: '4px' }}>
                              {m.expectedDocumentIds.join(', ')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>{m.recallAtK}%</td>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>{m.mrr}</td>
                          <td style={{ padding: '12px 14px', color: '#10b981', fontWeight: 600 }}>{m.groundednessScore}%</td>
                          <td style={{ padding: '12px 14px' }}>
                            {m.isHallucinationPrevented ? (
                              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={14} /> Prevented
                              </span>
                            ) : (
                              <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldAlert size={14} /> Failed
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {m.verdict === 'PASS' ? (
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                fontWeight: 700,
                                fontSize: '0.725rem',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                              }}>
                                PASS
                              </span>
                            ) : (
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#ef4444',
                                fontWeight: 700,
                                fontSize: '0.725rem',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                              }}>
                                FAIL
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!result && !isRunning && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <BarChart2 size={36} color="var(--primary)" />
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                No evaluation run yet
              </div>
              <p style={{ maxWidth: '440px', margin: 0, fontSize: '0.8rem' }}>
                Click "Run RAG Benchmark" above to test retrieval precision, recall, citation accuracy, and anti-hallucination guardrails across all test cases.
              </p>
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
            Criteria: Groundedness ≥ 90% • Recall@K ≥ 50% • Zero Unsupported Hallucinations
          </span>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
};
