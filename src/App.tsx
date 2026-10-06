import React, { useState, useEffect } from 'react';
import { UserProfile } from './types/profile';
import { JobListing } from './types/job';
import { ApplicationRecord, ApplicationStage } from './types/application';
import { HumanInTheLoopRequest } from './types/agent';
import { StorageService } from './services/storageService';
import { detectDueFollowUps } from './services/followUpService';

// Layout & Common Components
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { NotificationBanner } from './components/layout/NotificationBanner';
import { HumanInTheLoopModal } from './components/common/HumanInTheLoopModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { AgentChatDrawer } from './components/chat/AgentChatDrawer';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { JobListView } from './components/jobs/JobListView';
import { ApplicationKanban } from './components/applications/ApplicationKanban';
import { ResumeStudioView } from './components/resume/ResumeStudioView';
import { CareerProfileView } from './components/profile/CareerProfileView';
import { SkillGapView } from './components/skillgap/SkillGapView';
import { InterviewPrepView } from './components/interview/InterviewPrepView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [jobs, setJobs] = useState<JobListing[]>(StorageService.getJobs());
  const [applications, setApplications] = useState<ApplicationRecord[]>(StorageService.getApplications());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [activeHITL, setActiveHITL] = useState<HumanInTheLoopRequest | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [targetTailorJob, setTargetTailorJob] = useState<JobListing | undefined>(undefined);
  const [notificationDismissed, setNotificationDismissed] = useState<boolean>(false);

  // Sync theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check if first-run onboarding is needed
  useEffect(() => {
    const isCompleted = localStorage.getItem('onboarding_completed');
    if (!isCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  // Update profile handler
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    StorageService.saveProfile(updated);
  };

  // Kanban stage updater
  const handleUpdateStage = (appId: string, newStage: ApplicationStage) => {
    const updated = applications.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          stage: newStage,
          dateUpdated: new Date().toISOString()
        };
      }
      return app;
    });
    setApplications(updated);
    StorageService.saveApplications(updated);
  };

  // Save job to Kanban
  const handleSaveToKanban = (job: JobListing) => {
    const exists = applications.find(a => a.jobId === job.id);
    if (exists) {
      alert(`Already tracked in pipeline under "${exists.stage}".`);
      return;
    }

    const newRecord: ApplicationRecord = {
      id: `app_${Date.now()}`,
      jobId: job.id,
      job,
      stage: 'Saved',
      matchScore: 88,
      dateDiscovered: new Date().toISOString().slice(0, 10),
      notes: 'Discovered via autonomous job search connector.',
      followUpStatus: 'Pending',
      dateUpdated: new Date().toISOString()
    };

    const updated = [newRecord, ...applications];
    setApplications(updated);
    StorageService.saveApplications(updated);
  };

  // Tailor Resume navigation handoff
  const handleTailorResume = (job: JobListing) => {
    setTargetTailorJob(job);
    setCurrentTab('resume');
  };

  // Apply Action trigger (Creates HITL request)
  const handleApplyJob = (job: JobListing) => {
    const hitl: HumanInTheLoopRequest = {
      id: `hitl_${Date.now()}`,
      actionType: 'submit_application',
      title: `Submit Verified Application: ${job.company}`,
      summary: `You are about to prepare and mark your application to ${job.company} (${job.title}) as Applied. Review generated documents before confirming.`,
      details: {
        company: job.company,
        role: job.title,
        stipend: job.stipendOrSalary,
        portalUrl: job.sourceUrl,
        coverLetter: `Dear Hiring Team at ${job.company},\n\nI am writing to express my strong interest in the ${job.title} role. As a B.Tech Computer Science student at RV College of Engineering graduating in 2026, my verified coursework in Data Structures, Java development, and database engineering directly aligns with ${job.company}'s mission.\n\nThank you for considering my application.\n\nSincerely,\n${profile.fullName}`,
        answers: [
          {
            question: `Why do you want to join ${job.company}?`,
            answer: `I am excited by ${job.company}'s engineering challenges and want to leverage my hands-on experience in Java and scalable systems.`,
            verifiedBasis: 'Matches verified career interests'
          }
        ]
      },
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setActiveHITL(hitl);
  };

  // Human-in-the-Loop Approval
  const handleApproveHITL = (request: HumanInTheLoopRequest) => {
    const targetJob = jobs.find(j => j.company === request.details.company) || jobs[0];

    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 7);

    // Either update existing or create new application record
    const existingIndex = applications.findIndex(a => a.jobId === targetJob.id);
    let updatedApps: ApplicationRecord[];

    if (existingIndex >= 0) {
      updatedApps = [...applications];
      updatedApps[existingIndex] = {
        ...updatedApps[existingIndex],
        stage: 'Applied',
        dateApplied: new Date().toISOString().slice(0, 10),
        followUpDate: followUpDate.toISOString().slice(0, 10),
        followUpStatus: 'Pending',
        dateUpdated: new Date().toISOString()
      };
    } else {
      const newApp: ApplicationRecord = {
        id: `app_${Date.now()}`,
        jobId: targetJob.id,
        job: targetJob,
        stage: 'Applied',
        matchScore: 91,
        dateDiscovered: new Date().toISOString().slice(0, 10),
        dateApplied: new Date().toISOString().slice(0, 10),
        followUpDate: followUpDate.toISOString().slice(0, 10),
        followUpStatus: 'Pending',
        notes: 'Submitted via Human-in-the-loop approved package.',
        dateUpdated: new Date().toISOString()
      };
      updatedApps = [newApp, ...applications];
    }

    setApplications(updatedApps);
    StorageService.saveApplications(updatedApps);
    setActiveHITL(null);
    alert(`Application to ${request.details.company} recorded as Applied! Scheduled follow-up reminder for ${followUpDate.toISOString().slice(0, 10)}.`);
  };

  const handleRejectHITL = (request: HumanInTheLoopRequest) => {
    setActiveHITL(null);
  };

  // Reset demo data handler
  const handleResetData = () => {
    StorageService.resetAllDefaults();
    setProfile(StorageService.getProfile());
    setJobs(StorageService.getJobs());
    setApplications(StorageService.getApplications());
    localStorage.removeItem('onboarding_completed');
    setShowOnboarding(true);
  };

  const dueApps = detectDueFollowUps(applications, profile).map(f =>
    applications.find(a => a.id === f.applicationId)!
  ).filter(Boolean);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          if (tab !== 'copilot') setIsCopilotOpen(false);
        }}
        applicationsCount={applications.length}
        jobsCount={jobs.length}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Header */}
        <Header
          profile={profile}
          theme={theme}
          onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onRestartOnboarding={() => setShowOnboarding(true)}
          dueFollowUpCount={dueApps.length}
        />

        {/* Follow-up Due Notification */}
        {!notificationDismissed && dueApps.length > 0 && (
          <NotificationBanner
            dueApplications={dueApps}
            onOpenApplication={app => {
              setCurrentTab('applications');
            }}
            onDismiss={() => setNotificationDismissed(true)}
          />
        )}

        {/* View Router */}
        <main className="content-body">
          {currentTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              jobs={jobs}
              applications={applications}
              onSelectJob={job => {
                setTargetTailorJob(job);
                setCurrentTab('jobs');
              }}
              onNavigateTab={tab => setCurrentTab(tab)}
              onOpenApplication={app => setCurrentTab('applications')}
              onTailorResume={handleTailorResume}
            />
          )}

          {currentTab === 'jobs' && (
            <JobListView
              profile={profile}
              jobs={jobs}
              onTailorResume={handleTailorResume}
              onApplyJob={handleApplyJob}
              onSaveToKanban={handleSaveToKanban}
              savedJobIds={applications.map(a => a.jobId)}
            />
          )}

          {currentTab === 'applications' && (
            <ApplicationKanban
              applications={applications}
              onUpdateStage={handleUpdateStage}
              onOpenApplication={app => {
                alert(`Viewing details for ${app.job.company} (${app.stage})`);
              }}
              onOpenFollowUp={app => {
                alert(`Follow-up draft for ${app.job.company} ready in Copilot.`);
                setIsCopilotOpen(true);
              }}
            />
          )}

          {currentTab === 'resume' && (
            <ResumeStudioView
              profile={profile}
              jobs={jobs}
              targetJob={targetTailorJob}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentTab === 'profile' && (
            <CareerProfileView
              profile={profile}
              onSaveProfile={handleUpdateProfile}
            />
          )}

          {currentTab === 'skillgaps' && (
            <SkillGapView
              profile={profile}
              jobs={jobs}
            />
          )}

          {currentTab === 'interview' && (
            <InterviewPrepView
              profile={profile}
              jobs={jobs}
            />
          )}

          {currentTab === 'copilot' && (
            <AgentChatDrawer
              isOpen={true}
              isFullPage={true}
              onTriggerHITL={req => setActiveHITL(req)}
              onNavigateTab={tab => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              applications={applications}
              jobs={jobs}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView onResetData={handleResetData} />
          )}
        </main>
      </div>

      {/* Floating Copilot Drawer (when opened from other tabs) */}
      {isCopilotOpen && currentTab !== 'copilot' && (
        <AgentChatDrawer
          isOpen={true}
          onClose={() => setIsCopilotOpen(false)}
          onTriggerHITL={req => setActiveHITL(req)}
          onNavigateTab={tab => setCurrentTab(tab)}
        />
      )}

      {/* Human-in-the-Loop Confirmation Gate Modal */}
      {activeHITL && (
        <HumanInTheLoopModal
          request={activeHITL}
          onApprove={handleApproveHITL}
          onReject={handleRejectHITL}
          onClose={() => setActiveHITL(null)}
        />
      )}

      {/* First-Run Onboarding Walkthrough */}
      {showOnboarding && (
        <OnboardingWizard
          currentProfile={profile}
          onComplete={updated => {
            handleUpdateProfile(updated);
            setShowOnboarding(false);
            localStorage.setItem('onboarding_completed', 'true');
          }}
          onSkip={() => {
            setShowOnboarding(false);
            localStorage.setItem('onboarding_completed', 'true');
          }}
        />
      )}
    </div>
  );
};

export default App;
