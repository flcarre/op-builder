import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Check } from 'lucide-react';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

interface PricingCardProps {
  plan: PricingPlan;
  isCurrentPlan?: boolean;
  onSubscribe: (priceId: string) => void;
  isLoading?: boolean;
}

export function PricingCard({ plan, isCurrentPlan, onSubscribe, isLoading }: PricingCardProps) {
  return (
    <Card className={isCurrentPlan ? 'border-primary' : ''}>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <span className="text-4xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>

        <ul className="mb-6 space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => onSubscribe(plan.id)}
          disabled={isCurrentPlan || isLoading}
          className="w-full"
          variant={isCurrentPlan ? 'outline' : 'default'}
        >
          {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
        </Button>
      </CardContent>
    </Card>
  );
}
