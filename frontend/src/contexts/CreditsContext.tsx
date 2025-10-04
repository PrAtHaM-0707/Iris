import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface CreditsContextType {
  credits: number;
  plan: 'free' | 'basic' | 'premium';
  consumeCredits: (amount: number, action: string) => Promise<boolean>;
  addCredits: (amount: number) => void;
  upgradePlan: (newPlan: 'basic' | 'premium') => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

const PLAN_CREDITS = {
  free: 5,
  basic: 20,
  premium: 100
};

const CREDIT_COSTS = {
  text_message: 1,
  image_upload: 5
};

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState<'free' | 'basic' | 'premium'>('free');
  const { toast } = useToast();
  const { user, isSessionRestored } = useAuth();

  const fetchPlan = async () => {
    try {
      const { data } = await api.get('/plans');
      console.log('Fetched plan:', data.plan, 'balance:', data.balance);
      setPlan(data.plan || 'free');
      let balance = data.balance ?? 0;
      if (balance === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: retryData } = await api.get('/plans');
        balance = retryData.balance ?? 0;
      }
      setCredits(balance);
    } catch (error) {
      console.error('Failed to fetch plan:', error.response?.status, error.message);
      toast({
        title: "Error",
        description: "Failed to fetch plan details. Using cached values.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isSessionRestored && user) {
      fetchPlan();
    } else if (isSessionRestored && !user) {
      setPlan('free');
      setCredits(0);
    }
  }, [isSessionRestored, user]);

  const consumeCredits = async (amount: number, action: string): Promise<boolean> => {
    console.log(`Consuming ${amount} credits for ${action}, current: ${credits}`);
    if (credits < amount) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits. Upgrade your plan to continue.",
        variant: "destructive",
      });
      return false;
    }
    try {
      const { data } = await api.post('/plans/update-credits', { amount });
      setCredits(data.balance);
      console.log(`Deducted ${amount}, new balance: ${data.balance}`);
      await fetchPlan();
      return true;
    } catch (error) {
      console.error('Consume credits error:', error);
      toast({
        title: "Error",
        description: "Failed to update credits. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addCredits = (amount: number) => {
    setCredits(prev => prev + amount);
    toast({
      title: "Credits Added",
      description: `${amount} credits have been added to your account.`,
    });
  };

  const upgradePlan = async (newPlan: 'basic' | 'premium') => {
    try {
      const amount = newPlan === 'basic' ? 299 : 799;
      const { data } = await api.post('/plans/subscribe', { planId: newPlan, amount });
      setPlan(newPlan);
      setCredits(PLAN_CREDITS[newPlan]);
      toast({
        title: "Plan Upgraded",
        description: `You've been upgraded to ${newPlan} plan!`,
      });
    } catch (error) {
      console.error('Upgrade plan error:', error.response?.data || error.message);
      toast({
        title: "Upgrade Failed",
        description: error.response?.data?.error || "Failed to upgrade plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <CreditsContext.Provider value={{ credits, plan, consumeCredits, addCredits, upgradePlan }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) throw new Error('useCredits must be used within a CreditsProvider');
  return context;
}

export { CREDIT_COSTS };