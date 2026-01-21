import React from 'react';
import { render } from '@react-email/components';
import { resend } from './client';
import { WelcomeEmail } from './templates/welcome';
import { PasswordResetEmail } from './templates/password-reset';
import { PaymentConfirmationEmail } from './templates/payment-confirmation';
import { EmailVerificationEmail } from './templates/email-verification';

const defaultFrom = process.env.EMAIL_FROM || 'noreply@craftedsaas.com';

export async function sendWelcomeEmail(to: string, name?: string) {
  const html = await render(<WelcomeEmail name={name} />);

  const { data, error } = await resend.emails.send({
    from: defaultFrom,
    to,
    subject: 'Welcome to Crafted SaaS!',
    html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const html = await render(<PasswordResetEmail resetLink={resetLink} />);

  const { data, error } = await resend.emails.send({
    from: defaultFrom,
    to,
    subject: 'Reset your password',
    html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

export async function sendPaymentConfirmationEmail(
  to: string,
  amount: number,
  receiptUrl?: string
) {
  const html = await render(
    <PaymentConfirmationEmail amount={amount} receiptUrl={receiptUrl} />
  );

  const { data, error } = await resend.emails.send({
    from: defaultFrom,
    to,
    subject: 'Payment Confirmation',
    html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

export async function sendVerificationEmail(
  to: string,
  verificationLink: string,
  name?: string
) {
  const html = await render(
    <EmailVerificationEmail verificationLink={verificationLink} name={name} />
  );

  const { data, error } = await resend.emails.send({
    from: defaultFrom,
    to,
    subject: 'Verify your email address',
    html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
