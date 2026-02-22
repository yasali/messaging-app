import type { User, Thread, ThreadParticipant, Message } from "@prisma/client";

export type UserWithRelations = User;

export type MessageWithSender = Message & {
  sender: User;
};

export type ThreadParticipantWithUser = ThreadParticipant & {
  user: User;
};

export type ThreadWithRelations = Thread & {
  participants: ThreadParticipantWithUser[];
  messages: MessageWithSender[];
  _lastMessage?: MessageWithSender | null;
};
