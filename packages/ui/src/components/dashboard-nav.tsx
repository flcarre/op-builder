import { Button } from './button';

interface DashboardNavProps {
  userName?: string;
  userEmail?: string;
  onLogout: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function DashboardNav({
  userName,
  userEmail,
  onLogout,
  showBackButton,
  onBack
}: DashboardNavProps) {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
              >
                ← Back
              </Button>
            )}
            <h1 className="text-xl font-bold">Crafted SaaS</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {userName || userEmail}
            </span>
            <Button onClick={onLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
