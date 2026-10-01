import { LLMProvider } from '../types';

export class OpenAIProvider implements LLMProvider {
  constructor(private apiKey: string, private model: string = 'gpt-4o') {}

  async generate(prompt: string, systemInstruction?: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions';
    
    const messages: any[] = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(data.error)}`);
    }

    return data.choices[0].message.content;
  }
}
