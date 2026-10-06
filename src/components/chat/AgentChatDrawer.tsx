import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Loader2,
  X,
  FileText,
  Briefcase,
  Cpu,
  Layers,
  Bookmark,
  AlertTriangle
} from 'lucide-react';
import { AgentMessage, AgentStep, HumanInTheLoopRequest } from '../../types/agent';
import { Citation, RagDebugTrace } from '../../types/rag';
import { AgentOrchestrator } from '../../agent/agentOrchestrator';
import { AiService } from '../../services/aiService';
import { StorageService } from '../../services/storageService';
import { CitationPreviewModal } from '../rag/CitationPreviewModal';
import { RagDebugModal } from '../rag/RagDebugModal';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose?: () => void;
  isFullPage?: boolean;
  onTriggerHITL: (req: HumanInTheLoopRequest) => void;
  onNavigateTab: (tab: any) => void;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  isFullPage = false,
  onTriggerHITL,
  onNavigateTab
}) => {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: `Hello Hari! I'm your **RAG-Powered Job Application Copilot** (${AiService.getModelName()}).

I have indexed your verified career records and opportunities:
• 📄 **Resume & Skills**: Verified in Core Java, C, Web Development, 8.7 CGPA.
• 🏗️ **Verified Project**: "Online Bookstore & Inventory Portal" (Java Servlets, MySQL).
• 🎯 **Top Matched Role**: **ABC Technologies** (Software Engineer Intern — 91% Match).

What would you like to accomplish today?
1. **Evaluate Job Fit**: Grounded match score breakdown with evidence citations.
2. **Tailor Resume**: Highlight relevant coursework & projects without inventing experience.
3. **Interview Prep**: Drill high-frequency DSA patterns and STAR behavioral questions.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [activeSteps, setActiveSteps] = useState<AgentStep[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingGreeting, setIsGeneratingGreeting] = useState<boolean>(false);

  // Citation & Debug Trace modals
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [activeTrace, setActiveTrace] = useState<RagDebugTrace | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamically generate personalized AI greeting from model on mount
  useEffect(() => {
    const fetchAiGreeting = async () => {
      try {
        const profile = StorageService.getProfile();
        const jobs = StorageService.getJobs();
        const topJob = jobs[0]?.company || 'ABC Technologies';
        const aiGreeting = await AiService.generateWelcomeGreeting(profile, topJob);
        if (aiGreeting) {
          setMessages(prev => {
            if (prev.length > 0 && prev[0].id === 'welcome') {
              return [{ ...prev[0], text: aiGreeting }, ...prev.slice(1)];
            }
            return prev;
          });
        }
      } catch (e) {
        console.warn('Error loading dynamic AI greeting:', e);
      }
    };
    fetchAiGreeting();
  }, []);

  const handleRegenerateGreeting = async () => {
    setIsGeneratingGreeting(true);
    try {
      const profile = StorageService.getProfile();
      const jobs = StorageService.getJobs();
      const topJob = jobs[0]?.company || 'ABC Technologies';
      const aiGreeting = await AiService.generateWelcomeGreeting(profile, topJob);
      if (aiGreeting) {
        setMessages(prev => {
          if (prev.length > 0 && prev[0].id === 'welcome') {
            return [{ ...prev[0], text: aiGreeting, timestamp: new Date().toISOString() }, ...prev.slice(1)];
          }
          return prev;
        });
      }
    } finally {
      setIsGeneratingGreeting(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeSteps]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || isLoading) return;

    setInput('');
    const userMsg: AgentMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setActiveSteps([]);

    try {
      const result = await AgentOrchestrator.processUserInput(q, steps => {
        setActiveSteps([...steps]);
      });

      setMessages(prev => [...prev, result.message]);

      if (result.hitlRequest) {
        onTriggerHITL(result.hitlRequest);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'agent',
          text: `An error occurred while orchestrating your request. Please try again.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
      setActiveSteps([]);
    }
  };

  if (!isOpen && !isFullPage) return null;

  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: isFullPage ? 'calc(100vh - 120px)' : '100%',
      background: 'var(--bg-card)',
      borderRadius: isFullPage ? 'var(--radius-lg)' : 0,
      border: isFullPage ? '1px solid var(--border-card)' : 'none',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-sidebar)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Bot size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>RAG Career Copilot</h3>
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontWeight: 600
              }}>
                {AiService.getModelName()}
              </span>
            </div>
            <span style={{ fontSize: '0.725rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              Hybrid Retrieval + Grounding Online
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleRegenerateGreeting}
            disabled={isGeneratingGreeting}
            title="Generate fresh greeting from AI model"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-secondary)',
              fontSize: '0.725rem',
              cursor: isGeneratingGreeting ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={e => {
              if (!isGeneratingGreeting) {
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }
            }}
            onMouseLeave={e => {
              if (!isGeneratingGreeting) {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-card)';
              }
            }}
          >
            <Sparkles size={12} color="var(--primary)" className={isGeneratingGreeting ? 'spin-slow' : ''} />
            <span>{isGeneratingGreeting ? 'Generating...' : 'AI Greeting'}</span>
          </button>

          {onClose && !isFullPage && (
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '10px 16px',
        background: 'var(--bg-input)',
        borderBottom: '1px solid var(--border-card)',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {[
          'Why is ABC Technologies ranked #1?',
          'What programming languages are listed on my resume?',
          'Which skills are required for ABC Technologies?',
          'Does ABC Technologies provide accommodation?',
          'Tailor my resume for ABC Technologies',
          'What skills should I learn?',
          'Prepare interview questions for ABC Technologies'
        ].map((prompt, i) => (
          <button
            key={i}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.725rem', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
            onClick={() => handleSend(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '6px'
            }}
          >
            <div style={{
              display: 'flex',
              gap: '10px',
              maxWidth: '88%',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-full)',
                background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-input)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.75rem',
                flexShrink: 0
              }}>
                {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} color="#818cf8" />}
              </div>

              <div style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-input)',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                fontSize: '0.875rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-line',
                border: '1px solid',
                borderColor: msg.sender === 'user' ? 'transparent' : 'var(--border-card)'
              }}>
                {msg.text}

                {/* Conflict Notice Warning */}
                {msg.conflictNotices && msg.conflictNotices.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#f59e0b',
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <AlertTriangle size={14} />
                      <span>Conflicting Sources Identified</span>
                    </div>
                    {msg.conflictNotices.map((cf, i) => (
                      <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                        • Prioritizing <strong>{cf.higherAuthoritySource}</strong> over {cf.lowerAuthoritySource}. {cf.resolutionNote}
                      </div>
                    ))}
                  </div>
                )}

                {/* Clickable Citations Chips */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{
                    marginTop: '14px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Verified Grounded Citations (Click to inspect source)
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {msg.citations.map(cit => (
                        <button
                          key={cit.id}
                          onClick={() => setActiveCitation(cit)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 9px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(99, 102, 241, 0.12)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#818cf8',
                            fontSize: '0.725rem',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
                          }}
                        >
                          <Bookmark size={11} />
                          <span>{cit.source}</span>
                          <span style={{ opacity: 0.7 }}>({cit.section})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Developer Observability Trace Button */}
                {msg.ragTrace && (
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setActiveTrace(msg.ragTrace!)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'transparent',
                        border: '1px solid var(--border-card)',
                        color: 'var(--text-muted)',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--primary)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'var(--border-card)';
                      }}
                    >
                      <Cpu size={12} />
                      <span>Inspect RAG Pipeline Trace ({msg.ragTrace.latencyMs.total}ms)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* If message had steps */}
            {msg.steps && msg.steps.length > 0 && (
              <div style={{
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-card)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginLeft: '40px',
                maxWidth: '85%'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  RAG Execution Pipeline:
                </div>
                {msg.steps.map((st, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>{st.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Live Step Progress Indicator */}
        {isLoading && (
          <div style={{
            marginLeft: '40px',
            padding: '12px 16px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '85%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.825rem', fontWeight: 600 }}>
              <Loader2 size={14} className="spin-animation" />
              <span>Retrieving verified evidence & reranking...</span>
            </div>

            {activeSteps.map((st, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={12} color="#10b981" />
                <span>{st.label}</span>
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-card)',
        background: 'var(--bg-sidebar)',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          className="input-field"
          placeholder="Ask a factual career question or request resume tailoring..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        <button
          className="btn btn-primary"
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          style={{ padding: '10px 18px' }}
        >
          <Send size={15} />
        </button>
      </div>

      {/* Citation Preview Modal */}
      <CitationPreviewModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      {/* RAG Developer Trace Inspector Modal */}
      <RagDebugModal
        trace={activeTrace}
        onClose={() => setActiveTrace(null)}
      />
    </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: '68px',
      bottom: 0,
      width: '460px',
      zIndex: 90,
      boxShadow: 'var(--shadow-lg)',
      animation: 'slideInRight 0.2s ease-out'
    }}>
      {content}
    </div>
  );
};
