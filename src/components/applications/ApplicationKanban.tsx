import React, { useState } from 'react';
import {
  KanbanSquare,
  Building,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  MessageSquare
} from 'lucide-react';
import { ApplicationRecord, ApplicationStage } from '../../types/application';

interface ApplicationKanbanProps {
  applications: ApplicationRecord[];
  onUpdateStage: (appId: string, newStage: ApplicationStage) => void;
  onOpenApplication: (app: ApplicationRecord) => void;
  onOpenFollowUp: (app: ApplicationRecord) => void;
}

const STAGES: { id: ApplicationStage; label: string; color: string }[] = [
  { id: 'Saved', label: 'Saved', color: '#94a3b8' },
  { id: 'Ready to Apply', label: 'Ready to Apply', color: '#38bdf8' },
  { id: 'Applied', label: 'Applied', color: '#6366f1' },
  { id: 'Assessment', label: 'Assessment', color: '#8b5cf6' },
  { id: 'Interview', label: 'Interview', color: '#f59e0b' },
  { id: 'Offer', label: 'Offer', color: '#10b981' },
  { id: 'Rejected', label: 'Archived', color: '#ef4444' }
];

export const ApplicationKanban: React.FC<ApplicationKanbanProps> = ({
  applications,
  onUpdateStage,
  onOpenApplication,
  onOpenFollowUp
}) => {
  const getNextStage = (current: ApplicationStage): ApplicationStage | null => {
    const idx = STAGES.findIndex(s => s.id === current);
    if (idx >= 0 && idx < STAGES.length - 1) return STAGES[idx + 1].id;
    return null;
  };

  const getPrevStage = (current: ApplicationStage): ApplicationStage | null => {
    const idx = STAGES.findIndex(s => s.id === current);
    if (idx > 0) return STAGES[idx - 1].id;
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Kanban Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem' }}>Application Pipeline</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track application stages from discovery through interviews and offers.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>Total Tracked: <strong>{applications.length}</strong></span>
        </div>
      </div>

      {/* Kanban Horizontal Scroll Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(260px, 1fr))',
        gap: '14px',
        overflowX: 'auto',
        paddingBottom: '16px'
      }}>
        {STAGES.map(col => {
          const columnApps = applications.filter(a => a.stage === col.id);

          return (
            <div
              key={col.id}
              style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '560px'
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-card)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{col.label}</span>
                </div>
                <span style={{
                  fontSize: '0.725rem',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-input)',
                  fontWeight: 700
                }}>
                  {columnApps.length}
                </span>
              </div>

              {/* Application Cards List */}
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {columnApps.map(app => {
                  const next = getNextStage(app.stage);
                  const prev = getPrevStage(app.stage);
                  const isFollowUpDue = app.followUpStatus === 'Due Today';

                  return (
                    <div
                      key={app.id}
                      className="glass-card"
                      style={{
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        borderLeft: isFollowUpDue ? '3px solid #f59e0b' : '1px solid var(--border-card)'
                      }}
                    >
                      {/* Card Title & Match */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <h4
                            style={{ fontSize: '0.9rem', cursor: 'pointer', margin: 0 }}
                            onClick={() => onOpenApplication(app)}
                          >
                            {app.job.title}
                          </h4>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {app.job.company}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          color: '#10b981',
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {app.matchScore}%
                        </span>
                      </div>

                      {/* Follow-up / Interview Pill */}
                      {isFollowUpDue && (
                        <div
                          onClick={() => onOpenFollowUp(app)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            fontSize: '0.725rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          <Clock size={12} /> Follow-up Due Today
                        </div>
                      )}

                      {app.interviewDate && (
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
                          fontSize: '0.725rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <Calendar size={12} /> Interview: {app.interviewDate}
                        </div>
                      )}

                      {/* Notes snippet */}
                      {app.notes && (
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          "{app.notes}"
                        </div>
                      )}

                      {/* Quick stage transition arrows */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '6px',
                        borderTop: '1px solid var(--border-card)',
                        marginTop: '2px'
                      }}>
                        {prev ? (
                          <button
                            onClick={() => onUpdateStage(app.id, prev)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                            title={`Move back to ${prev}`}
                          >
                            <ChevronLeft size={13} />
                          </button>
                        ) : <div />}

                        <button
                          onClick={() => onOpenApplication(app)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                        >
                          Details
                        </button>

                        {next ? (
                          <button
                            onClick={() => onUpdateStage(app.id, next)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                            title={`Advance to ${next}`}
                          >
                            <ChevronRight size={13} />
                          </button>
                        ) : <div />}
                      </div>
                    </div>
                  );
                })}

                {columnApps.length === 0 && (
                  <div style={{
                    padding: '30px 10px',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
