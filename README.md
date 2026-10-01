# Webscan

A lightweight, intelligent website auditing tool. Webscan can perform concurrent checks for SEO, structure/accessibility, security, broken links, performance (via Google PageSpeed Insights), and tech stack fingerprinting. It includes an AI agent layer that performs deep semantic analysis of the website and prioritizes issues by actual business impact and marketing strategy.

## Packages
- **`@webscan/core`**: Framework-agnostic scanning engine.
- **`@webscan/agent`**: LLM reasoning layer for intelligent strategic summaries.
- **`@webscan/cli`**: Terminal tool for fast audits and batch processing.
- **`@webscan/widget`**: Embeddable script for client sites (lead generation).
- **`apps/web`**: Next.js hosted version of the auditing tool.

## Using the CLI

You can easily run Webscan from your terminal. If the package is published to NPM, you can run it instantly using `npx` without needing to clone this repository:

\`\`\`bash
# Run a quick terminal scan
npx @webscan/cli scan https://example.com

# Generate a detailed HTML report
npx @webscan/cli scan https://example.com --out report.html
\`\`\`

Alternatively, you can install it globally to use the `webscan` command anywhere:
\`\`\`bash
npm install -g @webscan/cli

webscan scan https://example.com --out report.html
\`\`\`

### Supplying API Keys (Environment Variables)

Webscan's AI evaluation engine supports multiple LLM providers (Groq, OpenAI, and Gemini). It uses an **LLM Gateway** that automatically falls back if a provider is unavailable.

You can supply these keys by passing them directly in your terminal command:

\`\`\`bash
# Using Groq (Recommended - Fast inference)
GROQ_API_KEY=your_key npx @webscan/cli scan https://example.com --out report.html

# Using OpenAI
OPENAI_API_KEY=your_key npx @webscan/cli scan https://example.com --out report.html

# Using Gemini
GEMINI_API_KEY=your_key npx @webscan/cli scan https://example.com --out report.html
\`\`\`

Webscan also uses Google PageSpeed Insights for performance checks. You can include `PSI_API_KEY=your_key` in the same way. If no LLM API key is provided (or if all APIs fail), the CLI will gracefully drop down to a deterministic, offline summary mode.

## Local Development

To run this monorepo locally from a clean clone:

\`\`\`bash
# Install dependencies
npm install

# Build all packages
npm run build -ws

# Run tests
npm run test -ws

# Run the CLI locally
npx webscan scan https://example.com
\`\`\`

## License
MIT
