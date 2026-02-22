import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_THREAD, GET_THREADS, CreateThreadData } from "../graphql/operations";

interface NewThreadDialogProps {
  onClose: () => void;
  onCreated: (threadId: string) => void;
}

export default function NewThreadDialog({ onClose, onCreated }: NewThreadDialogProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const [createThread, { loading }] = useMutation<CreateThreadData>(CREATE_THREAD, {
    refetchQueries: [{ query: GET_THREADS }],
    onCompleted: (data) => {
      onCreated(data.createThread.id);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) return;
    createThread({ variables: { input: { username: username.trim() } } });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-thread-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="new-thread-title" className="text-lg font-semibold text-gray-900 mb-4">
          New Conversation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-thread-username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="new-thread-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g. bob, diana, charlie, alice"
              autoFocus
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Start Chat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
