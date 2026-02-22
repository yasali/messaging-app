import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  SEND_MESSAGE,
  GET_THREAD,
  GET_THREADS,
  SendMessageData,
  GetThreadData,
  GetThreadsData,
} from "../graphql/operations";

interface MessageInputProps {
  threadId: string;
}

export default function MessageInput({ threadId }: MessageInputProps) {
  const [content, setContent] = useState("");

  const [sendMessage, { loading }] = useMutation<SendMessageData>(SEND_MESSAGE, {
    update(cache, { data }) {
      if (!data?.sendMessage) return;
      const newMessage = data.sendMessage;

      // Update the active thread's message list in cache
      const existing = cache.readQuery<GetThreadData>({
        query: GET_THREAD,
        variables: { id: threadId },
      });

      if (existing) {
        const alreadyExists = existing.thread.messages.some(
          (m) => m.id === newMessage.id
        );
        if (!alreadyExists) {
          cache.writeQuery<GetThreadData>({
            query: GET_THREAD,
            variables: { id: threadId },
            data: {
              thread: {
                ...existing.thread,
                messages: [...existing.thread.messages, newMessage],
              },
            },
          });
        }
      }

      // Update the thread list's lastMessage for this thread
      const threadList = cache.readQuery<GetThreadsData>({ query: GET_THREADS });
      if (threadList) {
        cache.writeQuery<GetThreadsData>({
          query: GET_THREADS,
          data: {
            threads: threadList.threads.map((t) =>
              t.id === threadId
                ? { ...t, lastMessage: newMessage, updatedAt: newMessage.createdAt }
                : t
            ),
          },
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    sendMessage({
      variables: { input: { threadId, content: content.trim() } },
    });
    setContent("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-gray-200 bg-white flex gap-2"
    >
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
      />
      <button
        type="submit"
        disabled={!content.trim() || loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        Send
      </button>
    </form>
  );
}
