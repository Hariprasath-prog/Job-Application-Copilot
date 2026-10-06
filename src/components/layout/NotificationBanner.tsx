import React from 'react';
import { AlertCircle, Clock, ArrowRight, X } from 'lucide-react';
import { ApplicationRecord } from '../../types/application';

interface NotificationBannerProps {
  dueApplications: ApplicationRecord[];
  onOpenApplication: (app: ApplicationRecord) => void;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  dueApplications,
  onOpenApplication,
  onDismiss
}) => {
  if (dueApplications.length === 0) return null;

  const targetApp = dueApplications[0];

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
      borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
      padding: '10px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      fontSize: '0.85rem',
      color: '#fbbf24'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Clock size={16} style={{ color: '#f59e0b' }} />
        <span>
          <strong>Follow-up Action Required:</strong> You applied to <strong>{targetApp.job.company}</strong> ({targetApp.job.title}) 8 days ago. Your scheduled follow-up is due today.
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ background: '#f59e0b', color: '#000000', fontWeight: 700 }}
          onClick={() => onOpenApplication(targetApp)}
        >
          View Follow-up Draft <ArrowRight size={14} />
        </button>
        <button
          onClick={onDismiss}
          style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer' }}
          title="Dismiss notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
