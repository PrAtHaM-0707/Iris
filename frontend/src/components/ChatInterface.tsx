import { useState, useRef, useEffect } from 'react';
import { Send, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/contexts/ChatContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCredits } from '@/contexts/CreditsContext';
import { CREDIT_COSTS } from '@/contexts/CreditsContext';
import { cn } from '@/lib/utils';
import { Message } from './Message';
import { useNavigate } from 'react-router-dom';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentChat, sendMessage, isTyping } = useChat();
  const { theme, toggleTheme } = useTheme();
  const { credits } = useCredits();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendMessage(input);
      setInput('');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const now = new Date();
  const resetTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  resetTime.setHours(24, 0, 0, 0);
  const hoursUntilReset = Math.ceil((resetTime.getTime() - now.getTime()) / (1000 * 60 * 60));

  return (
    <div className="flex flex-col h-full bg-chat-background relative">
      {/* Header */}
      <div className="flex items-center justify-between p-2 pl-5 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{currentChat?.title || 'New Chat'}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-foreground hover:bg-secondary"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 mb-28">
        {!currentChat || currentChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Welcome to ChatGPT</h3>
              <p className="text-muted-foreground mb-8">Start a conversation by typing a message below</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {currentChat.messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-chat-ai-message text-chat-ai-text p-4 rounded-2xl max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full typing-dots"></div>
                    <div className="w-2 h-2 bg-current rounded-full typing-dots" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full typing-dots" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating input */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ChatGPT..."
            className="w-full min-h-[60px] max-h-28 resize-none pr-16 pl-4 py-2 border border-input-border rounded-xl focus:ring-1 focus:ring-input-focus focus:border-input-focus transition-colors"
          />

          {/* Send button */}
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping || credits < CREDIT_COSTS.text_message || isSubmitting}
            className={cn(
              "absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center",
              input.trim()
                ? "bg-primary hover:bg-primary-hover text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="h-5 w-5" />
          </Button>

          {credits < CREDIT_COSTS.text_message && (
            <div className="text-xs text-destructive text-center mt-1">
              <p>Daily limit reached. Resets in {hoursUntilReset} hour{hoursUntilReset !== 1 ? 's' : ''}.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
