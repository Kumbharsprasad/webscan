import { Issue } from '../types';

export async function runPerformanceCheck(url: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const apiKey = process.env.PSI_API_KEY;

  if (!apiKey) {
    // Skipping gracefully, return empty issues. 
    // The main scanner will handle noting this in report.errors.
    return issues;
  }

  const strategies = ['mobile', 'desktop'];
  
  for (const strategy of strategies) {
    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`PSI API returned ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const score = data?.lighthouseResult?.categories?.performance?.score;

      if (typeof score === 'number') {
        const percentage = Math.round(score * 100);
        if (percentage < 50) {
          issues.push({
            category: 'performance',
            severity: 'critical',
            title: `Poor Performance (${strategy})`,
            detail: `Lighthouse performance score is ${percentage}/100.`,
            impact: 'Poor performance leads to high bounce rates, lost conversions, and lower search engine rankings.',
          });
        } else if (percentage < 90) {
          issues.push({
            category: 'performance',
            severity: 'warning',
            title: `Needs Improvement Performance (${strategy})`,
            detail: `Lighthouse performance score is ${percentage}/100.`,
            impact: 'Improving performance can boost user engagement and conversions.',
          });
        } else {
          issues.push({
            category: 'performance',
            severity: 'info',
            title: `Good Performance (${strategy})`,
            detail: `Lighthouse performance score is ${percentage}/100.`,
            impact: 'Good performance provides an excellent user experience.',
          });
        }
      }
    } catch (e: any) {
      // Return a critical issue if PSI request fails after trying to call it
      issues.push({
        category: 'performance',
        severity: 'critical',
        title: `Performance Check Failed (${strategy})`,
        detail: `Failed to retrieve PSI data: ${e.message}`,
        impact: 'Unable to determine the performance score of the page.',
      });
    }
  }

  return issues;
}
