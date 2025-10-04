import { Bot, User } from 'lucide-react';
import { Message as MessageType } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import ReactMarkdown, { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  // Markdown components for AI messages
  const markdownComponents: Components = {
    p: ({ children }) => (
      <p className="whitespace-pre-wrap leading-relaxed">{children}</p>
    ),
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      if (match) {
        return (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            className="rounded-lg overflow-x-auto mb-2"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      return (
        <code className="bg-gray-200 dark:bg-gray-800 text-sm px-1 py-[2px] rounded">
          {children}
        </code>
      );
    },
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline"
      >
        {children}
      </a>
    ),
  };

  return (
    <div
      className={cn(
        "flex gap-4 message-slide-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}

      {/* Message Box */}
      <div
        className={cn(
          "max-w-[80%] p-4 rounded-2xl shadow-sm",
          isUser
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
            : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-bl-md"
        )}
      >
        {/* Images */}
        {message.images && message.images.length > 0 && (
          <div
            className={cn(
              "mb-3 grid gap-2",
              message.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}
          >
            {message.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Uploaded ${index + 1}`}
                className="rounded-lg max-w-full h-auto border border-gray-300 dark:border-gray-700"
              />
            ))}
          </div>
        )}

        {/* Text / Markdown */}
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <ReactMarkdown components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}

        {/* Timestamp */}
        <div
          className={cn(
            "text-xs mt-2 opacity-60",
            isUser ? "text-right" : "text-left"
          )}
        >
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
}
