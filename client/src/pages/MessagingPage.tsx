import { useState } from "react";
import { useApolloClient, useSubscription } from "@apollo/client/react";
import { useAuth } from "../hooks/useAuth";
import ThreadList from "../components/ThreadList";
import ChatView from "../components/ChatView";
import NewThreadDialog from "../components/NewThreadDialog";
import {
  MESSAGE_RECEIVED_SUBSCRIPTION,
  GET_THREAD,
  GET_THREADS,
  MessageReceivedData,
  GetThreadData,
  GetThreadsData,
  GqlThread,
} from "../graphql/operations";

export default function MessagingPage() {
  const { user, logout } = useAuth();
  const client = useApolloClient();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showNewThread, setShowNewThread] = useState(false);

  // Single user-level subscription for all incoming messages
  useSubscription<MessageReceivedData>(MESSAGE_RECEIVED_SUBSCRIPTION, {
    onData: ({ data: subData }) => {
      const newMessage = subData.data?.messageReceived;
      if (!newMessage) return;

      const { threadId } = newMessage;

      // 1. Update the active thread's message list (if we have it in cache)
      const existingThread = client.readQuery<GetThreadData>({
        query: GET_THREAD,
        variables: { id: threadId },
      });

      if (existingThread) {
        const alreadyExists = existingThread.thread.messages.some(
          (m) => m.id === newMessage.id
        );
        if (!alreadyExists) {
          client.writeQuery<GetThreadData>({
            query: GET_THREAD,
            variables: { id: threadId },
            data: {
              thread: {
                ...existingThread.thread,
                messages: [...existingThread.thread.messages, newMessage],
              },
            },
          });
        }
      }

      // 2. Update the thread list: set lastMessage and reorder
      const threadList = client.readQuery<GetThreadsData>({ query: GET_THREADS });
      if (threadList) {
        const threads = threadList.threads;
        const idx = threads.findIndex((t: GqlThread) => t.id === threadId);

        if (idx !== -1) {
          // Thread exists — update lastMessage and move to top
          const updated = {
            ...threads[idx],
            lastMessage: newMessage,
            updatedAt: newMessage.createdAt,
          };
          const reordered = [
            updated,
            ...threads.slice(0, idx),
            ...threads.slice(idx + 1),
          ];
          client.writeQuery<GetThreadsData>({
            query: GET_THREADS,
            data: { threads: reordered },
          });
        } else {
          // New thread we don't know about yet — refetch the list
          client.refetchQueries({ include: [GET_THREADS] });
        }
      }
    },
  });

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
