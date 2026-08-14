import { useState, useEffect } from "react";
import { documentsAPI } from "../api/client";
import { Loader, AlertCircle } from "lucide-react";

export default function PdfViewer({ documentId, currentPage }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) {
      setPdfUrl(null);
      return;
    }

    let currentUrl = null;

    const fetchPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await documentsAPI.getPdfBlob(documentId);
        currentUrl = URL.createObjectURL(response.data);
        setPdfUrl(currentUrl);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setError("Failed to load PDF. It may have been processed before PDF storage was implemented.");
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [documentId]);

  if (!documentId) return null;

  if (loading) {
    return (
      <div className="pdf-viewer-state">
        <Loader size={24} className="spinning" />
        <p>Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer-state error-state">
        <AlertCircle size={24} />
        <p>{error}</p>
      </div>
    );
  }

  if (!pdfUrl) return null;

  return (
    <div className="pdf-viewer-container">
      <iframe
        key={`${pdfUrl}-${currentPage}`}
        src={`${pdfUrl}#page=${currentPage || 1}&view=FitH`}
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
