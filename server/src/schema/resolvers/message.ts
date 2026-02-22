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

      pubsub.publish(`MESSAGE_SENT:${input.threadId}`, {
        messageSent: message,
      });

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

        return pubsub.asyncIterableIterator(`MESSAGE_SENT:${threadId}`);
      },
    },
  },
};
