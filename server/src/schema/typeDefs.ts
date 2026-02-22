const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    displayName: String!
    createdAt: String!
  }

  type Thread {
    id: ID!
    participants: [User!]!
    messages: [Message!]!
    lastMessage: Message
    createdAt: String!
    updatedAt: String!
  }

  type Message {
    id: ID!
    content: String!
    sender: User!
    threadId: ID!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input CreateThreadInput {
    username: String!
  }

  input SendMessageInput {
    threadId: ID!
    content: String!
  }

  type Query {
    me: User!
    threads: [Thread!]!
    thread(id: ID!): Thread!
  }

  type Mutation {
    login(input: LoginInput!): AuthPayload!
    createThread(input: CreateThreadInput!): Thread!
    sendMessage(input: SendMessageInput!): Message!
  }

  type Subscription {
    messageSent(threadId: ID!): Message!
    messageReceived: Message!
  }
`;

export default typeDefs;
