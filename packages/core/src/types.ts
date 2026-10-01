export type IssueCategory = 'seo' | 'structure' | 'security' | 'links' | 'techStack' | 'performance';
export type IssueSeverity = 'info' | 'warning' | 'critical';

export interface Issue {
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  detail: string;
  impact: string;
}

export interface ScanReport {
  url: string;
  timestamp: string;
  scores: {
    seo: number;
    structure: number;
    security: number;
    links: number;
    techStack: number;
    performance: number;
    overall: number;
  };
  issues: Issue[];
  errors: string[];
}

export interface ScanOptions {
  timeoutMs?: number;
}
