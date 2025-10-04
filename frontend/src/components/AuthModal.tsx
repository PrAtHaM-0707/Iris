import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { isLogin, formData });
    
    try {
      if (isLogin) {
        console.log('Attempting login with:', formData.email);
        await login(formData.email, formData.password);
        console.log('Login toast triggered');
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      } else {
        console.log('Attempting register with:', formData.email, formData.name);
        await register(formData.email, formData.password, formData.name);
        console.log('Register toast triggered');
        toast({
          title: "Account created!",
          description: "Welcome to Iris AI. You can now start chatting.",
        });
      }
      onClose();
      setFormData({ email: '', password: '', name: '' });
      console.log('Modal closed, form reset');
    } catch (error: unknown) {
      console.error('Auth error:', (error as Error).message);
      toast({
        title: "Error",
        description: (error as Error).message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleAuthSuccess = async (credentialResponse: CredentialResponse) => {
    console.log('Google Auth success:', credentialResponse);
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential provided by Google');
      }
      await loginWithGoogle(credentialResponse.credential);
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
      onClose();
      console.log('Google Auth completed, modal closed');
    } catch (error: unknown) {
      console.error('Google Auth error:', (error as Error).message);
      toast({
        title: "Authentication failed",
        description: (error as Error).message || "Please try again or use email/password.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleAuthError = () => {
    console.error('Google Auth failed');
    toast({
      title: "Authentication failed",
      description: "Google sign-in failed. Please try again.",
      variant: "destructive",
    });
  };

  const loginWithGoogle = async (credential: string) => {
    console.log('Sending Google credential to backend');
    await login('', '', credential);
  };

  const handleForgotPassword = async () => {
    console.log('Forgot password clicked, email:', formData.email);
    if (!formData.email) {
      console.error('Forgot password: Email missing');
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Reset link sent",
      description: "Password reset instructions have been sent to your email.",
    });
    console.log('Forgot password toast triggered (mock)');
    setShowForgotPassword(false);
    console.log('Back to sign-in form');
  };

  if (showForgotPassword) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md" aria-describedby="reset-password-description">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Reset Password
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div id="reset-password-description" className="text-center text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    console.log('Email input changed:', e.target.value);
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                  }}
                  placeholder="Enter your email"
                  className="pl-10 bg-input border-input-border focus:border-input-focus"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleForgotPassword}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                disabled={isLoading}
              >
                Send Reset Link
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  console.log('Back to sign-in clicked');
                  setShowForgotPassword(false);
                }}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="auth-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Welcome back' : 'Create account'}
          </DialogTitle>
          <p id="auth-dialog-description" className="text-center text-muted-foreground mt-2">
            {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
          </p>
        </DialogHeader>

        <GoogleLogin
          onSuccess={handleGoogleAuthSuccess}
          onError={handleGoogleAuthError}
          useOneTap
          width="360"
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    console.log('Name input changed:', e.target.value);
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                  }}
                  placeholder="Enter your full name"
                  required={!isLogin}
                  className="pl-10 bg-input border-input-border focus:border-input-focus"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  console.log('Email input changed:', e.target.value);
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                }}
                placeholder="Enter your email"
                required
                className="pl-10 bg-input border-input-border focus:border-input-focus"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  console.log('Password input changed');
                  setFormData(prev => ({ ...prev, password: e.target.value }));
                }}
                placeholder="Enter your password"
                required
                className="pl-10 pr-10 bg-input border-input-border focus:border-input-focus"
              />
              <button
                type="button"
                onClick={() => {
                  console.log('Toggle password visibility:', !showPassword);
                  setShowPassword(!showPassword);
                }}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  console.log('Forgot password link clicked');
                  setShowForgotPassword(true);
                }}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                console.log('Toggle auth mode:', isLogin ? 'register' : 'login');
                setIsLogin(!isLogin);
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}