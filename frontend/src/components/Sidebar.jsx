import { useState, useEffect, useCallback } from "react";
import { documentsAPI } from "../api/client";
import FileUpload from "./FileUpload";
import {
  FileText,
  Trash2,
  LogOut,
  Brain,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  documents,
  setDocuments,
  selectedDocId,
  onSelectDoc,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { logout, user } = useAuth();

  const fetchDocuments = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await documentsAPI.list();
      setDocuments(res.data.documents);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setRefreshing(false);
    }
  }, [setDocuments]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Poll for status updates if any document is processing
  useEffect(() => {
    const hasProcessing = documents.some((doc) => doc.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchDocuments();
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const handleUpload = useCallback(
    async (file, onProgress) => {
      setIsUploading(true);
      try {
        const res = await documentsAPI.upload(file, onProgress);
        await fetchDocuments();
        onSelectDoc(res.data.id);
      } catch (err) {
        console.error("Upload failed:", err);
        alert(err.response?.data?.detail || "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [fetchDocuments, onSelectDoc],
  );

  const handleDelete = useCallback(
    async (e, docId) => {
      e.stopPropagation();
      if (!confirm("Delete this document and all its chat history?")) return;
      try {
        await documentsAPI.delete(docId);
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        if (selectedDocId === docId) {
          onSelectDoc(null);
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
    },
    [selectedDocId, onSelectDoc, setDocuments],
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "ready":
        return <CheckCircle size={12} className="status-ready" />;
      case "processing":
        return <Loader size={12} className="status-processing" />;
      case "error":
        return <AlertCircle size={12} className="status-error" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ready":
        return <span className="badge badge-success">Ready</span>;
      case "processing":
        return <span className="badge badge-warning">Processing</span>;
      case "error":
        return <span className="badge badge-error">Error</span>;
      default:
        return null;
    }
  };

  return (
    <aside className="sidebar" id="sidebar">
      {}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Brain size={20} />
          </div>
          <h2 className="sidebar-logo-text">
            Doc<span className="gradient-text">Mind</span>
          </h2>
        </div>
      </div>

      {}
      <FileUpload onUpload={handleUpload} isUploading={isUploading} />

      {}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-title">Your Documents</span>
          <button
            className="btn-icon"
            onClick={fetchDocuments}
            title="Refresh"
            id="refresh-documents-btn"
          >
            <RefreshCw size={14} className={refreshing ? "spinning" : ""} />
          </button>
        </div>

        <div className="sidebar-documents" id="documents-list">
          {documents.length === 0 ? (
            <div className="sidebar-empty">
              <FileText size={24} />
              <p>No documents yet</p>
              <span>Upload a PDF to get started</span>
            </div>
          ) : (
            documents.map((doc) => (
              <button
                key={doc.id}
                className={`doc-item ${selectedDocId === doc.id ? "selected" : ""} ${
                  doc.status !== "ready" ? "disabled" : ""
                }`}
                onClick={() => doc.status === "ready" && onSelectDoc(doc.id)}
                id={`doc-item-${doc.id}`}
              >
                <div className="doc-item-info">
                  <div className="doc-item-name">
                    {getStatusIcon(doc.status)}
                    <span>{doc.filename}</span>
                  </div>
                  <div className="doc-item-meta">
                    {getStatusBadge(doc.status)}
                    <span>{doc.page_count} pages</span>
                    <span>{doc.chunk_count} chunks</span>
                  </div>
                </div>
                <button
                  className="btn-icon doc-delete"
                  onClick={(e) => handleDelete(e, doc.id)}
                  title="Delete document"
                >
                  <Trash2 size={14} />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-user-email">{user?.email}</span>
        </div>
        <button
          className="btn-icon"
          onClick={logout}
          title="Sign out"
          id="logout-btn"
        >
          <LogOut size={16} />
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 300px;
          min-width: 300px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-right: 1px solid var(--glass-border);
        }

        .sidebar-header {
          padding: 20px 16px 12px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--gradient-primary);
          color: white;
        }

        .sidebar-logo-text {
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .sidebar-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 0 8px;
        }

        .sidebar-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 8px 4px;
        }

        .sidebar-section-title {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        .sidebar-documents {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 4px 0;
        }

        .sidebar-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 32px 16px;
          color: var(--text-muted);
          text-align: center;
        }

        .sidebar-empty p {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .sidebar-empty span {
          font-size: 0.75rem;
        }

        .doc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--text-primary);
          text-align: left;
          width: 100%;
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .doc-item:hover {
          background: var(--bg-hover);
        }

        .doc-item.selected {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .doc-item.disabled {
          opacity: 0.6;
          cursor: default;
        }

        .doc-item-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .doc-item-name {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .doc-item-name span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-ready { color: var(--success); }
        .status-processing {
          color: var(--warning);
          animation: spin 2s linear infinite;
        }
        .status-error { color: var(--error); }

        .doc-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .doc-delete {
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .doc-item:hover .doc-delete {
          opacity: 1;
        }

        .doc-delete:hover {
          color: var(--error) !important;
        }

        .sidebar-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-top: 1px solid var(--glass-border);
        }

        .sidebar-user-email {
          font-size: 0.78rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;
        }
      `}</style>
    </aside>
  );
}
