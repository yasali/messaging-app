import { authResolvers } from "./auth";
import { threadResolvers } from "./thread";
import { messageResolvers } from "./message";

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...threadResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...threadResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
  },
  Thread: {
    ...threadResolvers.Thread,
  },
  Message: {
    ...threadResolvers.Message,
  },
  User: {
    ...threadResolvers.User,
  },
};
