# Webscan

A lightweight, intelligent website auditing tool. Webscan can perform concurrent checks for SEO, structure/accessibility, security, broken links, performance (via Google PageSpeed Insights), and tech stack fingerprinting. It includes an AI agent layer that prioritizes issues by actual business impact and generates non-technical summaries.

## Packages
- **`@webscan/core`**: Framework-agnostic scanning engine.
- **`@webscan/agent`**: LLM reasoning layer for intelligent summaries and follow-ups.
- **`@webscan/cli`**: Terminal tool for fast audits and batch processing.
- **`@webscan/widget`**: Embeddable script for client sites (lead generation).
- **`apps/web`**: Next.js hosted version of the auditing tool.

## Quickstart

You can run the CLI tool without a global install:

\`\`\`bash
npx webscan scan https://example.com
\`\`\`

To generate an HTML report:
\`\`\`bash
npx webscan scan https://example.com --out report.html
\`\`\`

### Environment Variables

Webscan uses two optional environment variables:
- **`GEMINI_API_KEY`**: Enables the AI agent synthesis layer. If not provided, the agent falls back to a deterministic rule-based summary (zero dependencies).
- **`PSI_API_KEY`**: Enables the Google PageSpeed Insights checks. If not provided, the performance check gracefully skips.

You can set these in your terminal, or create a `.env` file in the root of the project:

\`\`\`
GEMINI_API_KEY=your_gemini_api_key
PSI_API_KEY=your_psi_api_key
\`\`\`

## Local Development

To run this monorepo locally from a clean clone:

\`\`\`bash
# Install dependencies
npm install

# Build all packages
npm run build -ws

# Run tests
npm run test -ws
\`\`\`

## License
MIT
