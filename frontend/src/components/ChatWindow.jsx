import { useState, useEffect, useRef, useCallback } from "react";
import { chatAPI } from "../api/client";
import MessageBubble from "./MessageBubble";
import {
  Send,
  MessageSquare,
  FileText,
  Loader,
  Brain,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ChatWindow({ selectedDocId, documents, onSourceClick, showPdf, setShowPdf }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  useEffect(() => {
    if (!selectedDocId) {
      setMessages([]);
      return;
    }

    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await chatAPI.history(selectedDocId);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
        setMessages([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [selectedDocId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (selectedDocId) {
      inputRef.current?.focus();
    }
  }, [selectedDocId]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const question = input.trim();
      if (!question || !selectedDocId || isLoading) return;

      const userMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: question,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const reader = await chatAPI.queryStream(selectedDocId, question);
        const decoder = new TextDecoder("utf-8");

        let assistantMessage = {
          id: `resp-${Date.now()}`,
          role: "assistant",
          content: "",
          sources: null,
          confidence: null,
          created_at: new Date().toISOString(),
        };

        // Add the empty message to the UI
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Hide the generic typing indicator since the stream is starting
        setIsLoading(false);

        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.substring(6));
                  if (data.sources !== undefined) {
                    assistantMessage.sources = data.sources;
                    assistantMessage.confidence = data.confidence;
                  }
                  if (data.token) {
                    assistantMessage.content += data.token;
                  }
                } catch (e) {
                  console.error("Error parsing SSE data:", e, line);
                }
              }
            }

            // Update the UI with the latest accumulated message
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id ? { ...assistantMessage } : msg
              )
            );
          }
        }
      } catch (err) {
        const errorMessage = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            err.message ||
            "Something went wrong. Please try again.",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, selectedDocId, isLoading],
  );

  if (!selectedDocId) {
    return (
      <div className="chat-empty" id="chat-window-empty">
        <div className="chat-empty-content animate-fade-in">
          <div className="chat-empty-icon">
            <Brain size={48} />
          </div>
          <h2>
            Welcome to Doc<span className="gradient-text">Mind</span>
          </h2>
          <p>Upload a PDF and select it to start chatting</p>
          <div className="chat-empty-features">
            <div className="feature-item">
              <Sparkles size={18} />
              <span>AI-powered document understanding</span>
            </div>
            <div className="feature-item">
              <FileText size={18} />
              <span>Source citations with page numbers</span>
            </div>
            <div className="feature-item">
              <MessageSquare size={18} />
              <span>Chat history per document</span>
            </div>
          </div>
        </div>

        <style>{chatStyles}</style>
      </div>
    );
  }

  return (
    <div className="chat-window" id="chat-window">
      {}
      <div className="chat-header">
        <div className="chat-header-info">
          <FileText size={18} />
          <div>
            <h3 className="chat-header-title">{selectedDoc?.filename}</h3>
            <span className="chat-header-meta">
              {selectedDoc?.page_count} pages • {selectedDoc?.chunk_count}{" "}
              chunks
            </span>
          </div>
        </div>
        <button 
          type="button"
          className="chat-header-btn"
          onClick={() => setShowPdf(!showPdf)}
          title={showPdf ? "Hide PDF Viewer" : "Show PDF Viewer"}
        >
          {showPdf ? (
            <><EyeOff size={16} /> Hide PDF</>
          ) : (
            <><Eye size={16} /> Show PDF</>
          )}
        </button>
      </div>

      {}
      <div className="chat-messages" id="chat-messages">
        {historyLoading ? (
          <div className="chat-loading">
            <Loader size={24} className="spinning" />
            <span>Loading chat history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-start animate-fade-in">
            <Sparkles size={24} />
            <p>Ask a question about this document</p>
            <span>
              DocMind will find the relevant sections and provide a grounded
              answer with citations.
            </span>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} index={i} onSourceClick={onSourceClick} />
          ))
        )}

        {}
        {isLoading && (
          <div className="typing-indicator animate-fade-in">
            <div className="typing-avatar">
              <Brain size={16} />
            </div>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {}
      <form
        className="chat-input-bar"
        onSubmit={handleSubmit}
        id="chat-input-form"
      >
        <input
          ref={inputRef}
          type="text"
          className="input-field chat-input"
          placeholder="Ask a question about this document..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          id="chat-input"
        />
        <button
          type="submit"
          className="btn-primary chat-send-btn"
          disabled={!input.trim() || isLoading}
          id="chat-send-btn"
        >
          <Send size={18} />
        </button>
      </form>

      <style>{chatStyles}</style>
    </div>
  );
}

const chatStyles = `
  .chat-window {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--glass-border);
    background: var(--bg-secondary);
  }

  .chat-header-info {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-primary);
  }

  .chat-header-title {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .chat-header-meta {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .chat-header-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    padding: 6px 12px;
    border-radius: var(--radius-md);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .chat-header-btn:hover {
    background: var(--glass-bg);
    color: var(--text-primary);
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .chat-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }

  .chat-empty-content {
    text-align: center;
    max-width: 400px;
  }

  .chat-empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: var(--radius-xl);
    background: var(--gradient-subtle);
    color: var(--accent-blue);
    margin-bottom: 20px;
  }

  .chat-empty-content h2 {
    font-size: 1.8rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin-bottom: 8px;
  }

  .chat-empty-content > p {
    color: var(--text-secondary);
    margin-bottom: 32px;
  }

  .chat-empty-features {
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: left;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-radius: var(--radius-md);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .feature-item svg {
    color: var(--accent-blue);
    flex-shrink: 0;
  }

  .chat-start {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 48px 24px;
    text-align: center;
    color: var(--text-muted);
  }

  .chat-start svg {
    color: var(--accent-blue);
    margin-bottom: 4px;
  }

  .chat-start p {
    font-size: 0.95rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .chat-start span {
    font-size: 0.8rem;
    max-width: 360px;
  }

  .chat-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px;
    color: var(--text-muted);
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

    .typing-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
    align-self: flex-start;
    padding: 4px 0;
  }

  .typing-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    background: var(--gradient-primary);
    color: white;
  }

  .typing-dots {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    border-bottom-left-radius: 4px;
  }

  .typing-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-muted);
    animation: pulse 1.4s ease-in-out infinite;
  }

  .typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

    .chat-input-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 24px;
    border-top: 1px solid var(--glass-border);
    background: var(--bg-secondary);
  }

  .chat-input {
    flex: 1;
  }

  .chat-send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: var(--radius-md);
    flex-shrink: 0;
  }
`;
