import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

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
  return jwt.verify(token, JWT_SECRET) as AuthUser;
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
