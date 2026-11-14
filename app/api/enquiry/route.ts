import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { enquirySchema } from '@/lib/validation';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json(
      { message: 'Invalid request origin.' },
      { status: 403 },
    );
  if (Number(request.headers.get('content-length') || 0) > 20000)
    return NextResponse.json(
      { message: 'Request too large.' },
      { status: 413 },
    );
  let raw;
  try {
    const body = await request.text();
    if (body.length > 20000)
      return NextResponse.json(
        { message: 'Request too large.' },
        { status: 413 },
      );
    raw = JSON.parse(body);
  } catch {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }
  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(
      { message: 'Please check your form details.' },
      { status: 400 },
    );
  if (parsed.data.website)
    return NextResponse.json({ message: 'Enquiry received.' });
  if (!process.env.RESEND_API_KEY || !process.env.ENQUIRY_FROM)
    return NextResponse.json(
      {
        message:
          'Online delivery is not connected yet. Please email info@vrksolutions.in or WhatsApp +91 9398845947.',
      },
      { status: 503 },
    );
  try {
    const d = parsed.data;
    const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.ENQUIRY_FROM,
      to: process.env.ENQUIRY_TO || 'info@vrksolutions.in',
      replyTo: d.email,
      subject: `VRK Solutions: ${d.kind === 'book-consultation' ? 'Consultation request' : d.kind === 'get-quote' || d.kind === 'quote' ? 'Quotation request' : 'Contact enquiry'}`,
      text: Object.entries(d)
        .filter(([k]) => !['website', 'consent'].includes(k))
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n\n'),
    });
    if (result.error || !result.data?.id) throw new Error('Delivery failed');
    return NextResponse.json({
      message: 'Thank you. Your enquiry has been sent to VRK Solutions.',
    });
  } catch {
    return NextResponse.json(
      {
        message:
          'Delivery failed. Please contact info@vrksolutions.in directly.',
      },
      { status: 502 },
    );
  }
}
