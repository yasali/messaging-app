import { GraphQLError } from "graphql";
import { Context, requireAuth } from "../../context";
import { pubsub } from "../../pubsub";
import { prisma } from "../../prisma";
import * as messageService from "../../services/message.service";

export const messageResolvers = {
  Mutation: {
    sendMessage: async (
      _: unknown,
      { input }: { input: { threadId: string; content: string } },
      context: Context
    ) => {
      const user = requireAuth(context);
      const message = await messageService.sendMessage(
        user.userId,
        input.threadId,
        input.content
      );

      // Publish to per-thread channel (for clients viewing this specific thread)
      await pubsub.publish(`MESSAGE_SENT:${input.threadId}`, {
        messageSent: message,
      });

      // Publish to per-user channels (for all participants' thread lists)
      const participants = await prisma.threadParticipant.findMany({
        where: { threadId: input.threadId },
        select: { userId: true },
      });
      for (const p of participants) {
        await pubsub.publish(`MESSAGE_RECEIVED:${p.userId}`, {
          messageReceived: message,
        });
      }

      return message;
    },
  },
  Subscription: {
    messageSent: {
      subscribe: async (
        _: unknown,
        { threadId }: { threadId: string },
        context: Context
      ) => {
        const user = requireAuth(context);

        // Verify thread membership
        const participant = await prisma.threadParticipant.findUnique({
          where: {
            threadId_userId: { threadId, userId: user.userId },
          },
        });

        if (!participant) {
          throw new GraphQLError("You are not a member of this thread", {
            extensions: { code: "FORBIDDEN" },
          });
        }

        return pubsub.asyncIterator(`MESSAGE_SENT:${threadId}`);
      },
    },
    messageReceived: {
      subscribe: async (
        _: unknown,
        __: unknown,
        context: Context
      ) => {
        const user = requireAuth(context);
        return pubsub.asyncIterator(`MESSAGE_RECEIVED:${user.userId}`);
      },
    },
  },
};
