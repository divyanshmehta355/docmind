import { useState, useEffect } from "react";
import { documentsAPI } from "../api/client";
import { Loader, AlertCircle } from "lucide-react";

export default function PdfViewer({ document, currentPage }) {
  if (!document) return null;

  if (!document.pdf_url) {
    return (
      <div className="pdf-viewer-state error-state">
        <AlertCircle size={24} />
        <p>This document does not have a valid Cloud PDF URL. Please re-upload it.</p>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      <iframe
        key={`${document.pdf_url}-${currentPage}`}
        src={`${document.pdf_url}#page=${currentPage || 1}&view=FitH`}
        title="PDF Viewer"
        className="pdf-iframe"
      />

      <style>{`
        .pdf-viewer-container {
          flex: 1;
          height: 100%;
          background: #323639; /* Standard PDF viewer background */
          border-right: 1px solid var(--glass-border);
          display: flex;
        }

        .pdf-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .pdf-viewer-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 100%;
          border-right: 1px solid var(--glass-border);
          color: var(--text-muted);
          background: var(--bg-secondary);
        }

        .error-state {
          color: var(--error);
          text-align: center;
          padding: 24px;
        }
      `}</style>
    </div>
  );
}
