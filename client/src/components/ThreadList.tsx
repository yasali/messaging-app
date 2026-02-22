import { useQuery } from "@apollo/client/react";
import { GET_THREADS } from "../graphql/operations";
import { useAuth } from "../hooks/useAuth";

interface ThreadListProps {
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
}

export default function ThreadList({
  selectedThreadId,
  onSelectThread,
  onNewThread,
}: ThreadListProps) {
  const { user } = useAuth();
  const { data, loading } = useQuery<any>(GET_THREADS, {
    pollInterval: 3000,
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Chats</h2>
        <button
          onClick={onNewThread}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && !data && (
          <p className="p-4 text-gray-500 text-sm">Loading...</p>
        )}
        {data?.threads.length === 0 && (
          <p className="p-4 text-gray-500 text-sm">
            No conversations yet. Start one!
          </p>
        )}
        {data?.threads.map((thread: any) => {
          const otherParticipant = thread.participants.find(
            (p: any) => p.id !== user?.id
          );
          const lastMessage = thread.messages[thread.messages.length - 1];
          const isSelected = thread.id === selectedThreadId;

          return (
            <button
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                isSelected ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  {otherParticipant?.displayName ?? "Unknown"}
                </span>
                {lastMessage && (
                  <span className="text-xs text-gray-400">
                    {new Date(Number(lastMessage.createdAt)).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              {lastMessage && (
                <p className="text-sm text-gray-500 truncate mt-1">
                  {lastMessage.content}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
