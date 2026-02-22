import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import { prisma } from "../prisma";
import { signToken } from "../context";

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new GraphQLError("Invalid username or password", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new GraphQLError("Invalid username or password", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const token = signToken({ userId: user.id, username: user.username });

  return { token, user };
}
