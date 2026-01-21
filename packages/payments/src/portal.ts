import { stripe } from './stripe';

export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  if (!customerId) {
    throw new Error('Customer ID is required');
  }

  if (!returnUrl) {
    throw new Error('Return URL is required');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}
