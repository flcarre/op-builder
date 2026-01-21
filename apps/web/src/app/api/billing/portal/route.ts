import { NextResponse } from 'next/server';
import { createPortalSession } from '@crafted/payments';
import { db } from '@crafted/database';
import { getCurrentUser } from '@crafted/auth';

export async function POST() {
  try {
    const supabaseUser = await getCurrentUser();

    if (!supabaseUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbUser = await db.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!dbUser || !dbUser.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 404 }
      );
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/subscription`;
    const portalUrl = await createPortalSession(dbUser.stripeCustomerId, returnUrl);

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
