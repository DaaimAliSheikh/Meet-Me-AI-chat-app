export interface UserType {
  _id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  password?: string | null;
  image: string;
  provider: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface MessageType {
  _id: string;
  senderId: string;
  conversationId: string;
  message: string;
  image: string;
  public_id: string;
  seenBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationType = {
  _id: string;
  name: string;
  description: string;
  image?: string;
  public_id?: string;
  type: string;
  participants: string[];
  admins: string[];
  messages: string[];
  createdAt: Date;
  updatedAt: Date;
};
