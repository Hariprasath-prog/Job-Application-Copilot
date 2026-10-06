import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  Briefcase,
  MapPin,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../../types/profile';
import { parseResumeText } from '../../services/resumeParser';

interface OnboardingWizardProps {
  currentProfile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
  onSkip: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  currentProfile,
  onComplete,
  onSkip
}) => {
  const [step, setStep] = useState<number>(1);
  const [profile, setProfile] = useState<UserProfile>({ ...currentProfile });
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState<string>('');
  const [rawResumeText, setRawResumeText] = useState<string>('');

  const totalSteps = 8;

  const handleSimulatedFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractionProgress('Reading document binary stream...');

    setTimeout(() => {
      setExtractionProgress('Extracting technical tokens & entity graphs...');
    }, 600);

    setTimeout(() => {
      // Sample resume content based on Hari Kumar
      const sampleText = `
        Hari Kumar
        hari.kumar@example.com | +91 98765 43210
        Bangalore, India
        B.Tech Computer Science and Engineering - RV College of Engineering (2026 Batch, 8.7 CGPA)
        Skills: Java, C, JavaScript, HTML5, CSS3, Git, DSA, OOP, MySQL
        Projects: Online Bookstore Portal (Java, MySQL, Servlets), Student Task Tracker (JavaScript, HTML, CSS), Memory Allocator in C.
      `;
      setRawResumeText(sampleText);
      const parseResult = parseResumeText(sampleText, file.name);

      if (parseResult.success && parseResult.parsedProfile) {
        setProfile(prev => ({
          ...prev,
          fullName: parseResult.parsedProfile?.fullName || prev.fullName,
          email: parseResult.parsedProfile?.email || prev.email,
          resumeFileName: file.name,
          resumeParsedAt: new Date().toISOString()
        }));
      }

      setIsExtracting(false);
      setStep(3); // Proceed to extraction review
    }, 1400);
  };

  const handleUseSampleResume = () => {
    setIsExtracting(true);
    setExtractionProgress('Ingesting Hari Kumar Sample Student Profile (B.Tech CSE)...');

    setTimeout(() => {
      setIsExtracting(false);
      setStep(3);
    }, 800);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '820px', padding: '0', overflow: 'hidden' }}>
        {/* Wizard Progress Top Bar */}
        <div style={{
          padding: '20px 28px',
          background: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-good" style={{ fontSize: '0.7rem' }}>
                Onboarding Step {step} of {totalSteps}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Job Application Copilot Setup
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', marginTop: '4px' }}>
              {step === 1 && "What are you looking for?"}
              {step === 2 && "Upload Your Resume"}
              {step === 3 && "AI Parsing & Entity Graph"}
              {step === 4 && "Verify Extracted Profile Facts"}
              {step === 5 && "Target Employment Type"}
              {step === 6 && "Target Job Roles"}
              {step === 7 && "Target Locations & Work Mode"}
              {step === 8 && "Activate Copilot & Discover Opportunities"}
            </h2>
          </div>
          <button
            onClick={onSkip}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            Skip to Dashboard
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="progress-bar-bg" style={{ borderRadius: 0, height: '4px' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${(step / totalSteps) * 100}%`,
              background: 'var(--primary-gradient)'
            }}
          />
        </div>

        {/* Wizard Body */}
        <div style={{ padding: '32px 36px', minHeight: '380px' }}>
          {/* STEP 1: What are you looking for */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Job Application Copilot acts as your personal career advisor, matching engine, and application manager.
                Let's calibrate your agent to find high-match opportunities tailored to your real background.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '10px' }}>
                <div
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-focus)',
                    background: 'var(--primary-glow)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setStep(2)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Briefcase size={22} color="#818cf8" />
                    <h3 style={{ fontSize: '1.05rem' }}>College Student / Fresher</h3>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Looking for Summer/Fall Internships, Graduate Trainee programs, or entry-level developer roles.
                  </p>
                </div>

                <div
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-card)',
                    background: 'var(--bg-input)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setStep(2)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Sparkles size={22} color="#10b981" />
                    <h3 style={{ fontSize: '1.05rem' }}>Early Career Developer</h3>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    0-2 years experience seeking Junior Full-Stack, Java Backend, or Frontend positions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Upload Resume */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Upload your PDF or DOCX resume. The agent will parse your skills, coursework, and projects into structured memory.
              </p>

              <div style={{
                border: '2px dashed var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px 20px',
                background: 'var(--bg-input)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                position: 'relative'
              }}>
                <Upload size={38} color="#6366f1" />
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Choose a file or drag & drop</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF, DOCX, or TXT up to 10MB</p>
                </div>

                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleSimulatedFileUpload}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />

                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— OR —</span>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleUseSampleResume}
                >
                  Use Pre-loaded Sample (Hari Kumar — B.Tech CSE)
                </button>
              </div>

              {isExtracting && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--primary)' }}>
                  <Loader2 size={18} className="spin-animation" />
                  <span style={{ fontSize: '0.85rem' }}>{extractionProgress}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: AI Extraction Progress */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}>
                <CheckCircle2 size={24} />
                <h3 style={{ fontSize: '1.15rem' }}>Resume Successfully Parsed</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Entity extraction finished with <strong>94% Confidence</strong>. The agent extracted contact details, degree credentials, 12 skills, and 3 academic projects.
              </p>

              <div style={{
                background: 'var(--bg-input)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Extracted Name:</span>
                  <div style={{ fontWeight: 600 }}>{profile.fullName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Degree / Batch:</span>
                  <div style={{ fontWeight: 600 }}>{profile.education[0]?.degree} ({profile.education[0]?.graduationYear})</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Core Languages:</span>
                  <div style={{ fontWeight: 600 }}>{profile.skills.languages.join(', ')}</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Verify Extracted Information */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                You have full control over your verified profile. Review or update any extracted fields below:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Full Name
                  </label>
                  <input
                    className="input-field"
                    value={profile.fullName}
                    onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Email
                  </label>
                  <input
                    className="input-field"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    College / University
                  </label>
                  <input
                    className="input-field"
                    value={profile.education[0]?.institution || ''}
                    onChange={e => {
                      const edu = [...profile.education];
                      if (edu[0]) edu[0].institution = e.target.value;
                      setProfile({ ...profile, education: edu });
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={profile.education[0]?.graduationYear || 2026}
                    onChange={e => {
                      const edu = [...profile.education];
                      if (edu[0]) edu[0].graduationYear = parseInt(e.target.value) || 2026;
                      setProfile({ ...profile, education: edu });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Employment Preference */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                What kind of employment are you currently seeking?
              </p>

              <div style={{ display: 'flex', gap: '14px' }}>
                {(['Internship', 'Full-time', 'Contract'] as const).map(type => {
                  const isSelected = profile.preferences.employmentType.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const current = profile.preferences.employmentType;
                        const updated = isSelected
                          ? current.filter(t => t !== type)
                          : [...current, type];
                        setProfile({
                          ...profile,
                          preferences: { ...profile.preferences, employmentType: updated.length ? updated : [type] }
                        });
                      }}
                      className={isSelected ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ flex: 1, padding: '16px' }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Target Roles */}
          {step === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Select target engineering roles for matching:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  'Software Engineer Intern',
                  'Java Developer Intern',
                  'Graduate Engineer Trainee',
                  'Frontend Developer Intern',
                  'Backend Engineer (Entry Level)',
                  'Full Stack Developer Intern'
                ].map(role => {
                  const isSelected = profile.preferences.targetRoles.includes(role);
                  return (
                    <div
                      key={role}
                      onClick={() => {
                        const current = profile.preferences.targetRoles;
                        const updated = isSelected
                          ? current.filter(r => r !== role)
                          : [...current, role];
                        setProfile({
                          ...profile,
                          preferences: { ...profile.preferences, targetRoles: updated.length ? updated : [role] }
                        });
                      }}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border-card)',
                        background: isSelected ? 'var(--primary-glow)' : 'var(--bg-input)',
                        color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 600 : 500
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '} {role}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Target Locations */}
          {step === 7 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Select preferred locations and work modes:
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Remote'].map(loc => {
                  const isSelected = profile.preferences.preferredLocations.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        const current = profile.preferences.preferredLocations;
                        const updated = isSelected
                          ? current.filter(l => l !== loc)
                          : [...current, loc];
                        setProfile({
                          ...profile,
                          preferences: { ...profile.preferences, preferredLocations: updated.length ? updated : [loc] }
                        });
                      }}
                      className={isSelected ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                    >
                      <MapPin size={13} /> {loc}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Work Mode Preference
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {(['Hybrid', 'Remote', 'On-site'] as const).map(mode => {
                    const isSelected = profile.preferences.workMode.includes(mode);
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          const current = profile.preferences.workMode;
                          const updated = isSelected
                            ? current.filter(m => m !== mode)
                            : [...current, mode];
                          setProfile({
                            ...profile,
                            preferences: { ...profile.preferences, workMode: updated.length ? updated : [mode] }
                          });
                        }}
                        className={isSelected ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Activate Copilot */}
          {step === 8 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', alignItems: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: 'var(--shadow-glow)'
              }}>
                <Sparkles size={32} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Your Job Copilot is Primed!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px' }}>
                  We connected your verified profile facts to the live matching engine. The dashboard will now present high-priority software engineering opportunities, transparent match scores, and interview prep guides.
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                fontSize: '0.825rem'
              }}>
                <ShieldCheck size={16} />
                <span>Anti-Hallucination Guard, Truth-Preserving Tailor & HITL Gate Enabled</span>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div style={{
          padding: '16px 28px',
          background: 'var(--bg-sidebar)',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {step > 1 ? (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setStep(step + 1)}
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              onClick={() => onComplete(profile)}
            >
              <CheckCircle2 size={16} /> Open Dashboard & Match Jobs
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
