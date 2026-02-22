import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthUser {
  userId: string;
  username: string;
}

export interface Context {
  user: AuthUser | null;
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, JWT_SECRET);
  if (
    typeof payload === "object" &&
    payload !== null &&
    typeof payload.userId === "string" &&
    typeof payload.username === "string"
  ) {
    return { userId: payload.userId, username: payload.username };
  }
  throw new Error("Invalid token payload");
}

export function getUserFromToken(token: string | undefined): AuthUser | null {
  if (!token) return null;
  try {
    const cleaned = token.startsWith("Bearer ") ? token.slice(7) : token;
    return verifyToken(cleaned);
  } catch {
    return null;
  }
}

export function requireAuth(context: Context): AuthUser {
  if (!context.user) {
    throw new GraphQLError("You must be logged in", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.user;
}
