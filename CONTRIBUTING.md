# Contributing to Webscan

First off, thanks for taking the time to contribute!

## Development Setup

1. Fork and clone the repository.
2. Run \`npm install\` to bootstrap the monorepo.
3. If you want to use the AI synthesis layer, create a \`.env\` file in the root and add \`GEMINI_API_KEY=your_key\`.
4. If you want to run the performance checks, add \`PSI_API_KEY=your_key\` to the \`.env\` file.
5. Build all packages using \`npm run build -ws\`.

## Pull Requests

1. Create a new branch for your feature or bugfix.
2. Make your changes.
3. Ensure all tests pass by running \`npm run test -ws\`.
4. Ensure your code lints properly.
5. Submit a pull request.

Please make sure to write unit tests for any new features or bugfixes!
