import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);

  return (
    <div className="chat-page" id="chat-page">
      <Sidebar
        documents={documents}
        setDocuments={setDocuments}
        selectedDocId={selectedDocId}
        onSelectDoc={setSelectedDocId}
      />
      <ChatWindow selectedDocId={selectedDocId} documents={documents} />

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
