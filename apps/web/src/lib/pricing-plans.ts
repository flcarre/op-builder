import type { PricingPlan } from '../components/pricing-card';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'price_starter',
    name: 'Starter',
    price: 9,
    description: 'Perfect for getting started',
    features: [
      '10 projects',
      '5 GB storage',
      'Basic support',
      'Email notifications',
    ],
  },
  {
    id: 'price_pro',
    name: 'Pro',
    price: 29,
    description: 'Best for professionals',
    features: [
      'Unlimited projects',
      '50 GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom domain',
    ],
  },
  {
    id: 'price_enterprise',
    name: 'Enterprise',
    price: 99,
    description: 'For large organizations',
    features: [
      'Unlimited everything',
      '500 GB storage',
      'Dedicated support',
      'Advanced security',
      'SSO & SAML',
      'Custom integrations',
    ],
  },
];
