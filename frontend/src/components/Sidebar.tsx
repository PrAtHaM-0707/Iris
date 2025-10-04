import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Menu,
  X,
  Settings,
  User,
  LogOut,
  PanelRightOpen,
  PanelLeftClose
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { CreditsDisplay } from './CreditsDisplay';

export function Sidebar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { chatHistories, currentChat, createNewChat, selectChat, deleteChat } = useChat();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <div className={cn(
        "fixed lg:relative h-full bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300",
        isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "w-72 lg:w-72"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-sidebar-border">
            {!isCollapsed && (
              <h1 className="text-lg font-semibold text-sidebar-foreground">Iris AI</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-sidebar-foreground hover:text-primary hover:bg-sidebar-hover"
            >
              {isCollapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>

          {/* New Chat Button */}
          {!isCollapsed && (
            <div className="p-4">
              <Button
                onClick={createNewChat}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          )}

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            {!isCollapsed && (
              <div className="p-2">
                {chatHistories.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No chat history yet
                  </div>
                ) : (
                  <div className="space-y-1">
                    {chatHistories.map((chat) => (
                      <div
                        key={chat.id}
                        className={cn(
                          "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                          currentChat?.id === chat.id 
                            ? "bg-sidebar-active text-sidebar-foreground" 
                            : "hover:bg-sidebar-hover text-sidebar-foreground"
                        )}
                        onClick={() => selectChat(chat.id)}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span className="truncate text-sm">{chat.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Credits Display */}
          {!isCollapsed && (
            <div className="px-4 pb-4">
              <CreditsDisplay />
            </div>
          )}

          {/* User Menu */}
          <div className="p-4 border-t border-sidebar-border">
            {isCollapsed ? (
              <div className="flex flex-col space-y-2">
                <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center p-2 rounded-lg bg-sidebar-hover hover:bg-sidebar-active transition-colors cursor-pointer"
                >
                  <img 
                    src={user?.avatar} 
                    alt={user?.name}
                    className="h-8 w-8 rounded-full mr-3"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </button>
                
                {/* <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/profile')}
                    className="flex-1 text-sidebar-foreground hover:bg-sidebar-hover"
                  >
                    <User className="h-3 w-3 mr-2" />
                    Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/settings')}
                    className="flex-1 text-sidebar-foreground hover:bg-sidebar-hover"
                  >
                    <Settings className="h-3 w-3 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={logout}
                    className="text-sidebar-foreground hover:bg-sidebar-hover hover:text-destructive"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}