import { Context, requireAuth } from "../../context";
import { prisma } from "../../prisma";
import * as authService from "../../services/auth.service";

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      const user = requireAuth(context);
      return prisma.user.findUniqueOrThrow({ where: { id: user.userId } });
    },
  },
  Mutation: {
    login: async (_: unknown, { input }: { input: { username: string; password: string } }) => {
      return authService.login(input.username, input.password);
    },
  },
};
