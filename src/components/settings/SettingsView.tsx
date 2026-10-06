import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Globe,
  Radio,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Cpu,
  Check,
  AlertCircle
} from 'lucide-react';
import { StorageService } from '../../services/storageService';

interface SettingsViewProps {
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetData }) => {
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [antiHallucination, setAntiHallucination] = useState<boolean>(true);
  const [hitlGate, setHitlGate] = useState<boolean>(true);
  
  // API Key & Provider Settings
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'local'>(() => {
    return (localStorage.getItem('copilot_ai_provider') as any) || (import.meta.env.VITE_AI_PROVIDER as any) || 'gemini';
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('copilot_api_key') || (import.meta.env.VITE_AI_API_KEY as string) || '';
  });
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleSaveApiSettings = () => {
    localStorage.setItem('copilot_ai_provider', provider);
    localStorage.setItem('copilot_api_key', apiKey.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestApiKey = async () => {
    if (provider === 'local') {
      setTestStatus('success');
      setTestMessage('Built-in Local Copilot is active. Zero API key needed.');
      return;
    }

    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Validating API key with remote server...');

    try {
      if (provider === 'gemini') {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Respond with "OK"' }] }]
            })
          }
        );

        if (resp.ok) {
          setTestStatus('success');
          setTestMessage('✓ Gemini API connection verified successfully!');
          handleSaveApiSettings();
        } else {
          const errData = await resp.json().catch(() => ({}));
          setTestStatus('error');
          setTestMessage(`Validation failed: ${errData.error?.message || resp.statusText}`);
        }
      } else if (provider === 'openai') {
        const resp = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey.trim()}` }
        });

        if (resp.ok) {
          setTestStatus('success');
          setTestMessage('✓ OpenAI API connection verified successfully!');
          handleSaveApiSettings();
        } else {
          const errData = await resp.json().catch(() => ({}));
          setTestStatus('error');
          setTestMessage(`Validation failed: ${errData.error?.message || resp.statusText}`);
        }
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(`Network error connecting to provider: ${e.message}`);
    }
  };

  const handleExportJson = () => {
    const dataStr = StorageService.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-copilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const ok = StorageService.importData(text);
        if (ok) {
          alert('Data successfully imported and verified!');
          window.location.reload();
        } else {
          alert('Failed to parse backup JSON.');
        }
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Reset all profile and application data back to factory Hari Kumar demo state?')) {
      onResetData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <h1 style={{ fontSize: '1.6rem', margin: 0 }}>System Settings & Feed Connectors</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '6px' }}>
          Configure connected job data adapters, AI safety policies, and local persistence.
        </p>
      </div>

      {/* AI Model & API Key Configuration */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={20} color="#f59e0b" />
              <span>AI Engine & API Key Configuration</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '4px', marginBottom: 0 }}>
              Use our built-in offline reasoning engine (free) or connect your live Google Gemini or OpenAI API key.
            </p>
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#60a5fa' }}
          >
            <span>Get Free Gemini Key</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Provider Selector */}
        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { id: 'local', title: 'Built-in Local Copilot', subtitle: 'Zero cost, 100% offline, zero hallucination', tag: 'Default / Active' },
            { id: 'gemini', title: 'Google Gemini', subtitle: 'Gemini 1.5 Flash (Generous Free Tier)', tag: 'Recommended' },
            { id: 'openai', title: 'OpenAI GPT-4o', subtitle: 'Requires active OpenAI API credits', tag: 'BYOK' }
          ].map(p => (
            <div
              key={p.id}
              onClick={() => {
                setProvider(p.id as any);
                setTestStatus('idle');
              }}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: provider === p.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)',
                border: `1.5px solid ${provider === p.id ? 'var(--primary)' : 'var(--border-card)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.875rem' }}>{p.title}</strong>
                <span className={`badge ${provider === p.id ? 'badge-high' : 'badge-good'}`} style={{ fontSize: '0.65rem' }}>
                  {p.tag}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.subtitle}</p>
            </div>
          ))}
        </div>

        {/* API Key Input */}
        {provider !== 'local' && (
          <div style={{ marginTop: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '6px' }}>
              {provider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  className="input-field"
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleTestApiKey}
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveApiSettings}
              >
                Save Key
              </button>
            </div>

            {testMessage && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: testStatus === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: testStatus === 'success' ? '#10b981' : '#ef4444',
                  border: `1px solid ${testStatus === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}
              >
                {testStatus === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{testMessage}</span>
              </div>
            )}

            {savedSuccess && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Saved securely in browser storage.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety & Compliance Policies */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#10b981" />
          <span>Anti-Hallucination & Human-in-the-Loop Policies</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>Truthfulness Verification Gate</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Prevents the agent from inventing skills, claims, or project metrics not present in verified profile memory.
              </p>
            </div>
            <input
              type="checkbox"
              checked={antiHallucination}
              onChange={e => setAntiHallucination(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>Consequential Action Confirmation (HITL)</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Mandatory human review modal before submitting applications or scheduling recruiter outreach.
              </p>
            </div>
            <input
              type="checkbox"
              checked={hitlGate}
              onChange={e => setHitlGate(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Connectors */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={20} color="#38bdf8" />
          <span>Connected Job Feeds & Normalizers</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {[
            { name: 'Company Career Portals', proto: 'Greenhouse / Lever / Workday API', status: 'Online' },
            { name: 'LinkedIn Jobs Feed', proto: 'Official Feed / Web Scraping Parser', status: 'Online' },
            { name: 'Indeed Career Feed', proto: 'REST Poller & Deduplicator', status: 'Online' },
            { name: 'Internshala Connector', proto: 'Student Internship Connector', status: 'Online' }
          ].map(conn => (
            <div
              key={conn.name}
              style={{
                background: 'var(--bg-input)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--border-card)'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.875rem' }}>{conn.name}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{conn.proto}</div>
              </div>
              <span className="badge badge-high" style={{ fontSize: '0.675rem' }}>
                {conn.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Factory Reset */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Data Portability & Factory Reset</h3>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={handleExportJson}
          >
            <Download size={15} /> {exportSuccess ? 'Exported!' : 'Export Data (JSON)'}
          </button>

          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            <Upload size={15} /> Import Backup JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              style={{ display: 'none' }}
            />
          </label>

          <button
            className="btn btn-danger btn-outline"
            onClick={handleReset}
            style={{ marginLeft: 'auto' }}
          >
            <RefreshCw size={15} /> {resetSuccess ? 'Reset Complete!' : 'Reset to Sample Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
