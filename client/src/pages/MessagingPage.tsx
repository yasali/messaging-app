import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ThreadList from "../components/ThreadList";
import ChatView from "../components/ChatView";
import NewThreadDialog from "../components/NewThreadDialog";

export default function MessagingPage() {
  const { user, logout } = useAuth();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showNewThread, setShowNewThread] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <h1 className="font-bold text-gray-900">Messenger</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {user?.displayName}
          </span>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thread list panel */}
        <div className="w-80 shrink-0">
          <ThreadList
            selectedThreadId={selectedThreadId}
            onSelectThread={setSelectedThreadId}
            onNewThread={() => setShowNewThread(true)}
          />
        </div>

        {/* Chat panel */}
        {selectedThreadId ? (
          <ChatView threadId={selectedThreadId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation or start a new one
          </div>
        )}
      </div>

      {/* New thread dialog */}
      {showNewThread && (
        <NewThreadDialog
          onClose={() => setShowNewThread(false)}
          onCreated={(threadId) => {
            setShowNewThread(false);
            setSelectedThreadId(threadId);
          }}
        />
      )}
    </div>
  );
}
