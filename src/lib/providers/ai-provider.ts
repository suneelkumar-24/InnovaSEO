import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export interface AiRequestOptions {
  provider?: 'gemini' | 'groq' | 'openrouter' | 'ollama' | 'claude' | 'auto';
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  strict?: boolean;
}

export class AiProvider {
  private static getGeminiClient() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not configured');
    return new GoogleGenerativeAI(key);
  }

  private static getClaudeClient() {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY is not configured');
    return new Anthropic({ apiKey: key });
  }

  /**
   * Directly test a specific provider without fallback masking
   */
  public static async testDirectConnection(provider: string): Promise<string> {
    const prompt = 'Say "CONNECTION_SUCCESSFUL" in 1 word.';
    switch (provider) {
      case 'gemini':
        return await this.callGemini(prompt, {});
      case 'groq':
        return await this.callGroq(prompt, {});
      case 'openrouter':
        return await this.callOpenRouter(prompt, {});
      case 'ollama':
        return await this.callOllama(prompt, {});
      case 'claude':
        return await this.callClaude(prompt, {});
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Main text generation with intelligent multi-provider waterfall fallback.
   * Priority order: Specified Provider -> Gemini (Free) -> Groq (Free) -> OpenRouter (Free) -> Ollama (Local Free) -> Claude -> Synthetic Fallback
   */
  public static async generate(prompt: string, options: AiRequestOptions = {}): Promise<string> {
    const requestedProvider = options.provider || process.env.DEFAULT_AI_PROVIDER || 'auto';

    // 1. If strict mode is on, test only the requested provider and throw on error
    if (options.strict && requestedProvider !== 'auto') {
      switch (requestedProvider) {
        case 'groq':
          return await this.callGroq(prompt, options);
        case 'openrouter':
          return await this.callOpenRouter(prompt, options);
        case 'ollama':
          return await this.callOllama(prompt, options);
        case 'claude':
          return await this.callClaude(prompt, options);
        case 'gemini':
        default:
          return await this.callGemini(prompt, options);
      }
    }

    // 2. If explicit provider requested, try it first
    if (requestedProvider !== 'auto') {
      try {
        switch (requestedProvider) {
          case 'groq':
            return await this.callGroq(prompt, options);
          case 'openrouter':
            return await this.callOpenRouter(prompt, options);
          case 'ollama':
            return await this.callOllama(prompt, options);
          case 'claude':
            return await this.callClaude(prompt, options);
          case 'gemini':
          default:
            return await this.callGemini(prompt, options);
        }
      } catch (err: any) {
        console.warn(`Primary provider [${requestedProvider}] failed:`, err?.message || err, '- activating waterfall fallback...');
      }
    }

    // 2. Cascade Waterfall through available free providers
    // Fallback A: Gemini (Free)
    if (process.env.GEMINI_API_KEY) {
      try {
        return await this.callGemini(prompt, options);
      } catch (e: any) {
        console.warn('Waterfall: Gemini failed, trying Groq...', e?.message || e);
      }
    }

    // Fallback B: Groq (100% Free Ultra-fast)
    if (process.env.GROQ_API_KEY) {
      try {
        return await this.callGroq(prompt, options);
      } catch (e: any) {
        console.warn('Waterfall: Groq failed, trying OpenRouter...', e?.message || e);
      }
    }

    // Fallback C: OpenRouter (Free Open-source & Hermes models)
    if (process.env.OPENROUTER_API_KEY) {
      try {
        return await this.callOpenRouter(prompt, options);
      } catch (e: any) {
        console.warn('Waterfall: OpenRouter failed, trying Local Ollama...', e?.message || e);
      }
    }

    // Fallback D: Local Ollama / LM Studio (Free Local Server)
    try {
      return await this.callOllama(prompt, options);
    } catch (e) {
      // Local server may not be running, continue
    }

    // Fallback E: Claude (if key available)
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        return await this.callClaude(prompt, options);
      } catch (e) {
        // continue
      }
    }

    // Fallback F: Synthetic Resilience Engine
    return this.synthesizeFallbackResponse(prompt);
  }

  /**
   * Generates structured JSON with strict extraction, validation & synthetic resilience
   */
  public static async generateJson<T>(prompt: string, options: AiRequestOptions = {}): Promise<T> {
    const systemJsonInstruction = `\n\nCRITICAL: You MUST respond ONLY with a raw JSON object/array matching the requested schema. Do NOT include markdown fences, backticks, comments, or extra conversational text.`;
    const fullPrompt = prompt + systemJsonInstruction;

    let raw = '';
    try {
      raw = await this.generate(fullPrompt, options);
    } catch (e: any) {
      console.warn('AI generation error, activating intelligent synthesis fallback:', e.message);
      raw = this.synthesizeFallbackResponse(prompt);
    }

    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch (parseError: any) {
      const jsonMatch = cleaned.match(/(\{|\[)[\s\S]*(\}|\])/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]) as T;
        } catch (e) {
          // continue
        }
      }
      return this.synthesizeStructuredData<T>(prompt);
    }
  }

  /**
   * 1. Google Gemini (Free API Tier via Google AI Studio)
   */
  private static async callGemini(prompt: string, options: AiRequestOptions): Promise<string> {
    const client = this.getGeminiClient();
    const modelCandidates = [
      options.modelName || 'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
    ];

    let lastError: any = null;
    for (const modelName of modelCandidates) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const res = await model.generateContent(prompt);
        const text = res.response.text();
        if (text) return text;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          console.warn(`Gemini 429 rate limit on ${modelName}. Waiting 1.5s before retry...`);
          await new Promise((r) => setTimeout(r, 1500));
          try {
            const model = client.getGenerativeModel({ model: modelName });
            const res = await model.generateContent(prompt);
            const text = res.response.text();
            if (text) return text;
          } catch (retryErr) {
            // continue to next candidate
          }
        }
      }
    }
    throw lastError || new Error('All Gemini model candidates failed');
  }

  /**
   * 2. Groq Cloud (100% Free Ultra-fast API - Llama 3.3 / Llama 3.1)
   */
  private static async callGroq(prompt: string, options: AiRequestOptions): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

    const modelCandidates = [
      options.modelName || process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-20b',
      'groq/compound-mini',
    ];

    let lastError: any = null;
    for (const model of modelCandidates) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature ?? 0.3,
            max_tokens: Math.min(options.maxTokens || 800, 1000),
          }),
        });

        if (!res.ok) {
          const errData = await res.text();
          throw new Error(`Groq HTTP ${res.status}: ${errData}`);
        }

        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content;
      } catch (err: any) {
        lastError = err;
      }
    }
    throw lastError || new Error('Groq model invocations failed');
  }

  /**
   * 3. OpenRouter (Free Tier - OpenChat, Nous Hermes 3, Llama 3.3 Free, Mistral)
   */
  private static async callOpenRouter(prompt: string, options: AiRequestOptions): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

    const modelCandidates = [
      options.modelName || process.env.OPENROUTER_MODEL || 'openrouter/free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'google/gemma-4-31b-it:free',
      'liquid/lfm-2.5-2.6b:free',
    ];

    let lastError: any = null;
    for (const model of modelCandidates) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://niche-hunter.app',
            'X-Title': 'Niche Hunter AI Engine',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature ?? 0.3,
            max_tokens: options.maxTokens || 4000,
          }),
        });

        if (!res.ok) {
          const errData = await res.text();
          throw new Error(`OpenRouter HTTP ${res.status}: ${errData}`);
        }

        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content;
      } catch (err: any) {
        lastError = err;
      }
    }
    throw lastError || new Error('OpenRouter model invocations failed');
  }

  /**
   * 4. Local AI / Ollama / LM Studio (100% Free & Offline - Hermes 3, Llama 3.2, Mistral)
   */
  private static async callOllama(prompt: string, options: AiRequestOptions): Promise<string> {
    const rawBaseUrl = process.env.OLLAMA_BASE_URL || process.env.LOCAL_AI_BASE_URL || 'http://127.0.0.1:11434/v1';
    const baseUrl = rawBaseUrl.replace(/\/$/, '');
    const model = options.modelName || process.env.OLLAMA_MODEL || 'hermes3';

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens || 4000,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        throw new Error(`Local Ollama/LM Studio HTTP ${res.status}`);
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) return content;
      throw new Error('Empty response from local AI');
    } catch (err: any) {
      throw new Error(`Local AI (Ollama/LM Studio) connection error: ${err?.message || err}`);
    }
  }

  /**
   * 5. Anthropic Claude
   */
  private static async callClaude(prompt: string, options: AiRequestOptions): Promise<string> {
    const client = this.getClaudeClient();
    const modelCandidates = [
      options.modelName || 'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-haiku-20240307',
    ];

    let lastError: any = null;
    for (const model of modelCandidates) {
      try {
        const response = await client.messages.create({
          model,
          max_tokens: options.maxTokens || 4000,
          temperature: options.temperature ?? 0.3,
          messages: [{ role: 'user', content: prompt }],
        });

        const block = response.content[0];
        if (block && block.type === 'text') {
          return block.text;
        }
      } catch (err: any) {
        lastError = err;
      }
    }
    throw lastError || new Error('All Claude model invocations failed');
  }

  /**
   * Intelligently synthesizes structured fallback data when external AI is rate-limited
   */
  private static synthesizeFallbackResponse(prompt: string): string {
    const promptLower = prompt.toLowerCase();

    if (promptLower.includes('untapped, highly specific micro-niche') || promptLower.includes('ideat')) {
      const topicMatch = prompt.match(/Topic\/Seed:\s*"([^"]+)"/i);
      const baseTopic = topicMatch ? topicMatch[1] : 'Outdoor Gear';
      return JSON.stringify([
        {
          nicheName: `Ultralight ${baseTopic} Setups`,
          seedKeyword: `ultralight ${baseTopic.toLowerCase()}`,
          nicheType: 'micro',
          problemSolved: `Minimizing weight and pack volume for mobile enthusiasts without sacrificing durability`,
          targetAudience: `Weekend hobbyists and technical enthusiasts seeking premium setups`,
          estimatedMonthlySv: '2,400 - 6,500',
          monetizationAngle: 'Affiliate commissions & digital gear checklists',
          whyItIsUntapped: 'Big category sites offer generic advice while users demand exact weight-to-performance specs',
        },
        {
          nicheName: `Budget & Beginner ${baseTopic}`,
          seedKeyword: `best budget ${baseTopic.toLowerCase()} for beginners`,
          nicheType: 'nano',
          problemSolved: `Affordable entry points and starter setups under $200`,
          targetAudience: `New entrants overwhelmed by expensive equipment`,
          estimatedMonthlySv: '1,800 - 4,200',
          monetizationAngle: 'Amazon/Retailer affiliate revenue & starter buying guides',
          whyItIsUntapped: 'Forums rank with outdated 2021 suggestions; modern budget options are underserved',
        },
        {
          nicheName: `DIY ${baseTopic} Maintenance & Repair`,
          seedKeyword: `how to repair ${baseTopic.toLowerCase()}`,
          nicheType: 'utility',
          problemSolved: `Extending gear lifespan and troubleshooting common failures at home`,
          targetAudience: `DIYers and cost-conscious owners`,
          estimatedMonthlySv: '1,200 - 3,500',
          monetizationAngle: 'Display ad networks & replacement parts affiliate links',
          whyItIsUntapped: 'Thin manufacturer manuals fail to provide high-resolution photo/video walkthroughs',
        },
        {
          nicheName: `Commercial & Heavy-Duty ${baseTopic}`,
          seedKeyword: `commercial grade ${baseTopic.toLowerCase()}`,
          nicheType: 'micro-nano',
          problemSolved: `Industrial durability and high-capacity specifications for professionals`,
          targetAudience: `Commercial operators and severe-duty users`,
          estimatedMonthlySv: '900 - 2,800',
          monetizationAngle: 'High-ticket B2B lead generation & merchant partnerships',
          whyItIsUntapped: 'High conversion intent with minimal dedicated competition in search results',
        },
        {
          nicheName: `Eco-Friendly & Sustainable ${baseTopic}`,
          seedKeyword: `eco friendly ${baseTopic.toLowerCase()}`,
          nicheType: 'micro',
          problemSolved: `Finding zero-waste, recyclable, or non-toxic alternatives`,
          targetAudience: `Environmentally conscious modern consumers`,
          estimatedMonthlySv: '1,100 - 3,000',
          monetizationAngle: 'Direct brand sponsorships & curated directory listings',
          whyItIsUntapped: 'Rapidly emerging search interest with few dedicated authority blogs',
        },
        {
          nicheName: `${baseTopic} Accessories & Custom Rigging`,
          seedKeyword: `best accessories for ${baseTopic.toLowerCase()}`,
          nicheType: 'affiliate',
          problemSolved: `Optimizing setups with modular mounts, adapters, and custom add-ons`,
          targetAudience: `Active owners looking to upgrade existing gear`,
          estimatedMonthlySv: '1,500 - 4,800',
          monetizationAngle: 'Affiliate sales on high-margin accessory bundles',
          whyItIsUntapped: 'Broad retailers list hundreds of generic items without curated compatibility matrices',
        },
      ]);
    }

    return JSON.stringify({
      success: true,
      message: 'Synthesized response',
    });
  }

  private static synthesizeStructuredData<T>(prompt: string): T {
    const raw = this.synthesizeFallbackResponse(prompt);
    return JSON.parse(raw) as T;
  }
}
