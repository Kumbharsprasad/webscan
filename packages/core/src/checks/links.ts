import { Issue } from '../types';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import pLimit from 'p-limit';

export async function runLinksCheck(baseUrlStr: string, html: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const $ = cheerio.load(html);
  const links = new Set<string>();
  const baseUrl = new URL(baseUrlStr);

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      try {
        const url = new URL(href, baseUrlStr);
        // Only internal links for crawling
        if (url.hostname === baseUrl.hostname) {
          url.hash = ''; // ignore fragments
          links.add(url.toString());
        }
      } catch (e) {
        // ignore invalid URLs
      }
    }
  });

  const urlsToCrawl = Array.from(links).slice(0, 25);
  const limit = pLimit(5); // 5 concurrent requests

  const checks = urlsToCrawl.map(url => limit(async () => {
    try {
      // follow redirect chains up to 5 times natively by fetch, but let's check response
      const response = await fetch(url, { redirect: 'manual' });
      
      let finalStatus = response.status;
      let redirects = 0;
      let currentUrl = url;
      let res = response;

      while ([301, 302, 303, 307, 308].includes(res.status) && redirects < 5) {
        redirects++;
        const location = res.headers.get('location');
        if (!location) break;
        currentUrl = new URL(location, currentUrl).toString();
        res = await fetch(currentUrl, { redirect: 'manual' });
        finalStatus = res.status;
      }

      if (redirects >= 3) {
        issues.push({
          category: 'links',
          severity: 'warning',
          title: 'Long Redirect Chain',
          detail: `The link to ${url} triggered ${redirects} redirects.`,
          impact: 'Redirect chains slow down page loading and waste search engine crawl budget.',
        });
      }

      if (finalStatus >= 400) {
        issues.push({
          category: 'links',
          severity: 'critical',
          title: 'Broken Internal Link',
          detail: `The link to ${url} returned a ${finalStatus} status code.`,
          impact: 'Broken links frustrate users, stop them from navigating the site, and harm SEO.',
        });
      }
    } catch (err: any) {
      issues.push({
        category: 'links',
        severity: 'critical',
        title: 'Broken Internal Link (Error)',
        detail: `The link to ${url} failed to load: ${err.message}`,
        impact: 'Broken links frustrate users, stop them from navigating the site, and harm SEO.',
      });
    }
  }));

  await Promise.all(checks);

  return issues;
}
