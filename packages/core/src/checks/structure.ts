import { Issue } from '../types';
import * as cheerio from 'cheerio';

export function runStructureCheck(html: string): Issue[] {
  const issues: Issue[] = [];
  const $ = cheerio.load(html);

  // Missing doctype (cheerio strips it sometimes, but we can check the original html string loosely)
  if (!/<!DOCTYPE\s+html/i.test(html.slice(0, 500))) {
    issues.push({
      category: 'structure',
      severity: 'critical',
      title: 'Missing DOCTYPE',
      detail: 'The document does not start with an HTML5 DOCTYPE.',
      impact: 'A missing DOCTYPE can trigger quirks mode in browsers, leading to inconsistent rendering and potential breakage.',
    });
  }

  const lang = $('html').attr('lang');
  if (!lang) {
    issues.push({
      category: 'structure',
      severity: 'warning',
      title: 'Missing Lang Attribute',
      detail: 'The <html> tag is missing a "lang" attribute.',
      impact: 'Screen readers use the lang attribute to determine correct pronunciation. Missing it harms accessibility.',
    });
  }

  $('img').each((_, el) => {
    const alt = $(el).attr('alt');
    const src = $(el).attr('src');
    if (typeof alt !== 'string') {
      issues.push({
        category: 'structure',
        severity: 'warning',
        title: 'Image Missing Alt Text',
        detail: `Image with src "${src || 'unknown'}" is missing an alt attribute.`,
        impact: 'Alt text is essential for screen reader users and for SEO context.',
      });
    }
  });

  // Check heading hierarchy
  let previousLevel = 0;
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const level = parseInt(el.tagName.replace('h', ''), 10);
    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push({
        category: 'structure',
        severity: 'info',
        title: 'Skipped Heading Level',
        detail: `Heading level jumped from H${previousLevel} to H${level}.`,
        impact: 'Skipping heading levels can confuse screen reader users who rely on headings to navigate content structure.',
      });
    }
    previousLevel = level;
  });

  return issues;
}
