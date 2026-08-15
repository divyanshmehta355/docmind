import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import PdfViewer from "../components/PdfViewer";

export default function ChatPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPdf, setShowPdf] = useState(false);

  const handleSelectDoc = (id) => {
    setSelectedDocId(id);
    setCurrentPage(1); // Reset page on document switch
    setShowPdf(false); // Hide PDF by default when switching docs
  };

  const handleSourceClick = (page) => {
    setCurrentPage(page);
    setShowPdf(true); // Automatically show PDF when citation is clicked
  };

  return (
    <div className="chat-page" id="chat-page">
      <Sidebar
        documents={documents}
        setDocuments={setDocuments}
        selectedDocId={selectedDocId}
        onSelectDoc={handleSelectDoc}
      />

      {selectedDocId && showPdf && (
        <PdfViewer
          document={documents.find((d) => d.id === selectedDocId)}
          currentPage={currentPage}
        />
      )}

      <ChatWindow
        selectedDocId={selectedDocId}
        documents={documents}
        onSourceClick={handleSourceClick}
        showPdf={showPdf}
        setShowPdf={setShowPdf}
      />

      <style>{`
        .chat-page {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
