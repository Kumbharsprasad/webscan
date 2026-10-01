import { SynthesizedReport } from '@prasadkumbhar/webscan-agent';

export function generateHtmlReport(report: SynthesizedReport): string {
  const categoriesHtml = report.categories.map(cat => `
    <div class="category-card">
      <div class="category-header">
        <h2>${cat.name}</h2>
        <div class="category-score">
          <span class="score-val">${cat.score}</span><span class="score-max">/100</span>
        </div>
      </div>
      
      <div class="section">
        <h3 class="working-title">What is working</h3>
        <ul>
          ${cat.working.map(w => `<li>${w}</li>`).join('')}
          ${cat.working.length === 0 ? '<li class="empty-state">Nothing reported.</li>' : ''}
        </ul>
      </div>

      <div class="section">
        <h3 class="fix-title">What to fix</h3>
        <ul class="fix-list">
          ${cat.toFix.map(fix => `
            <li>
              <input type="checkbox" disabled />
              <span>${fix.description}</span>
              <span class="severity ${fix.severity}">${fix.severity}</span>
            </li>
          `).join('')}
          ${cat.toFix.length === 0 ? '<li class="empty-state">Nothing to fix!</li>' : ''}
        </ul>
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Audit Report for ${report.originalReport.url}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #fafafa; color: #111; margin: 0; padding: 0; }
    .container { max-width: 900px; margin: 0 auto; padding: 4rem 2rem; }
    .title { font-size: 3rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
    .subtitle { font-size: 1.25rem; color: #666; margin-bottom: 4rem; }
    
    .hero-scores { display: flex; gap: 2rem; margin-bottom: 4rem; }
    .hero-card { flex: 1; background: #fff; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: center; }
    .hero-card h3 { color: #666; font-size: 1rem; font-weight: 400; margin-top: 0; }
    .hero-score-val { font-size: 4rem; font-weight: bold; color: #c93e54; margin: 1rem 0 0.5rem 0; line-height: 1; }
    .hero-score-max { font-size: 1.5rem; color: #666; }
    
    .category-card { background: #fff; border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 2rem; }
    .category-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eaeaea; padding-bottom: 1.5rem; margin-bottom: 2rem; }
    .category-header h2 { margin: 0; font-size: 1.75rem; font-weight: 600; }
    .category-score { color: #c93e54; font-weight: bold; font-size: 1.25rem; }
    .score-max { color: #999; font-size: 1rem; }
    
    .working-title { color: #10b981; font-size: 1rem; margin-bottom: 1rem; }
    .fix-title { color: #c93e54; font-size: 1rem; margin-bottom: 1rem; margin-top: 2rem; }
    
    ul { list-style-type: none; padding: 0; margin: 0; }
    li { margin-bottom: 1rem; line-height: 1.6; }
    
    .fix-list li { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #f0f0f0; }
    .fix-list li:last-child { border-bottom: none; }
    
    .severity { font-size: 0.75rem; padding: 0.1rem 0.5rem; border-radius: 999px; margin-left: auto; text-transform: lowercase; }
    .severity.high { color: #c93e54; }
    .severity.medium { color: #d97706; }
    .severity.low { color: #3b82f6; }
    
    .empty-state { color: #999; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">Audit for ${new URL(report.originalReport.url).hostname}</div>
    <div class="subtitle">${report.summary}</div>

    <div class="hero-scores">
      <div class="hero-card">
        <h3>Site score</h3>
        <div class="hero-score-val">${report.overallScore}<span class="hero-score-max">/100</span></div>
      </div>
      <div class="hero-card">
        <h3>Issues found</h3>
        <div class="hero-score-val">${report.categories.reduce((acc, cat) => acc + cat.toFix.length, 0)}</div>
        <div style="color:#c93e54; margin-top:0.5rem">across ${report.categories.length} categories</div>
      </div>
    </div>

    <div class="categories">
      ${categoriesHtml}
    </div>
  </div>
</body>
</html>
  `;
}
