import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, MessageSquare, Settings, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const features = [
    {
      icon: MessageSquare,
      title: 'Natural Conversations',
      description: 'Chat with AI in a natural, intuitive way. Ask questions, get help, or just have a friendly conversation.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get instant responses powered by advanced AI technology. No waiting, no delays.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your conversations are secure and private. We respect your data and privacy.'
    },
    {
      icon: Globe,
      title: 'Always Available',
      description: 'Access your AI assistant 24/7 from any device. Your chat history syncs everywhere.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" aria-label="Iris AI Logo" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Iris AI</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => openAuth('login')}
                className="text-foreground hover:bg-secondary"
              >
                Sign In
              </Button>
              <Button
                onClick={() => openAuth('register')}
                className="bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-2xl mb-6">
              <Bot className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
            Chat with AI.<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Powered by Iris AI.
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the next generation of AI conversation. Get answers, create content, 
            solve problems, and explore ideas with our advanced AI assistant.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => openAuth('register')}
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-6 text-lg"
            >
              Start Chatting Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => openAuth('login')}
              className="px-8 py-6 text-lg border-border hover:bg-secondary"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose Our AI Chat?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the features that make our AI assistant the perfect companion 
              for work, learning, and creativity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card hover:bg-card/80 p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300 hover-scale"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to start your AI journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already experiencing the future of AI conversation.
            Sign up now and start chatting for free.
          </p>
          <Button
            size="lg"
            onClick={() => openAuth('register')}
            className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-6 text-lg"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-foreground font-semibold">Iris AI</span>
            </div>
            <div className="text-muted-foreground text-sm">
              © 2025 Iris AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultMode={authMode}
      />
    </div>
  );
};

export default Index;
