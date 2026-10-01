import { NextRequest, NextResponse } from 'next/server';
import { addLead } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, url } = await req.json();

    if (!email || !url) {
      return NextResponse.json({ error: 'Email and URL are required' }, { status: 400 });
    }

    addLead(email, url);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Lead Capture Error:', error);
    return NextResponse.json({ error: 'Failed to capture lead' }, { status: 500 });
  }
}
