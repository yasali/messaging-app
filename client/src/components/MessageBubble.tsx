interface MessageBubbleProps {
  content: string;
  senderName: string;
  isMine: boolean;
  timestamp: string;
}

export default function MessageBubble({
  content,
  senderName,
  isMine,
  timestamp,
}: MessageBubbleProps) {
  const time = new Date(Number(timestamp)).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isMine
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        {!isMine && (
          <p className="text-xs font-medium text-gray-500 mb-1">
            {senderName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        <p
          className={`text-xs mt-1 ${
            isMine ? "text-blue-200" : "text-gray-400"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
