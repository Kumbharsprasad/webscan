import { ScanReport, scanSite } from '@prasadkumbhar/webscan-core';
import { AgentContext, LLMProvider, SynthesizedReport } from './types';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { GroqProvider } from './providers/groq';
import * as cheerio from 'cheerio';

export class LLMGateway implements LLMProvider {
  private providers: LLMProvider[] = [];

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.providers.push(new GroqProvider(process.env.GROQ_API_KEY));
    }
    if (process.env.OPENAI_API_KEY) {
      this.providers.push(new OpenAIProvider(process.env.OPENAI_API_KEY));
    }
    if (process.env.GEMINI_API_KEY) {
      this.providers.push(new GeminiProvider(process.env.GEMINI_API_KEY));
    }
  }

  get hasProviders() {
    return this.providers.length > 0;
  }

  async generate(prompt: string, systemInstruction?: string): Promise<string> {
    if (this.providers.length === 0) {
      throw new Error('No LLM providers configured');
    }

    let lastError: Error | null = null;
    
    for (const provider of this.providers) {
      try {
        console.log(`\n[Gateway] Attempting generation with ${provider.constructor.name}...`);
        return await provider.generate(prompt, systemInstruction);
      } catch (err: any) {
        console.warn(`[Gateway] ${provider.constructor.name} failed:`, err.message);
        lastError = err;
      }
    }
    
    throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
  }
}

export class Agent {
  private gateway: LLMGateway;
  private maxFollowups = 2;

  constructor() {
    this.gateway = new LLMGateway();
  }

  async synthesize(report: ScanReport, context?: AgentContext): Promise<SynthesizedReport> {
    let currentReport = report;
    let followups = 0;

    let pageText = '';
    try {
      const res = await fetch(currentReport.url);
      const html = await res.text();
      const $ = cheerio.load(html);
      // Remove scripts and styles
      $('script, style, noscript, iframe, svg').remove();
      pageText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 15000); // Send up to 15k chars of visible text
    } catch (e) {
      console.warn('Failed to fetch page text for agent analysis', e);
    }

    if (this.gateway.hasProviders) {
      while (followups <= this.maxFollowups) {
        try {
          const responseText = await this.callLLM(currentReport, pageText, context);
          
          const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
             throw new Error('LLM did not return JSON');
          }
          
          const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);

          if (parsed.followUpUrls && Array.isArray(parsed.followUpUrls) && parsed.followUpUrls.length > 0 && followups < this.maxFollowups) {
            const followUpReports = await Promise.all(
              parsed.followUpUrls.slice(0, 2).map((url: string) => scanSite(url))
            );
            for (const r of followUpReports) {
               currentReport.issues.push(...r.issues);
            }
            followups++;
          } else {
             return {
               summary: parsed.summary,
               overallScore: parsed.overallScore || 0,
               categories: parsed.categories || [],
               originalReport: currentReport
             };
          }
        } catch (e) {
          console.warn('\n[Agent] LLM synthesis failed, falling back to deterministic summary. Error:', e instanceof Error ? e.message : e);
          break; 
        }
      }
    }

    return this.deterministicFallback(currentReport, context);
  }

  private async callLLM(report: ScanReport, pageText: string, context?: AgentContext): Promise<string> {
    const prompt = `
You are an expert strategic web auditor and brand consultant.
Evaluate the provided website data against the following 9 strategic categories:
1. Positioning
2. Differentiation
3. Target audience
4. Website structure
5. Social proof
6. Brand consistency
7. Conversion paths
8. SEO and AEO
9. Metadata and technical

Website URL: ${report.url}

Visible Page Text (up to 15k chars):
${pageText}

Technical Scan Data (JSON):
${JSON.stringify(report, null, 2)}

For EACH of the 9 categories, provide:
- A score out of 100 based on how well the site performs in that category.
- "working": An array of strings describing what is working well.
- "toFix": An array of objects describing actionable things to fix. Each object must have a "description" and a "severity" ("high", "medium", or "low").

Also provide an "overallScore" out of 100, and a concise 1-sentence "summary" summarizing the overall strategic state of the site.
Optional: If you think specific internal pages need scanning to evaluate "Website structure" or "Brand consistency", add 1-2 URLs to the "followUpUrls" array.

Output strictly valid JSON with this exact structure:
{
  "summary": "...",
  "overallScore": 85,
  "followUpUrls": [],
  "categories": [
    {
      "name": "Positioning",
      "score": 40,
      "working": ["Clear tagline."],
      "toFix": [
        { "description": "Add an H1 on the homepage that names the audience.", "severity": "high" }
      ]
    }
  ]
}
    `;

    return this.gateway.generate(prompt, "You are a strategic web auditing AI. Output strictly valid JSON.");
  }

  private deterministicFallback(report: ScanReport, context?: AgentContext): SynthesizedReport {
    const categories = [
      'Positioning', 'Differentiation', 'Target audience', 'Website structure',
      'Social proof', 'Brand consistency', 'Conversion paths', 'SEO and AEO', 'Metadata and technical'
    ].map(name => ({
      name,
      score: report.scores.overall || 50,
      working: ['Fallback mode: Could not fully evaluate.'],
      toFix: [] as { description: string, severity: 'high' | 'medium' | 'low' }[]
    }));

    // Map technical issues into the last two categories
    const techCat = categories.find(c => c.name === 'Metadata and technical')!;
    const seoCat = categories.find(c => c.name === 'SEO and AEO')!;

    report.issues.forEach(i => {
      const severity = i.severity === 'critical' ? 'high' : i.severity === 'warning' ? 'medium' : 'low';
      if (i.category === 'seo') {
        seoCat.toFix.push({ description: i.title + ': ' + i.detail, severity });
      } else {
        techCat.toFix.push({ description: i.title + ': ' + i.detail, severity });
      }
    });

    return {
      summary: "Deterministic fallback summary due to LLM error. Semantic evaluation is limited.",
      overallScore: report.scores.overall,
      categories,
      originalReport: report
    };
  }
}
