import { LLMProvider } from '../types';

export class GeminiProvider implements LLMProvider {
  constructor(private apiKey: string) {}

  async generate(prompt: string, systemInstruction?: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${this.apiKey}`;
    
    const body: any = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}
