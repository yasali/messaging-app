import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_THREAD, GetThreadData, GqlUser, GqlMessage } from "../graphql/operations";
import { useAuth } from "../hooks/useAuth";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

interface ChatViewProps {
  threadId: string;
}

export default function ChatView({ threadId }: ChatViewProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useQuery<GetThreadData>(GET_THREAD, {
    variables: { id: threadId },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.thread?.messages.length]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        Failed to load conversation. Please try again later.
      </div>
    );
  }

  const thread = data?.thread;
  if (!thread) return null;

  const otherParticipant = thread.participants.find(
    (p: GqlUser) => p.id !== user?.id
  );

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-gray-900">
          {otherParticipant?.displayName ?? "Chat"}
        </h3>
        <p className="text-xs text-gray-500">@{otherParticipant?.username}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {thread.messages.length === 0 && (
          <p className="text-center text-gray-400 mt-8">
            No messages yet. Say hello!
          </p>
        )}
        {thread.messages.map((message: GqlMessage) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            senderName={message.sender.displayName}
            isMine={message.sender.id === user?.id}
            timestamp={message.createdAt}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput threadId={threadId} />
    </div>
  );
}
