import React, { useState } from 'react';
import {
  UserCheck,
  GraduationCap,
  Code2,
  FolderGit2,
  Briefcase,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Link,
  Database
} from 'lucide-react';
import { UserProfile, Education, Project } from '../../types/profile';
import { KnowledgeBaseView } from '../knowledge/KnowledgeBaseView';

interface CareerProfileViewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const CareerProfileView: React.FC<CareerProfileViewProps> = ({ profile, onSaveProfile }) => {
  const [form, setForm] = useState<UserProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'skills' | 'projects' | 'preferences' | 'documents'>('personal');

  const handleSave = () => {
    onSaveProfile({ ...form, updatedAt: new Date().toISOString() });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Profile Header */}
      <div className="glass-card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
              Verified Career Profile Memory
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', margin: 0 }}>{form.fullName}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            {form.headline}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          style={{ padding: '10px 24px' }}
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 size={16} /> Saved Successfully!
            </>
          ) : (
            <>
              <Save size={16} /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-card)',
        gap: '4px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'personal', label: 'Personal & Links', icon: <UserCheck size={16} /> },
          { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
          { id: 'skills', label: 'Skills Matrix', icon: <Code2 size={16} /> },
          { id: 'projects', label: 'Projects & Repos', icon: <FolderGit2 size={16} /> },
          { id: 'preferences', label: 'Career Preferences', icon: <Briefcase size={16} /> },
          { id: 'documents', label: 'Knowledge Base', icon: <Database size={16} /> }
        ].map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ color: isActive ? 'var(--primary)' : 'inherit' }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="glass-card" style={{ padding: '28px' }}>
        {/* TAB 1: Personal & Links */}
        {activeTab === 'personal' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                className="input-field"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <input
                className="input-field"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                className="input-field"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Location (City, Country)
              </label>
              <input
                className="input-field"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                LinkedIn Profile URL
              </label>
              <input
                className="input-field"
                value={form.linkedinUrl}
                onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                GitHub Profile URL
              </label>
              <input
                className="input-field"
                value={form.githubUrl}
                onChange={e => setForm({ ...form, githubUrl: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Professional Summary
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={form.summary}
                onChange={e => setForm({ ...form, summary: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Education */}
        {activeTab === 'education' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {form.education.map((edu, idx) => (
              <div
                key={edu.id}
                style={{
                  background: 'var(--bg-input)',
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '14px',
                  border: '1px solid var(--border-card)'
                }}
              >
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Degree & Level
                  </label>
                  <input
                    className="input-field"
                    value={edu.degree}
                    onChange={e => {
                      const list = [...form.education];
                      list[idx].degree = e.target.value;
                      setForm({ ...form, education: list });
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Field of Study / Branch
                  </label>
                  <input
                    className="input-field"
                    value={edu.fieldOfStudy}
                    onChange={e => {
                      const list = [...form.education];
                      list[idx].fieldOfStudy = e.target.value;
                      setForm({ ...form, education: list });
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Institution / University
                  </label>
                  <input
                    className="input-field"
                    value={edu.institution}
                    onChange={e => {
                      const list = [...form.education];
                      list[idx].institution = e.target.value;
                      setForm({ ...form, education: list });
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={edu.graduationYear}
                      onChange={e => {
                        const list = [...form.education];
                        list[idx].graduationYear = parseInt(e.target.value) || 2026;
                        setForm({ ...form, education: list });
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      CGPA / %
                    </label>
                    <input
                      className="input-field"
                      value={edu.cgpaOrPercentage}
                      onChange={e => {
                        const list = [...form.education];
                        list[idx].cgpaOrPercentage = e.target.value;
                        setForm({ ...form, education: list });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Skills Matrix */}
        {activeTab === 'skills' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Programming Languages (comma-separated)
              </label>
              <input
                className="input-field"
                value={form.skills.languages.join(', ')}
                onChange={e => {
                  setForm({
                    ...form,
                    skills: { ...form.skills, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  });
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Frameworks & Libraries (comma-separated)
              </label>
              <input
                className="input-field"
                value={form.skills.frameworks.join(', ')}
                onChange={e => {
                  setForm({
                    ...form,
                    skills: { ...form.skills, frameworks: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  });
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Databases (comma-separated)
              </label>
              <input
                className="input-field"
                value={form.skills.databases.join(', ')}
                onChange={e => {
                  setForm({
                    ...form,
                    skills: { ...form.skills, databases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  });
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Tools & Platforms (Git, Linux, Docker, etc.)
              </label>
              <input
                className="input-field"
                value={form.skills.toolsAndPlatforms.join(', ')}
                onChange={e => {
                  setForm({
                    ...form,
                    skills: { ...form.skills, toolsAndPlatforms: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  });
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Core Computer Science Concepts (DSA, OOP, OS, etc.)
              </label>
              <input
                className="input-field"
                value={form.skills.coreConcepts.join(', ')}
                onChange={e => {
                  setForm({
                    ...form,
                    skills: { ...form.skills, coreConcepts: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  });
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 4: Projects */}
        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {form.projects.map((proj, idx) => (
              <div
                key={proj.id}
                style={{
                  background: 'var(--bg-input)',
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid var(--border-card)'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Project Title
                    </label>
                    <input
                      className="input-field"
                      value={proj.title}
                      onChange={e => {
                        const list = [...form.projects];
                        list[idx].title = e.target.value;
                        setForm({ ...form, projects: list });
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Technologies Used
                    </label>
                    <input
                      className="input-field"
                      value={proj.technologies.join(', ')}
                      onChange={e => {
                        const list = [...form.projects];
                        list[idx].technologies = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setForm({ ...form, projects: list });
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Description
                  </label>
                  <input
                    className="input-field"
                    value={proj.description}
                    onChange={e => {
                      const list = [...form.projects];
                      list[idx].description = e.target.value;
                      setForm({ ...form, projects: list });
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Key Bullet Points (one per line)
                  </label>
                  <textarea
                    className="input-field"
                    rows={2}
                    value={proj.bullets.join('\n')}
                    onChange={e => {
                      const list = [...form.projects];
                      list[idx].bullets = e.target.value.split('\n').filter(Boolean);
                      setForm({ ...form, projects: list });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: Preferences */}
        {activeTab === 'preferences' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Target Roles (comma-separated)
              </label>
              <input
                className="input-field"
                value={form.preferences.targetRoles.join(', ')}
                onChange={e => {
                  setForm({
                    ...form,
                    preferences: { ...form.preferences, targetRoles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  });
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Preferred Locations (comma-separated)
              </label>
              <input
                className="input-field"
                value={form.preferences.preferredLocations.join(', ')}
                onChange={e => {
                  setForm({
                    ...form,
                    preferences: { ...form.preferences, preferredLocations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  });
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Expected Stipend / Salary
              </label>
              <input
                className="input-field"
                value={form.preferences.expectedStipendOrSalary}
                onChange={e => {
                  setForm({
                    ...form,
                    preferences: { ...form.preferences, expectedStipendOrSalary: e.target.value }
                  });
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Work Authorization
              </label>
              <input
                className="input-field"
                value={form.preferences.workAuthorization}
                onChange={e => {
                  setForm({
                    ...form,
                    preferences: { ...form.preferences, workAuthorization: e.target.value }
                  });
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Notice Period / Availability
              </label>
              <input
                className="input-field"
                value={form.preferences.noticePeriod}
                onChange={e => {
                  setForm({
                    ...form,
                    preferences: { ...form.preferences, noticePeriod: e.target.value }
                  });
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Graduation Batch
              </label>
              <input
                className="input-field"
                value={form.preferences.graduationBatch}
                onChange={e => {
                  setForm({
                    ...form,
                    preferences: { ...form.preferences, graduationBatch: e.target.value }
                  });
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 6: Knowledge Base & Document Repository */}
        {activeTab === 'documents' && (
          <div style={{ marginTop: '-10px' }}>
            <KnowledgeBaseView />
          </div>
        )}
      </div>
    </div>
  );
};
