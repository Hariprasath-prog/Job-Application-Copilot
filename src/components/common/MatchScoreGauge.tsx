import React from 'react';

interface MatchScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MatchScoreGauge: React.FC<MatchScoreGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true
}) => {
  // Color calculation based on score
  let strokeColor = '#10b981'; // green for high
  if (score < 50) strokeColor = '#ef4444'; // red
  else if (score < 75) strokeColor = '#f59e0b'; // amber
  else if (score < 85) strokeColor = '#6366f1'; // indigo

  const radius = size === 'sm' ? 18 : size === 'md' ? 26 : 38;
  const strokeWidth = size === 'sm' ? 3.5 : size === 'md' ? 5 : 7;
  const dimension = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: dimension, height: dimension }}>
        <svg width={dimension} height={dimension} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="var(--border-card)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size === 'sm' ? '0.75rem' : size === 'md' ? '0.9rem' : '1.25rem',
            fontWeight: 700,
            color: strokeColor,
            fontFamily: 'var(--font-heading)'
          }}
        >
          {score}%
        </div>
      </div>
      {showLabel && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Match Score
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: strokeColor }}>
            {score >= 85 ? 'Strong Fit' : score >= 70 ? 'Good Fit' : score >= 50 ? 'Moderate' : 'Low Fit'}
          </span>
        </div>
      )}
    </div>
  );
};
