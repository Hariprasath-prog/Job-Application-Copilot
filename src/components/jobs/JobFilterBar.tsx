import React, { useState } from 'react';
import { Search, Filter, Sparkles, X, SlidersHorizontal } from 'lucide-react';
import { SearchQueryFilters } from '../../services/jobConnectors';

interface JobFilterBarProps {
  onSearch: (query: string, filters: SearchQueryFilters) => void;
  totalResults: number;
}

export const JobFilterBar: React.FC<JobFilterBarProps> = ({ onSearch, totalResults }) => {
  const [naturalQuery, setNaturalQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [includeDemo, setIncludeDemo] = useState(true);

  const handleApply = (newQuery?: string) => {
    const q = newQuery !== undefined ? newQuery : naturalQuery;
    onSearch(q, {
      role: selectedRole !== 'All' ? selectedRole : undefined,
      location: selectedLocation !== 'All' ? selectedLocation : undefined,
      employmentType: selectedType !== 'All' ? selectedType as any : undefined,
      workMode: selectedMode !== 'All' ? selectedMode as any : undefined,
      includeDemoData: includeDemo
    });
  };

  const handleQuickPrompt = (prompt: string) => {
    setNaturalQuery(prompt);
    handleApply(prompt);
  };

  return (
    <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Natural Language Prompt Search Bar */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            className="input-field"
            style={{ paddingLeft: '42px', fontSize: '0.925rem' }}
            placeholder='Ask agent: "Find software engineering internships in Bangalore" or "Java jobs for freshers"...'
            value={naturalQuery}
            onChange={e => setNaturalQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
          />
          {naturalQuery && (
            <button
              onClick={() => {
                setNaturalQuery('');
                handleApply('');
              }}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          className="btn btn-primary"
          onClick={() => handleApply()}
          style={{ padding: '10px 22px' }}
        >
          <Sparkles size={16} /> Search with Agent
        </button>
      </div>

      {/* Quick Prompts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Try queries:</span>
        {[
          'Software engineering internships in Bangalore',
          'Java developer jobs for freshers',
          'Internships requiring Java, Git or DSA',
          'Remote developer opportunities'
        ].map((prompt, i) => (
          <button
            key={i}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.725rem', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
            onClick={() => handleQuickPrompt(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Structured Filter Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-card)',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Role
          </label>
          <select
            className="select-field"
            value={selectedRole}
            onChange={e => {
              setSelectedRole(e.target.value);
              setTimeout(() => handleApply(), 50);
            }}
          >
            <option value="All">All Roles</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Graduate Engineer Trainee">Graduate Engineer</option>
            <option value="Frontend">Frontend Developer</option>
            <option value="Backend">Backend Developer</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Location
          </label>
          <select
            className="select-field"
            value={selectedLocation}
            onChange={e => {
              setSelectedLocation(e.target.value);
              setTimeout(() => handleApply(), 50);
            }}
          >
            <option value="All">All Locations</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Employment Type
          </label>
          <select
            className="select-field"
            value={selectedType}
            onChange={e => {
              setSelectedType(e.target.value);
              setTimeout(() => handleApply(), 50);
            }}
          >
            <option value="All">All Types</option>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Work Mode
          </label>
          <select
            className="select-field"
            value={selectedMode}
            onChange={e => {
              setSelectedMode(e.target.value);
              setTimeout(() => handleApply(), 50);
            }}
          >
            <option value="All">All Modes</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        {/* Demo Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={e => {
                setIncludeDemo(e.target.checked);
                setTimeout(() => handleApply(), 50);
              }}
            />
            <span>Include DEMO DATA</span>
          </label>
        </div>
      </div>
    </div>
  );
};
