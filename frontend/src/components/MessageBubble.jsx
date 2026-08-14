import SourceCard from "./SourceCard";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function MessageBubble({ message, index }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`message-row ${isUser ? "message-user" : "message-assistant"} animate-fade-in`}
      style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
      id={`message-${message.id || index}`}
    >
      {}
      {!isUser && (
        <div className="message-avatar assistant-avatar">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`message-content ${isUser ? "user-content" : "assistant-content"}`}
      >
        {}
        <div
          className={`message-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="code-block"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={`inline-code ${className || ""}`} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="message-sources">
            {message.sources.map((source, i) => (
              <SourceCard key={i} source={source} index={i} />
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="message-avatar user-avatar">
          <User size={18} />
        </div>
      )}

      <style>{`
        .message-row {
          display: flex;
          gap: 10px;
          padding: 4px 0;
          max-width: 85%;
        }

        .message-user {
          align-self: flex-end;
          flex-direction: row;
        }

        .message-assistant {
          align-self: flex-start;
          flex-direction: row;
          max-width: 90%;
        }

        .message-avatar {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          margin-top: 2px;
        }

        .assistant-avatar {
          background: var(--gradient-primary);
          color: white;
        }

        .user-avatar {
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
        }

        .message-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
          width: 100%;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          line-height: 1.65;
          overflow-x: auto;
        }

        .message-bubble p {
          margin: 0 0 12px 0;
        }
        
        .message-bubble p:last-child {
          margin-bottom: 0;
        }

        .message-bubble ul, .message-bubble ol {
          margin: 0 0 12px 0;
          padding-left: 20px;
        }

        .inline-code {
          background: rgba(0, 0, 0, 0.2);
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85em;
        }

        .code-block {
          border-radius: 6px !important;
          margin: 12px 0 !important;
          background: #1e1e1e !important;         }

        .user-bubble {
          background: var(--gradient-primary);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .assistant-bubble {
          background: var(--glass-bg);
          backdrop-filter: blur(8px);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
        }

        .message-sources {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-left: 2px;
        }
      `}</style>
    </div>
  );
}
