import { Button } from '@crafted/ui';

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
    <nav className="border-b border-cyber-500/20 glass sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-cyber-400 hover:text-cyber-300 hover:bg-cyber-500/10 transition-all duration-200"
              >
                ← Back
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-400 to-cyber-600 flex items-center justify-center shadow-glow-sm">
                <span className="text-white font-bold text-sm">OP</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyber-300 to-cyber-500 bg-clip-text text-transparent">
                Op-Builder
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass">
              <div className="w-2 h-2 rounded-full bg-cyber-400 animate-pulse" />
              <span className="text-sm text-gray-300">
                {userName || userEmail}
              </span>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="glass glow-border hover:glow-border-strong text-cyber-400 hover:text-cyber-300 transition-all duration-200"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
