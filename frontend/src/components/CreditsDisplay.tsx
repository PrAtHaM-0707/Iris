import { Zap } from 'lucide-react';
import { useCredits } from '@/contexts/CreditsContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function CreditsDisplay() {
  const { credits, plan } = useCredits();
  const navigate = useNavigate();

  const planColors = {
    free: 'text-muted-foreground',
    basic: 'text-primary',
    premium: 'text-accent'
  };

  const getCreditsColor = () => {
    if (credits > 50) return 'text-emerald-500';
    if (credits > 20) return 'text-amber-500';
    return 'text-destructive';
  };

  return (
    <button
      onClick={() => navigate('/plans')}
      className={cn(
        "w-full p-3 rounded-lg border border-sidebar-border",
        "bg-gradient-to-r from-sidebar-background to-sidebar-hover",
        "hover:shadow-md transition-all duration-300 hover-scale",
        "group"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Zap className={cn("h-4 w-4", getCreditsColor())} />
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground font-medium">Credits</p>
            <p className={cn("text-lg font-bold", getCreditsColor())}>
              {credits}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Plan</p>
          <p className={cn("text-sm font-semibold capitalize", planColors[plan])}>
            {plan}
          </p>
        </div>
      </div>
      
      {plan === 'free' && credits < 5 && (
        <div className="mt-2 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
          Low credits! Upgrade to continue
        </div>
      )}
    </button>
  );
}
