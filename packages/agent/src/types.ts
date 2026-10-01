import { Issue, ScanReport } from '@prasadkumbhar/webscan-core';

export interface AgentContext {
  businessType?: string;
}

export interface StrategicCategory {
  name: string;
  score: number;
  working: string[];
  toFix: { description: string; severity: 'high' | 'medium' | 'low' }[];
}

export interface SynthesizedReport {
  summary: string;
  overallScore: number;
  categories: StrategicCategory[];
  originalReport: ScanReport;
}

export interface LLMProvider {
  generate(prompt: string, systemInstruction?: string): Promise<string>;
}
