import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, handleWebhook } from '@crafted/payments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    const event = await constructWebhookEvent(body, signature);

    await handleWebhook(event);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}
