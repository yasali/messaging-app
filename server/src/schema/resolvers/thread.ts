import { Context, requireAuth } from "../../context";
import * as threadService from "../../services/thread.service";

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
    participants: (thread: any) =>
      thread.participants.map((p: any) => p.user),
  },
};
