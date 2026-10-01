import { Issue } from '../types';
import * as cheerio from 'cheerio';

export function runTechStackCheck(html: string, headers: Headers): Issue[] {
  const issues: Issue[] = [];
  const $ = cheerio.load(html);
  
  const techStack = new Set<string>();

  // Check headers
  const poweredBy = headers.get('x-powered-by');
  if (poweredBy) {
    if (poweredBy.toLowerCase().includes('next.js')) techStack.add('Next.js');
    else if (poweredBy.toLowerCase().includes('express')) techStack.add('Express');
    else if (poweredBy.toLowerCase().includes('php')) techStack.add('PHP');
  }

  const server = headers.get('server');
  if (server) {
    if (server.toLowerCase().includes('cloudflare')) techStack.add('Cloudflare');
    else if (server.toLowerCase().includes('nginx')) techStack.add('Nginx');
  }

  // Check meta generator
  const generator = $('meta[name="generator"]').attr('content');
  if (generator) {
    if (generator.toLowerCase().includes('wordpress')) techStack.add('WordPress');
    else if (generator.toLowerCase().includes('shopify')) techStack.add('Shopify');
    else if (generator.toLowerCase().includes('webflow')) techStack.add('Webflow');
  }

  // Check static assets
  const scripts = $('script[src]').map((_, el) => $(el).attr('src')).get();
  if (scripts.some(src => src.includes('_next/static'))) techStack.add('Next.js');
  if (scripts.some(src => src.includes('wp-content') || src.includes('wp-includes'))) techStack.add('WordPress');
  if (scripts.some(src => src.includes('cdn.shopify.com'))) techStack.add('Shopify');
  
  if (techStack.size > 0) {
    issues.push({
      category: 'techStack',
      severity: 'info',
      title: 'Technology Stack Detected',
      detail: `Detected technologies: ${Array.from(techStack).join(', ')}`,
      impact: 'Understanding the tech stack can help tailor further audits or uncover known vulnerabilities specific to these platforms.',
    });
  } else {
    issues.push({
      category: 'techStack',
      severity: 'info',
      title: 'Technology Stack Unknown',
      detail: 'Could not reliably detect the underlying CMS or framework.',
      impact: 'No specific business impact, but makes the audit less tailored.',
    });
  }

  return issues;
}
