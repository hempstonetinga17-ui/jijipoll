import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, organisation, website } = body;

    if (!name || !email || !organisation) {
      return NextResponse.json(
        { error: 'Name, email, and organisation are required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Jijipoll Demo <onboarding@resend.dev>', // Should be a verified domain in production
      to: ['hempstonetinga17@gmail.com'],
      subject: `New Demo Booking from ${name} (${organisation})`,
      html: `
        <h2>New Demo Booking Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Organisation:</strong> ${organisation}</p>
        <p><strong>Website/LinkedIn:</strong> ${website || 'Not provided'}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending demo booking email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
