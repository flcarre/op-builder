import { stripe } from './stripe';
import Stripe from 'stripe';
import { db } from '@crafted/database';
import { sendPaymentConfirmationEmail } from '@crafted/emails';

export async function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  }

  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook Error: ${(err as Error).message}`);
  }
}

export type WebhookHandler = (event: Stripe.Event) => Promise<void>;

export const webhookHandlers: Record<string, WebhookHandler> = {
  'checkout.session.completed': async (event) => {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error('No userId in session metadata');
      return;
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

    if (session.customer && !user.stripeCustomerId) {
      await db.user.update({
        where: { id: userId },
        data: {
          stripeCustomerId: session.customer as string,
        },
      });
    }

    // Stripe requires amount in cents, convert for display
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    if (session.payment_status === 'paid') {
      await sendPaymentConfirmationEmail(
        user.email,
        amount,
        session.id
      );
    }

    console.log(
      `Payment successful for user ${userId}, amount: $${amount}`
    );
  },

  'customer.subscription.created': async (event) => {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const existingSub = await db.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (existingSub) {
      console.log(`Subscription ${subscription.id} already exists (idempotent)`);
      return;
    }

    const user = await db.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error(`User with stripeCustomerId ${customerId} not found`);
      return;
    }

    const priceId = subscription.items.data[0]?.price.id;
    const productId = subscription.items.data[0]?.price.product as string;

    await db.subscription.create({
      data: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeProductId: productId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    console.log(`Subscription created for user ${user.id}`);
  },

  'customer.subscription.updated': async (event) => {
    const subscription = event.data.object as Stripe.Subscription;

    const existingSub = await db.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSub) {
      console.error(`Subscription ${subscription.id} not found in database`);
      return;
    }

    await db.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      },
    });

    console.log(
      `Subscription ${subscription.id} updated, status: ${subscription.status}`
    );
  },

  'customer.subscription.deleted': async (event) => {
    const subscription = event.data.object as Stripe.Subscription;

    const existingSub = await db.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSub) {
      console.error(`Subscription ${subscription.id} not found in database`);
      return;
    }

    await db.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });

    console.log(`Subscription ${subscription.id} cancelled`);
  },

  'invoice.payment_failed': async (event) => {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    const user = await db.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error(`User with stripeCustomerId ${customerId} not found`);
      return;
    }

    console.log(`Payment failed for user ${user.id}`);
  },
};

export async function handleWebhook(event: Stripe.Event): Promise<void> {
  const handler = webhookHandlers[event.type];

  if (handler) {
    await handler(event);
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }
}
