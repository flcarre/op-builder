import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@crafted/ui';

interface DashboardCardProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export function DashboardCard({ title, description, buttonText, onButtonClick }: DashboardCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onButtonClick} variant="outline" className="w-full">
          {buttonText} →
        </Button>
      </CardContent>
    </Card>
  );
}
