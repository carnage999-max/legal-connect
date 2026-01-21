import { NextRequest, NextResponse } from 'next/server';

type DeletionPayload = {
  email: string;
  name?: string;
  reason?: string;
  details?: string;
  platform?: 'android' | 'ios' | 'web' | 'other';
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DeletionPayload;
    const { email, name, reason, details, platform } = body || {} as any;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // If RESEND envs exist, send email to support using Resend HTTP API (no SDK dependency)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const TO = process.env.SUPPORT_EMAIL || process.env.CONTACT_EMAIL; // set one of these in env

    if (RESEND_API_KEY && TO) {
      const subject = 'Account Deletion Request';
      const html = `
        <h2>Account Deletion Request</h2>
        <p><strong>When:</strong> ${now}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Name:</strong> ${name || '-'}</p>
        <p><strong>Platform:</strong> ${platform || '-'}</p>
        <p><strong>Reason:</strong></p>
        <p>${(reason || '').toString().replace(/</g, '&lt;')}</p>
        <p><strong>Additional details:</strong></p>
        <p>${(details || '').toString().replace(/</g, '&lt;')}</p>
      `;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM, to: TO, subject, html }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Resend error:', res.status, text);
        // still return 200 to avoid blocking the user; ops can inspect logs
      }
    } else {
      console.log('Account deletion request:', { now, email, name, reason, details, platform });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Deletion request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

