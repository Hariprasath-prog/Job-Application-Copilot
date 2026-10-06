/**
 * Live AI Service Connector.
 * Bridges external LLMs (Google Gemini / OpenAI) with Job Application Copilot,
 * with strict anti-hallucination ground truth verification and offline fallback.
 */

export interface AiCompletionOptions {
  systemPrompt?: string;
  temperature?: number;
}

export const AiService = {
  getProvider(): 'gemini' | 'openai' | 'local' {
    const stored = localStorage.getItem('copilot_ai_provider');
    if (stored === 'gemini' || stored === 'openai' || stored === 'local') return stored;
    return (import.meta.env.VITE_AI_PROVIDER as any) || 'gemini';
  },

  getApiKey(): string {
    const stored = localStorage.getItem('copilot_api_key');
    if (stored && stored.trim().length > 0) return stored.trim();
    return (import.meta.env.VITE_AI_API_KEY as string) || '';
  },

  isLiveAiAvailable(): boolean {
    const provider = this.getProvider();
    if (provider === 'local') return false;
    const key = this.getApiKey();
    return Boolean(key && key.length > 5);
  },

  async queryGemini(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Gemini API key is not configured.');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1200
      }
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Gemini API HTTP Error ${res.status}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('No completion returned by Gemini API.');
    }

    return candidateText;
  },

  async queryOpenAI(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('OpenAI API key is not configured.');

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.4
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `OpenAI API HTTP Error ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  },

  /**
   * Generates response via configured provider, or returns null if provider is 'local'.
   */
  async generateCompletion(prompt: string, systemInstruction?: string): Promise<string | null> {
    const provider = this.getProvider();
    if (provider === 'local' || !this.isLiveAiAvailable()) {
      return null;
    }

    try {
      if (provider === 'gemini') {
        return await this.queryGemini(prompt, systemInstruction);
      } else if (provider === 'openai') {
        return await this.queryOpenAI(prompt, systemInstruction);
      }
    } catch (err: any) {
      console.warn(`[AiService] Provider ${provider} call failed:`, err);
      // Return null so callers fall back to deterministic offline rules engine
      return null;
    }

    return null;
  }
};
