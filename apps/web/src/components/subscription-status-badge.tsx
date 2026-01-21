import { Badge } from '@crafted/ui';

interface SubscriptionStatusBadgeProps {
  status: string;
}

export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  const variant =
    status === 'active' ? 'default' :
    status === 'trialing' ? 'secondary' :
    'outline';

  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
