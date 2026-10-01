import * as fs from 'fs';
import * as path from 'path';
import { runSeoCheck } from '../src/checks/seo';
import { runStructureCheck } from '../src/checks/structure';
import { runTechStackCheck } from '../src/checks/techStack';
import { calculateScore } from '../src/scanner';
import { Issue } from '../src/types';

describe('Scanner Core', () => {
  const perfectHtml = fs.readFileSync(path.join(__dirname, 'fixtures', 'perfect.html'), 'utf-8');
  const badHtml = fs.readFileSync(path.join(__dirname, 'fixtures', 'bad.html'), 'utf-8');

  describe('Scoring Logic', () => {
    it('calculates score correctly', () => {
      const issues: Issue[] = [
        { category: 'seo', severity: 'critical', title: '', detail: '', impact: '' }, // -20
        { category: 'seo', severity: 'warning', title: '', detail: '', impact: '' },  // -8
        { category: 'seo', severity: 'info', title: '', detail: '', impact: '' },     // -2
      ];
      
      const score = calculateScore(issues, 'seo');
      expect(score).toBe(70); // 100 - 20 - 8 - 2
    });

    it('floors score at 0', () => {
      const issues: Issue[] = Array(6).fill({ category: 'seo', severity: 'critical', title: '', detail: '', impact: '' }); // 6 * -20 = -120
      const score = calculateScore(issues, 'seo');
      expect(score).toBe(0);
    });
  });

  describe('SEO Check', () => {
    it('finds no issues in perfect html', () => {
      const issues = runSeoCheck(perfectHtml);
      expect(issues.length).toBe(0);
    });

    it('finds issues in bad html', () => {
      const issues = runSeoCheck(badHtml);
      expect(issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Title Length Suboptimal' }),
          expect.objectContaining({ title: 'Missing Meta Description' }),
          expect.objectContaining({ title: 'Missing H1 Tag' }),
          expect.objectContaining({ title: 'Missing Viewport Meta Tag' })
        ])
      );
    });
  });

  describe('Structure Check', () => {
    it('finds no issues in perfect html', () => {
      const issues = runStructureCheck(perfectHtml);
      expect(issues.length).toBe(0);
    });

    it('finds issues in bad html', () => {
      const issues = runStructureCheck(badHtml);
      expect(issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Missing DOCTYPE' }),
          expect.objectContaining({ title: 'Missing Lang Attribute' }),
          expect.objectContaining({ title: 'Image Missing Alt Text' })
        ])
      );
    });
  });

  describe('Tech Stack Check', () => {
    it('detects WordPress from perfect html', () => {
      const headers = new Headers();
      const issues = runTechStackCheck(perfectHtml, headers);
      expect(issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ detail: expect.stringContaining('WordPress') })
        ])
      );
    });
  });
});
