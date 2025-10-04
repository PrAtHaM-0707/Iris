import { Sidebar } from '@/components/Sidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Chat() {
  const { user, isSessionRestored } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Checking authentication for /chat page');
    if (isSessionRestored && !user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/');
    }
  }, [user, isSessionRestored, navigate]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
}