# Webscan 🚀

A lightweight, highly intelligent website auditing tool designed for agencies, developers, and marketers. Webscan performs concurrent checks for SEO, structure, accessibility, security, broken links, performance, and tech stack fingerprinting. 

Unlike traditional technical scanners, Webscan features an **AI Agent Layer** that performs deep semantic analysis of the website's text to grade its positioning, differentiation, target audience messaging, and more—outputting a customer-ready strategic report.

---

## 📦 Features

- **Blazing Fast**: Runs multiple web checks concurrently.
- **AI-Powered Insights**: Uses Groq, OpenAI, or Gemini to understand the actual business context of a website.
- **Graceful Degradation**: If AI providers are down or no API keys are provided, it falls back to a deterministic, offline rule-based grading system.
- **Multiple Output Formats**: View results directly in the terminal, or export a stunning, standalone HTML report.
- **Embeddable Widget**: Drop a small script on your agency's site to let prospective clients scan their own sites (lead generation).

---

## 🚀 Using the CLI

You can easily run Webscan from your terminal anywhere on your computer.

### Option 1: Run instantly with `npx` (No install required)

To run a quick audit and print the results to your terminal:
\`\`\`bash
npx @prasadkumbhar/webscan-cli scan https://example.com
\`\`\`

To generate a detailed, beautifully styled HTML report file:
\`\`\`bash
npx @prasadkumbhar/webscan-cli scan https://example.com --out report.html
\`\`\`

### Option 2: Install globally

If you plan to use it often, you can install the CLI globally on your machine:
\`\`\`bash
npm install -g @prasadkumbhar/webscan-cli

# Now you can use the 'webscan' command anywhere!
webscan scan https://example.com --out report.html
\`\`\`

---

## 🔑 Supplying API Keys for AI Analysis

By default, Webscan runs offline. To unlock the deep strategic AI insights, you must supply an API key. Webscan uses a fault-tolerant **LLM Gateway** that tries providers in the following order: `Groq -> OpenAI -> Gemini`.

Here is how you pass the key to the command based on your terminal:

### Command Prompt (`cmd.exe`) on Windows:
Use the `set` command followed by `&&`.
\`\`\`cmd
set GROQ_API_KEY=your_key_here && npx @prasadkumbhar/webscan-cli scan https://example.com --out report.html
\`\`\`

### PowerShell on Windows:
Use `$env:` and wrap your key in quotation marks.
\`\`\`powershell
$env:GROQ_API_KEY="your_key_here"; npx @prasadkumbhar/webscan-cli scan https://example.com --out report.html
\`\`\`

### Mac / Linux / Git Bash:
Pass the environment variable directly before the command.
\`\`\`bash
GROQ_API_KEY=your_key_here npx @prasadkumbhar/webscan-cli scan https://example.com --out report.html
\`\`\`

*(Supported environment variables: `GROQ_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, and `PSI_API_KEY` for Google PageSpeed Insights).*

---

## 🏗️ Monorepo Packages

If you want to integrate Webscan into your own Node.js project, the tool is broken down into modular packages:

- **`@prasadkumbhar/webscan-core`**: The raw, framework-agnostic scanning engine. Fetches HTML, checks headers, finds broken links.
- **`@prasadkumbhar/webscan-agent`**: The LLM reasoning layer. Takes the raw output from `core` and translates it into strategic marketing scores.
- **`@prasadkumbhar/webscan-cli`**: The terminal wrapper detailed above.
- **`@prasadkumbhar/webscan-widget`**: An embeddable `<script>` you can put on client sites to trigger API scans.

## 💻 Local Development

Want to contribute or run the web interface?

\`\`\`bash
# 1. Clone the repository and install dependencies
git clone https://github.com/yourusername/webscan.git
cd webscan
npm install

# 2. Build the workspace
npm run build -ws

# 3. Start the Next.js Web Interface
cd apps/web
npm run dev
# Open http://localhost:3000
\`\`\`

## 📄 License
MIT
