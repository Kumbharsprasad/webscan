import { Issue, IssueCategory, ScanOptions, ScanReport } from './types';
import { runSeoCheck } from './checks/seo';
import { runStructureCheck } from './checks/structure';
import { runSecurityCheck } from './checks/security';
import { runLinksCheck } from './checks/links';
import { runTechStackCheck } from './checks/techStack';
import { runPerformanceCheck } from './checks/performance';

export function calculateScore(issues: Issue[], category: IssueCategory): number {
  const categoryIssues = issues.filter(i => i.category === category);
  let score = 100;
  for (const issue of categoryIssues) {
    if (issue.severity === 'critical') score -= 20;
    else if (issue.severity === 'warning') score -= 8;
    else if (issue.severity === 'info') score -= 2;
  }
  return Math.max(0, score);
}

export async function scanSite(urlStr: string, opts?: ScanOptions): Promise<ScanReport> {
  const errors: string[] = [];
  const issues: Issue[] = [];
  let html = '';
  let headers: Headers = new Headers();

  try {
    const response = await fetch(urlStr, { 
      signal: opts?.timeoutMs ? AbortSignal.timeout(opts.timeoutMs) : undefined
    });
    
    if (!response.ok) {
      errors.push(`Initial fetch failed with status ${response.status}`);
    } else {
      html = await response.text();
      headers = response.headers;
    }
  } catch (e: any) {
    errors.push(`Failed to fetch ${urlStr}: ${e.message}`);
  }

  // If we couldn't even fetch the page, return early with 0 scores
  if (html === '') {
    return {
      url: urlStr,
      timestamp: new Date().toISOString(),
      scores: {
        seo: 0, structure: 0, security: 0, links: 0, techStack: 0, performance: 0, overall: 0
      },
      issues: [],
      errors
    };
  }

  if (!process.env.PSI_API_KEY) {
    errors.push('PSI_API_KEY not found in environment; skipping performance check.');
  }

  try {
    // Run checks concurrently
    const [
      seoIssues,
      structureIssues,
      securityIssues,
      linksIssues,
      techStackIssues,
      performanceIssues
    ] = await Promise.all([
      Promise.resolve(runSeoCheck(html)),
      Promise.resolve(runStructureCheck(html)),
      runSecurityCheck(urlStr, headers),
      runLinksCheck(urlStr, html),
      Promise.resolve(runTechStackCheck(html, headers)),
      runPerformanceCheck(urlStr)
    ]);

    issues.push(...seoIssues, ...structureIssues, ...securityIssues, ...linksIssues, ...techStackIssues, ...performanceIssues);
  } catch (e: any) {
    errors.push(`Error running checks: ${e.message}`);
  }

  const scores = {
    seo: calculateScore(issues, 'seo'),
    structure: calculateScore(issues, 'structure'),
    security: calculateScore(issues, 'security'),
    links: calculateScore(issues, 'links'),
    techStack: calculateScore(issues, 'techStack'),
    performance: calculateScore(issues, 'performance'),
    overall: 0
  };

  scores.overall = Math.round(
    (scores.seo + scores.structure + scores.security + scores.links + scores.techStack + scores.performance) / 6
  );

  return {
    url: urlStr,
    timestamp: new Date().toISOString(),
    scores,
    issues,
    errors
  };
}
