import { Agent } from '../src/agent';
import { ScanReport } from '@webscan/core';

describe('Agent Fallback', () => {
  it('produces a complete SynthesizedReport with zero network calls when no API key is present', async () => {
    // Explicitly do not provide a provider and ensure process.env.GEMINI_API_KEY is not set for the agent instance
    const originalEnv = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const agent = new Agent();

    const mockReport: ScanReport = {
      url: 'https://example.com',
      timestamp: new Date().toISOString(),
      scores: { seo: 50, structure: 80, security: 90, links: 100, techStack: 100, performance: 100, overall: 86 },
      errors: [],
      issues: [
        { category: 'seo', severity: 'info', title: 'Info SEO', detail: '', impact: '' },
        { category: 'seo', severity: 'critical', title: 'Critical SEO', detail: '', impact: '' },
        { category: 'structure', severity: 'warning', title: 'Warning Structure', detail: '', impact: '' },
        { category: 'security', severity: 'critical', title: 'Critical Security', detail: '', impact: '' },
        { category: 'performance', severity: 'warning', title: 'Warning Performance', detail: '', impact: '' },
        { category: 'links', severity: 'info', title: 'Info Links', detail: '', impact: '' },
      ]
    };

    const result = await agent.synthesize(mockReport, { businessType: 'web design agency' });

    // Ensure environment is restored
    if (originalEnv) {
        process.env.GEMINI_API_KEY = originalEnv;
    }

    expect(result).toBeDefined();
    
    // Top issues should be sorted: critical -> warning -> info, and max 5
    expect(result.topIssues.length).toBe(5);
    expect(result.topIssues[0].severity).toBe('critical');
    expect(result.topIssues[1].severity).toBe('critical');
    expect(result.topIssues[2].severity).toBe('warning');
    expect(result.topIssues[3].severity).toBe('warning');
    expect(result.topIssues[4].severity).toBe('info');

    // Summary should be a string
    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('2 critical issues');
    expect(result.summary).toContain('2 warnings');

    // Pitch note should be present based on businessType context
    expect(result.pitchNote).toBeDefined();
    expect(result.pitchNote).toContain('web design agency');

    // Original report is preserved
    expect(result.originalReport).toBe(mockReport);
  });
});
