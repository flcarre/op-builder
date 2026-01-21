export function getSubscriptionStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'active') return 'default';
  if (status === 'trialing') return 'secondary';
  return 'outline';
}

export function getSubscriptionStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
