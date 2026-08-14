import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";

export default function FileUpload({ onUpload, isUploading }) {
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadProgress(0);
        onUpload(acceptedFiles[0], (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(progress);
        });
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      maxSize: 20 * 1024 * 1024,
      disabled: isUploading,
    });

  return (
    <div className="file-upload-wrapper">
      <div
        {...getRootProps()}
        className={`file-upload-zone ${isDragActive ? "drag-active" : ""} ${isUploading ? "uploading" : ""}`}
        id="file-upload-dropzone"
      >
        <input {...getInputProps()} id="file-upload-input" />

        {isUploading ? (
          <div className="upload-progress">
            <Loader size={24} className="upload-spinner" />
            <span className="upload-progress-text">
              Processing document... {uploadProgress}%
            </span>
            <div className="upload-progress-bar">
              <div
                className="upload-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <div className="upload-content">
            <FileText size={28} className="upload-icon active" />
            <span>Drop your PDF here</span>
          </div>
        ) : (
          <div className="upload-content">
            <Upload size={24} className="upload-icon" />
            <span className="upload-label">Upload PDF</span>
            <span className="upload-hint">Drag & drop or click • Max 20MB</span>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="upload-error animate-fade-in">
          <AlertCircle size={14} />
          Only PDF files under 20MB are accepted
        </div>
      )}

      <style>{`
        .file-upload-wrapper {
          padding: 12px 16px;
        }

        .file-upload-zone {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          border: 2px dashed var(--glass-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          min-height: 72px;
        }

        .file-upload-zone:hover {
          border-color: var(--accent-blue);
          background: rgba(59, 130, 246, 0.05);
        }

        .file-upload-zone.drag-active {
          border-color: var(--accent-purple);
          background: rgba(139, 92, 246, 0.08);
          animation: borderGlow 1.5s ease-in-out infinite;
        }

        .file-upload-zone.uploading {
          border-color: var(--accent-blue);
          cursor: default;
          border-style: solid;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-align: center;
        }

        .upload-icon {
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .upload-icon.active {
          color: var(--accent-purple);
        }

        .upload-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .upload-hint {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .upload-spinner {
          color: var(--accent-blue);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .upload-progress-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .upload-progress-bar {
          width: 100%;
          height: 4px;
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .upload-progress-fill {
          height: 100%;
          background: var(--gradient-primary);
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }

        .upload-error {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 0.75rem;
          color: var(--error);
        }
      `}</style>
    </div>
  );
}
