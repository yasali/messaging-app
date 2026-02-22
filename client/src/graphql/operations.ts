import { gql } from "@apollo/client/core";

// --- Shared GraphQL response types ---

export interface GqlUser {
  id: string;
  username: string;
  displayName: string;
}

export interface GqlMessage {
  id: string;
  content: string;
  sender: GqlUser;
  threadId: string;
  createdAt: string;
}

export interface GqlThread {
  id: string;
  participants: GqlUser[];
  messages?: GqlMessage[];
  lastMessage?: GqlMessage | null;
  updatedAt: string;
}

export interface LoginData {
  login: { token: string; user: GqlUser };
}

export interface GetThreadsData {
  threads: GqlThread[];
}

export interface GqlThreadDetail extends GqlThread {
  messages: GqlMessage[];
}

export interface GetThreadData {
  thread: GqlThreadDetail;
}

export interface CreateThreadData {
  createThread: GqlThread;
}

export interface SendMessageData {
  sendMessage: GqlMessage;
}

export interface MessageReceivedData {
  messageReceived: GqlMessage;
}

// --- Operations ---

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        username
        displayName
      }
    }
  }
`;

export const GET_THREADS = gql`
  query GetThreads {
    threads {
      id
      participants {
        id
        username
        displayName
      }
      lastMessage {
        id
        content
        sender {
          id
          username
          displayName
        }
        threadId
        createdAt
      }
      updatedAt
    }
  }
`;

export const GET_THREAD = gql`
  query GetThread($id: ID!) {
    thread(id: $id) {
      id
      participants {
        id
        username
        displayName
      }
      messages {
        id
        content
        sender {
          id
          username
          displayName
        }
        threadId
        createdAt
      }
      updatedAt
    }
  }
`;

export const CREATE_THREAD = gql`
  mutation CreateThread($input: CreateThreadInput!) {
    createThread(input: $input) {
      id
      participants {
        id
        username
        displayName
      }
      lastMessage {
        id
        content
        sender {
          id
          username
          displayName
        }
        threadId
        createdAt
      }
      updatedAt
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      sender {
        id
        username
        displayName
      }
      threadId
      createdAt
    }
  }
`;

export const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription MessageReceived {
    messageReceived {
      id
      content
      sender {
        id
        username
        displayName
      }
      threadId
      createdAt
    }
  }
`;
