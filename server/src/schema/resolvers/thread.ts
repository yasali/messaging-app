import { Context, requireAuth } from "../../context";
import { prisma } from "../../prisma";
import * as threadService from "../../services/thread.service";
import { ThreadWithRelations, ThreadParticipantWithUser, MessageWithSender } from "../../types";

export const threadResolvers = {
  Query: {
    threads: async (_: unknown, __: unknown, context: Context) => {
      const user = requireAuth(context);
      return threadService.getThreadsForUser(user.userId);
    },
    thread: async (_: unknown, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);
      return threadService.getThreadById(id, user.userId);
    },
  },
  Mutation: {
    createThread: async (
      _: unknown,
      { input }: { input: { username: string } },
      context: Context
    ) => {
      const user = requireAuth(context);
      return threadService.createThread(user.userId, input.username);
    },
  },
  Thread: {
    participants: (thread: ThreadWithRelations) =>
      thread.participants.map((p: ThreadParticipantWithUser) => p.user),
    lastMessage: async (thread: ThreadWithRelations) => {
      // If already loaded (e.g. from getThreadsForUser), use it
      if (thread._lastMessage !== undefined) return thread._lastMessage;
      // Otherwise lazy-load from DB
      return prisma.message.findFirst({
        where: { threadId: thread.id },
        orderBy: { createdAt: "desc" },
        include: { sender: true },
      });
    },
    createdAt: (thread: ThreadWithRelations) => thread.createdAt.toISOString(),
    updatedAt: (thread: ThreadWithRelations) => thread.updatedAt.toISOString(),
  },
  Message: {
    createdAt: (message: MessageWithSender) => message.createdAt.toISOString(),
  },
  User: {
    createdAt: (user: { createdAt: Date }) => user.createdAt.toISOString(),
  },
};
