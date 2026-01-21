import { stripe } from './stripe';

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export async function createCheckoutSession({
  priceId,
  userId,
  successUrl,
  cancelUrl,
  customerEmail,
}: CreateCheckoutSessionParams) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    client_reference_id: userId,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function createOneTimeCheckoutSession({
  priceId,
  userId,
  successUrl,
  cancelUrl,
  customerEmail,
}: CreateCheckoutSessionParams) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    client_reference_id: userId,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}
