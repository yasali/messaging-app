import { GraphQLError } from "graphql";
import { prisma } from "../prisma";

const MAX_MESSAGE_LENGTH = 5000;

export async function sendMessage(userId: string, threadId: string, content: string) {
  if (!content.trim()) {
    throw new GraphQLError("Message content cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    throw new GraphQLError(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  // Verify user is a participant
  const participant = await prisma.threadParticipant.findUnique({
    where: { threadId_userId: { threadId, userId } },
  });

  if (!participant) {
    throw new GraphQLError("You are not a member of this thread", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  // Create message and update thread's updatedAt in a transaction
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        threadId,
        senderId: userId,
        content: content.trim(),
      },
      include: { sender: true },
    }),
    prisma.thread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
}
