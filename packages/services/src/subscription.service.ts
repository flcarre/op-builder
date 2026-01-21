import { db } from '@crafted/database';
import { stripe } from '@crafted/payments';

export async function getMySubscription(userId: string) {
  return await db.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ['active', 'trialing'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getAllSubscriptions(userId: string) {
  return await db.subscription.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function cancelSubscription(userId: string) {
  const subscription = await db.subscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
  });

  if (!subscription) {
    throw new Error('No active subscription found');
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await db.subscription.update({
    where: {
      id: subscription.id,
    },
    data: {
      cancelAtPeriodEnd: true,
    },
  });

  return { success: true };
}

export async function reactivateSubscription(userId: string) {
  const subscription = await db.subscription.findFirst({
    where: {
      userId,
      cancelAtPeriodEnd: true,
    },
  });

  if (!subscription) {
    throw new Error('No subscription to reactivate');
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await db.subscription.update({
    where: {
      id: subscription.id,
    },
    data: {
      cancelAtPeriodEnd: false,
    },
  });

  return { success: true };
}
