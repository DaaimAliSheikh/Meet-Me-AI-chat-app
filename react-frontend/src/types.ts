import { Socket } from "socket.io-client";

export interface UserType {
  _id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  provider: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface ConversationType {
  _id: string;
  name: string;
  image?: string;
  public_id?: string;
  description?: string;
  type: string;
  admins: ChatListUser[];
  participants: ChatListUser[];
  messages: MessageType[];
  updatedAt: Date;
  createdAt: Date;
}

export interface ChatListUser {
  _id: string; //user ID
  username: string;
  image: string | null;
}
export interface ChatListGroup {
  _id: string; //conversation ID
  name: string;
  image?: string;
}

export interface MessageType {
  _id: string;
  senderId: string;
  conversationId: string;
  message: string;
  image: string;
  public_id: string;
  seenBy: string[];
  edited: boolean;

  updatedAt: Date;
  createdAt: Date;
}

export interface IUserStore {
  user: UserType | null;
  setUser: (newUser: UserType | null) => void;
}
export interface IConversationStore {
  conversation: {
    type: string | null;
    _id: string | null;
    name: string | null;
    image: string | null;
  } | null;
  ///if personal then this will be otherUserId, else convo id

  setConversation: (
    conversation: {
      type: string;
      _id: string;
      name: string | null;
      image: string | null;
    } | null
  ) => void;
}

export interface ISocketStore {
  onlineUsers: string[];
  socket: Socket | null;
  setOnlineUsers: (users: string[]) => void;
}
