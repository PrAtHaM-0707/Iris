import { useState } from 'react';
import { Check, Zap, Crown, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCredits } from '@/contexts/CreditsContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Define Razorpay response type
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Define Razorpay interface
interface Razorpay {
  open: () => void;
}

// Extend Window interface with typed Razorpay
declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      name: string;
      description: string;
      image: string;
      handler: (response: RazorpayResponse) => void;
      prefill: { name: string; email: string; contact: string };
      theme: { color: string };
      modal: { ondismiss: () => void };
    }) => Razorpay;
  }
}

export default function Plans() {
  const { plan: currentPlan, upgradePlan } = useCredits();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      priceValue: 0,
      credits: 5,
      icon: Sparkles,
      features: [
        '5 credits per day',
        'Basic AI responses',
        'Text messages only',
        'Limited chat history',
        'Community support'
      ],
      color: 'from-muted to-muted-foreground/20',
      popular: false
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '₹299',
      priceValue: 299,
      credits: 20,
      icon: Zap,
      features: [
        '20 credits per day',
        'Advanced AI responses',
        'Image upload support',
        'Unlimited chat history',
        'Priority support',
        'No ads'
      ],
      color: 'from-primary to-primary-hover',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹799',
      priceValue: 799,
      credits: 100,
      icon: Crown,
      features: [
        '100 credits per day',
        'GPT-4 access',
        'Unlimited image uploads',
        'Priority processing',
        'Custom AI training',
        'API access',
        'Dedicated support'
      ],
      color: 'from-accent to-accent/80',
      popular: false
    }
  ];

  const handlePayment = async (planId: string, amount: number, planName: string) => {
    if (planId === 'free') {
      toast({
        title: "Already on Free Plan",
        description: "You're currently using the free plan.",
      });
      return;
    }

    if (!razorpayKey) {
      console.error('VITE_RAZORPAY_KEY_ID is not set');
      toast({
        title: "Error",
        description: "Payment gateway configuration is missing.",
        variant: "destructive",
      });
      return;
    }

    setLoading(planId);
    try {
      const { data } = await api.post('/plans/subscribe', { planId, amount });
      const { order } = data;

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: razorpayKey,
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: 'Iris AI',
          description: `${planName} Plan Subscription`,
          image: '/logo.png',
          handler: function (response: RazorpayResponse) {
            toast({
              title: "Payment Successful!",
              description: `Payment ID: ${response.razorpay_payment_id}`,
            });
            upgradePlan(planId as 'basic' | 'premium');
            setTimeout(() => navigate('/chat'), 2000);
          },
          prefill: {
            name: 'User Name',
            email: 'user@example.com',
            contact: '9999999999'
          },
          theme: { color: '#3B82F6' },
          modal: {
            ondismiss: () => {
              setLoading(null);
              toast({
                title: "Payment Cancelled",
                description: "You can try again anytime.",
                variant: "destructive",
              });
            }
          }
        };

        try {
          const razorpay = new window.Razorpay(options);
          razorpay.open();
          setLoading(null);
        } catch (razorpayError) {
          console.error('Razorpay checkout error:', razorpayError);
          setLoading(null);
          toast({
            title: "Error",
            description: "Failed to open payment gateway. Please try again.",
            variant: "destructive",
          });
        }
      };

      script.onerror = () => {
        setLoading(null);
        toast({
          title: "Error",
          description: "Failed to load payment gateway script. Please try again.",
          variant: "destructive",
        });
      };
    } catch (err: unknown) {
      setLoading(null);
      let errorMessage = "Failed to initiate payment. Please try again.";

      // Check if err is an Axios error
      if (typeof err === "object" && err !== null) {
        const axiosError = err as { response?: { data?: { message?: string; error?: string | object } }; message?: string };
if (axiosError.response?.data?.message) {
  errorMessage = axiosError.response.data.message;
} else if (axiosError.response?.data?.error) {
  errorMessage = typeof axiosError.response.data.error === 'string'
    ? axiosError.response.data.error
    : JSON.stringify(axiosError.response.data.error);
} else if (axiosError.message) {
  errorMessage = axiosError.message;
}

      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      console.error('Payment initiation error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-sidebar-background">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/chat')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Button>
        </div>
      </div>

      {/* Plans Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of AI with our flexible pricing plans.
            Pay only for what you use with our credit system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((planItem) => {
            const Icon = planItem.icon;
            const isCurrentPlan = currentPlan === planItem.id;

            return (
              <Card
                key={planItem.id}
                className={cn(
                  "relative p-6 border-2 transition-all duration-300",
                  planItem.popular && "border-primary shadow-lg scale-105",
                  !planItem.popular && "border-border hover:shadow-md",
                  isCurrentPlan && "ring-2 ring-primary ring-offset-2"
                )}
              >
                {planItem.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={cn(
                    "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4",
                    "bg-gradient-to-br",
                    planItem.color
                  )}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {planItem.name}
                  </h3>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">
                      {planItem.price}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    <Zap className="h-4 w-4" />
                    {planItem.credits} credits
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {planItem.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePayment(planItem.id, planItem.priceValue, planItem.name)}
                  disabled={isCurrentPlan || loading === planItem.id}
                  className={cn(
                    "w-full",
                    planItem.popular && "bg-primary hover:bg-primary-hover",
                    isCurrentPlan && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loading === planItem.id ? (
                    "Processing..."
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : (
                    `Upgrade to ${planItem.name}`
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-card rounded-lg border border-border">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            How Credits Work
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-2">Text Messages</p>
              <p>1 credit per message sent to the AI</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Image Uploads</p>
              <p>5 credits per image uploaded with your message</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}