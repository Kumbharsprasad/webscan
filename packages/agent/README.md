# @prasadkumbhar/webscan-agent

This package provides an AI-powered synthesis layer on top of `@prasadkumbhar/webscan-core`'s raw `ScanReport`. It uses a Large Language Model (LLM) to rank issues by business impact, generate a non-technical summary, and intelligently perform follow-up scans on ambiguous findings.

## Zero-Dependency Fallback

The agent is designed to work completely seamlessly even **without an LLM API key**.

If no API key is set (e.g., `GEMINI_API_KEY` is missing) and no custom `LLMProvider` is provided, the agent will automatically gracefully degrade to a **deterministic rule-based fallback mode**. 

In this fallback mode:
- It produces a complete and valid `SynthesizedReport`.
- Issues are ranked deterministically by severity (Critical -> Warning -> Info).
- The summary is generated using a text template summarizing the raw counts of critical issues and warnings.
- It operates with **zero paid or external dependencies** (no network calls to AI endpoints).

This ensures that your pipeline won't break if an API key expires or is unconfigured.
