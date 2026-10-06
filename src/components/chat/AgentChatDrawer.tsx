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
  Briefcase
} from 'lucide-react';
import { AgentMessage, AgentStep, HumanInTheLoopRequest } from '../../types/agent';
import { AgentOrchestrator } from '../../agent/agentOrchestrator';

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
      text: `Hello Hari! I'm your **Job Application Copilot**.

I can evaluate job listings, tailor your resume with strict truthfulness verification, draft grounded cover letters, monitor follow-up deadlines, and prepare interview questions.

What would you like to accomplish today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [activeSteps, setActiveSteps] = useState<AgentStep[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Job Application Copilot</h3>
            <span style={{ fontSize: '0.725rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              Reasoning Engine Ready
            </span>
          </div>
        </div>

        {onClose && !isFullPage && (
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        )}
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
          'Tailor my resume for ABC Technologies',
          'Apply for ABC Technologies',
          'Follow up on ABC Technologies',
          'What skills should I learn?',
          'Prepare interview questions for PhonePe'
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
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              maxWidth: '85%',
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
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-input)',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
                border: '1px solid',
                borderColor: msg.sender === 'user' ? 'transparent' : 'var(--border-card)'
              }}>
                {msg.text}
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
                maxWidth: '80%'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  Execution Trace:
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
            maxWidth: '80%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.825rem', fontWeight: 600 }}>
              <Loader2 size={14} className="spin-animation" />
              <span>Orchestrating agent reasoning...</span>
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
          placeholder="Ask a question or request an action..."
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
      width: '440px',
      zIndex: 90,
      boxShadow: 'var(--shadow-lg)',
      animation: 'slideInRight 0.2s ease-out'
    }}>
      {content}
    </div>
  );
};
