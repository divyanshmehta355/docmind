import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function SourceCard({ source, index }) {
  const [expanded, setExpanded] = useState(false);

  const scorePercent = Math.round(source.score * 100);
  const scoreClass =
    source.score >= 0.6
      ? "confidence-high"
      : source.score >= 0.45
        ? "confidence-medium"
        : "confidence-low";

  return (
    <div
      className={`source-card ${expanded ? "expanded" : ""}`}
      id={`source-card-${index}`}
    >
      <button
        className="source-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="source-info">
          <FileText size={14} />
          <span className="source-label">Source {index + 1}</span>
          <span className="source-page">Page {source.page_number}</span>
          <span className={`source-score ${scoreClass}`}>{scorePercent}%</span>
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="source-content animate-fade-in">
          <p>{source.text}</p>
        </div>
      )}

      <style>{`
        .source-card {
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          transition: border-color var(--transition-fast);
        }

        .source-card:hover {
          border-color: var(--text-muted);
        }

        .source-card.expanded {
          border-color: rgba(59, 130, 246, 0.3);
        }

        .source-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-secondary);
          font-size: 0.75rem;
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .source-header:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .source-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .source-label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .source-page {
          color: var(--text-muted);
        }

        .source-score {
          font-weight: 700;
          font-size: 0.7rem;
        }

        .source-content {
          padding: 10px 12px;
          font-size: 0.78rem;
          line-height: 1.55;
          color: var(--text-secondary);
          border-top: 1px solid var(--glass-border);
          background: rgba(0, 0, 0, 0.15);
        }

        .source-content p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
