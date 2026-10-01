import { NextRequest, NextResponse } from 'next/server';
import { scanSite } from '@prasadkumbhar/webscan-core';
import { Agent } from '@prasadkumbhar/webscan-agent';
import { rateLimit } from '@/lib/rate-limit';
import { addLead } from '@/lib/db';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { url, email } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let targetUrl = url;
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }

    if (email) {
      addLead(email, targetUrl);
    }

    // Initialize agent (it picks up GEMINI_API_KEY from environment)
    const agent = new Agent();

    const report = await scanSite(targetUrl, { timeoutMs: 30000 });
    const synthesizedReport = await agent.synthesize(report, { businessType: 'web design agency' });

    return NextResponse.json(synthesizedReport);
  } catch (error: any) {
    console.error('Scan Error:', error);
    return NextResponse.json({ error: error.message || 'Scan failed' }, { status: 500 });
  }
}
