import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../services/api';
import { useCredits } from './CreditsContext';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  images?: string[];
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  currentChat: ChatHistory | null;
  chatHistories: ChatHistory[];
  sendMessage: (content: string, images?: string[]) => Promise<void>;
  createNewChat: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  clearAllChats: () => Promise<void>;
  isTyping: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentChat, setCurrentChat] = useState<ChatHistory | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { consumeCredits, addCredits } = useCredits();
  const { user, isSessionRestored } = useAuth();

  const createNewChat = async () => {
    console.log('Creating new chat');
    try {
      const { data } = await api.post('/chat');
      const newChat = { ...data, messages: data.messages || [] };
      console.log('New chat created:', newChat.id);
      setChatHistories(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
    } catch (error) {
      console.error('Create chat error:', error.message);
      throw new Error('Failed to create chat');
    }
  };

  const sendMessage = async (content: string, images?: string[]) => {
    console.log('Sending message:', content, 'images:', images);
    if (!currentChat) {
      await createNewChat();
      if (!currentChat) {
        throw new Error('Failed to initialize chat');
      }
    }
    const creditsNeeded = 1 + (images?.length || 0) * 5;
    console.log(`Attempting to consume ${creditsNeeded} credits`);
    if (!await consumeCredits(creditsNeeded, 'send_message')) {
      console.log('Insufficient credits for message');
      throw new Error('Insufficient credits');
    }

    setIsTyping(true);
    try {
      const { data } = await api.post(`/chat/${currentChat.id}/messages`, { content, images });
      console.log('Message sent successfully, AI response:', data.aiMessage.content);
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, { ...data.userMessage, role: 'user' }, { ...data.aiMessage, role: 'assistant' }],
        updatedAt: new Date(),
        title: currentChat.messages.length === 0 ? content.slice(0, 30) + '...' : currentChat.title
      };
      setCurrentChat(updatedChat);
      setChatHistories(prev => prev.map(chat => chat.id === updatedChat.id ? updatedChat : chat));
    } catch (error) {
      console.error('Send message error:', error.message);
      addCredits(creditsNeeded);
      throw new Error('Failed to send message');
    } finally {
      setIsTyping(false);
      console.log('Message sending process completed');
    }
  };

  const selectChat = async (chatId: string) => {
    console.log('Selecting chat:', chatId);
    try {
      const { data } = await api.get(`/chat/${chatId}`);
      const chat = { ...data, messages: data.messages || [] };
      console.log('Chat selected:', chat.id, chat.title);
      setCurrentChat(chat);
    } catch (error) {
      console.error('Select chat error:', error.message);
      throw new Error('Failed to fetch chat');
    }
  };

  const deleteChat = async (chatId: string) => {
    console.log('Deleting chat:', chatId);
    try {
      await api.delete(`/chat/${chatId}`);
      console.log('Chat deleted:', chatId);
      setChatHistories(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
    } catch (error) {
      console.error('Delete chat error:', error.message);
      throw new Error('Failed to delete chat');
    }
  };

  const clearAllChats = async () => {
    console.log('Clearing all chats');
    try {
      for (const chat of chatHistories) {
        await api.delete(`/chat/${chat.id}`);
        console.log('Deleted chat:', chat.id);
      }
      setChatHistories([]);
      setCurrentChat(null);
      console.log('All chats cleared');
    } catch (error) {
      console.error('Clear all chats error:', error.message);
      throw new Error('Failed to clear chats');
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      console.log('Fetching chat histories');
      try {
        const { data } = await api.get('/chat');
        const chats = data.map((chat: ChatHistory) => ({ ...chat, messages: chat.messages || [] }));
        console.log('Fetched', chats.length, 'chats');
        setChatHistories(chats);
        if (chats.length > 0) {
          setCurrentChat(chats[0]);
          console.log('Set initial current chat:', chats[0].id);
        }
      } catch (error) {
        console.error('Fetch chats error:', error.message);
      }
    };

    if (isSessionRestored && user) {
      fetchChats();
    } else if (isSessionRestored && !user) {
      setChatHistories([]);
      setCurrentChat(null);
    }
  }, [isSessionRestored, user]);

  return (
    <ChatContext.Provider value={{
      currentChat,
      chatHistories,
      sendMessage,
      createNewChat,
      selectChat,
      deleteChat,
      clearAllChats,
      isTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}