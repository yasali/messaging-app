import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { SEND_MESSAGE } from "../graphql/operations";

interface MessageInputProps {
  threadId: string;
}

export default function MessageInput({ threadId }: MessageInputProps) {
  const [content, setContent] = useState("");

  const [sendMessage, { loading }] = useMutation(SEND_MESSAGE);

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
