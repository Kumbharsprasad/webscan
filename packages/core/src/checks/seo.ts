import { Issue, IssueCategory } from '../types';
import * as cheerio from 'cheerio';

export function runSeoCheck(html: string): Issue[] {
  const issues: Issue[] = [];
  const $ = cheerio.load(html);

  const title = $('title').text();
  if (!title) {
    issues.push({
      category: 'seo',
      severity: 'critical',
      title: 'Missing Title Tag',
      detail: 'The page does not have a <title> tag.',
      impact: 'Search engines use the title tag for ranking and displaying search results. Without it, the page may not rank well.',
    });
  } else if (title.length < 10 || title.length > 60) {
    issues.push({
      category: 'seo',
      severity: 'warning',
      title: 'Title Length Suboptimal',
      detail: `The title is ${title.length} characters long. Recommended length is 10-60 characters.`,
      impact: 'Titles that are too short may lack context, while titles that are too long may be truncated in search engine results.',
    });
  }

  const metaDesc = $('meta[name="description"]').attr('content');
  if (!metaDesc) {
    issues.push({
      category: 'seo',
      severity: 'warning',
      title: 'Missing Meta Description',
      detail: 'The page does not have a meta description.',
      impact: 'Meta descriptions provide a summary of the page for search engines and users, impacting click-through rates.',
    });
  } else if (metaDesc.length < 50 || metaDesc.length > 160) {
    issues.push({
      category: 'seo',
      severity: 'info',
      title: 'Meta Description Length Suboptimal',
      detail: `The meta description is ${metaDesc.length} characters long. Recommended length is 50-160 characters.`,
      impact: 'Descriptions that are too short may not provide enough info, while those too long may be truncated in search results.',
    });
  }

  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    issues.push({
      category: 'seo',
      severity: 'info',
      title: 'Missing Canonical Tag',
      detail: 'The page does not specify a canonical URL.',
      impact: 'Canonical tags help prevent duplicate content issues by specifying the "preferred" version of a web page.',
    });
  }

  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (!ogTitle || !ogImage) {
    issues.push({
      category: 'seo',
      severity: 'info',
      title: 'Missing Open Graph Tags',
      detail: 'The page is missing essential Open Graph tags (og:title or og:image).',
      impact: 'Open Graph tags control how URLs are displayed when shared on social media. Missing tags can lead to poor previews.',
    });
  }

  const h1s = $('h1');
  if (h1s.length === 0) {
    issues.push({
      category: 'seo',
      severity: 'critical',
      title: 'Missing H1 Tag',
      detail: 'The page does not have an <h1> tag.',
      impact: 'The H1 tag is crucial for SEO as it tells search engines what the page is about.',
    });
  } else if (h1s.length > 1) {
    issues.push({
      category: 'seo',
      severity: 'warning',
      title: 'Multiple H1 Tags',
      detail: `The page has ${h1s.length} <h1> tags.`,
      impact: 'Having multiple H1 tags can confuse search engines about the primary topic of the page.',
    });
  }

  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    issues.push({
      category: 'seo',
      severity: 'critical',
      title: 'Missing Viewport Meta Tag',
      detail: 'The page does not have a viewport meta tag.',
      impact: 'Without a viewport meta tag, mobile devices will render the page at a desktop width, making it difficult to read and negatively impacting mobile SEO.',
    });
  }

  return issues;
}
