import { GraphQLError } from "graphql";
import { prisma } from "../prisma";

export async function createThread(currentUserId: string, targetUsername: string) {
  const targetUser = await prisma.user.findUnique({
    where: { username: targetUsername },
  });

  if (!targetUser) {
    throw new GraphQLError(`User "${targetUsername}" not found`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  if (targetUser.id === currentUserId) {
    throw new GraphQLError("Cannot create a thread with yourself", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  // Check for existing thread between these two users
  const existing = await prisma.thread.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: currentUserId } } },
        { participants: { some: { userId: targetUser.id } } },
      ],
    },
    include: {
      participants: { include: { user: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: true },
      },
    },
  });

  if (existing) return existing;

  return prisma.thread.create({
    data: {
      participants: {
        create: [
          { userId: currentUserId },
          { userId: targetUser.id },
        ],
      },
    },
    include: {
      participants: { include: { user: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: true },
      },
    },
  });
}

export async function getThreadsForUser(userId: string) {
  const threads = await prisma.thread.findMany({
    where: {
      participants: { some: { userId } },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      participants: { include: { user: true } },
      // Only fetch the latest message for thread list preview
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: true },
      },
    },
  });

  // Map the single-element messages array into _lastMessage for the resolver
  return threads.map((t) => ({
    ...t,
    _lastMessage: t.messages[0] || null,
    messages: [], // Don't expose all messages on the list query
  }));
}

export async function getThreadById(threadId: string, userId: string) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      participants: { include: { user: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: true },
      },
    },
  });

  if (!thread) {
    throw new GraphQLError("Thread not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const isMember = thread.participants.some((p) => p.userId === userId);
  if (!isMember) {
    throw new GraphQLError("You are not a member of this thread", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return thread;
}
