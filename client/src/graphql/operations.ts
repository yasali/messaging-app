import { gql } from "@apollo/client/core";

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

export const ME = gql`
  query Me {
    me {
      id
      username
      displayName
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
      messages {
        id
        content
        sender {
          id
          username
          displayName
        }
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
      messages {
        id
        content
        sender {
          id
          username
          displayName
        }
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

export const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription MessageSent($threadId: ID!) {
    messageSent(threadId: $threadId) {
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
