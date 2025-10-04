import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Shield, 
  Trash2, 
  LogOut,
  Smartphone,
  Save,
  AlertTriangle,
  CreditCard,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useCredits } from '@/contexts/CreditsContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { clearAllChats } = useChat();
  const { credits, plan } = useCredits();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    autoSave: true,
    soundEffects: false
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.patch('/settings', settings);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllChats = async () => {
    try {
      await clearAllChats();
      toast({
        title: "All chats deleted",
        description: "Your chat history has been permanently removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const handleToggle2FA = async () => {
    const newValue = !settings.twoFactorAuth;
    try {
      await api.post('/settings/2fa', { twoFactorAuth: newValue });
      setSettings(prev => ({ ...prev, twoFactorAuth: newValue }));
      toast({
        title: newValue ? "2FA Enabled" : "2FA Disabled",
        description: newValue ? "Two-factor authentication enabled." : "Two-factor authentication disabled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle 2FA. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/chat')}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your preferences and account</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose your preferred theme
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                      className="flex items-center justify-center gap-2 h-12"
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                      className="flex items-center justify-center gap-2 h-12"
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>Manage your account security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <Label htmlFor="2fa" className="font-medium">Two-Factor Authentication</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="2fa"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={handleToggle2FA}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <Label htmlFor="autosave" className="font-medium">Auto-save Chats</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your chat conversations
                  </p>
                </div>
                <Switch
                  id="autosave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, autoSave: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label htmlFor="sounds" className="font-medium">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for notifications and interactions
                  </p>
                </div>
                <Switch
                  id="sounds"
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, soundEffects: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription & Billing */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>Manage your subscription and credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 border border-border rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="text-3xl font-bold text-foreground capitalize">{plan}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Remaining Credits</p>
                    <p className="text-3xl font-bold text-primary flex items-center gap-2 justify-end">
                      <Zap className="h-6 w-6" />
                      {credits}
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/plans')}
                  className="w-full"
                  size="lg"
                  variant={plan === 'free' ? 'default' : 'outline'}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {plan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                </Button>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-2">Credit Usage:</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Text messages: 1 credit per message</p>
                    <p>• Image uploads: 5 credits per image</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your data and chat history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <Label className="font-medium text-destructive">Delete All Chats</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Permanently remove all your chat history
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Delete All Chats
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all your chat history and remove all data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAllChats}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete All Chats
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account and session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <LogOut className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">Sign Out</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sign out of your account on this device
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}