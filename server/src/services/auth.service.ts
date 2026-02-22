import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import { prisma } from "../prisma";
import { signToken } from "../context";

const MAX_USERNAME_LENGTH = 30;

export async function login(username: string, password: string) {
  if (!username || username.length > MAX_USERNAME_LENGTH) {
    throw new GraphQLError("Username must be between 1 and 30 characters", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

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
