import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      throw new Error(
        'Missing RESEND_API_KEY environment variable. Please check .env file.'
      );
    }

    resendInstance = new Resend(resendApiKey);
  }

  return resendInstance;
}

export const resend = new Proxy({} as Resend, {
  get: (_target, prop) => {
    const instance = getResend();
    const value = instance[prop as keyof Resend];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export type ResendClient = typeof resend;
