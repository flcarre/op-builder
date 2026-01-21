import { stripe } from '@crafted/payments';

export async function createPaymentCheckout(params: {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.userId,
  });

  return { url: session.url };
}

export async function getPaymentSession(input: { sessionId: string }) {
  return await stripe.checkout.sessions.retrieve(input.sessionId);
}
