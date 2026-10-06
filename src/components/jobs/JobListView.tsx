import React, { useState } from 'react';
import { JobListing } from '../../types/job';
import { UserProfile } from '../../types/profile';
import { JobCard } from './JobCard';
import { JobFilterBar } from './JobFilterBar';
import { JobDetailModal } from './JobDetailModal';
import { calculateJobMatch } from '../../services/matchEngine';
import { searchJobs, SearchQueryFilters } from '../../services/jobConnectors';

interface JobListViewProps {
  profile: UserProfile;
  jobs: JobListing[];
  onTailorResume: (job: JobListing) => void;
  onApplyJob: (job: JobListing) => void;
  onSaveToKanban: (job: JobListing) => void;
  savedJobIds: string[];
}

export const JobListView: React.FC<JobListViewProps> = ({
  profile,
  jobs,
  onTailorResume,
  onApplyJob,
  onSaveToKanban,
  savedJobIds
}) => {
  const [activeFilters, setActiveFilters] = useState<SearchQueryFilters>({ includeDemoData: true });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDetailJob, setSelectedDetailJob] = useState<JobListing | null>(null);

  // Perform search & deduplication
  const searchResult = searchJobs(jobs, searchQuery, activeFilters);

  const handleSearch = (query: string, filters: SearchQueryFilters) => {
    setSearchQuery(query);
    setActiveFilters(filters);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Search & Filter Header */}
      <JobFilterBar onSearch={handleSearch} totalResults={searchResult.jobs.length} />

      {/* Discovery Status Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.825rem',
        color: 'var(--text-secondary)',
        padding: '0 4px'
      }}>
        <div>
          Showing <strong>{searchResult.jobs.length}</strong> opportunities
          {searchResult.duplicatesRemoved > 0 && (
            <span style={{ color: 'var(--primary)', marginLeft: '6px' }}>
              ({searchResult.duplicatesRemoved} duplicate listings merged into canonical records)
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span>Transparent Match Engine Active</span>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
        {searchResult.jobs.map(job => {
          const match = calculateJobMatch(profile, job);
          return (
            <JobCard
              key={job.id}
              job={job}
              match={match}
              onViewJob={j => setSelectedDetailJob(j)}
              onAnalyze={j => setSelectedDetailJob(j)}
              onTailorResume={onTailorResume}
              onApply={onApplyJob}
              isSaved={savedJobIds.includes(job.id)}
            />
          );
        })}
      </div>

      {searchResult.jobs.length === 0 && (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h3>No matching jobs found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Try expanding your search query or enabling "Include DEMO DATA" in the filters above.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDetailJob && (
        <JobDetailModal
          job={selectedDetailJob}
          match={calculateJobMatch(profile, selectedDetailJob)}
          onClose={() => setSelectedDetailJob(null)}
          onTailorResume={onTailorResume}
          onPrepareApplication={onApplyJob}
          onSaveToKanban={onSaveToKanban}
          isSaved={savedJobIds.includes(selectedDetailJob.id)}
        />
      )}
    </div>
  );
};
