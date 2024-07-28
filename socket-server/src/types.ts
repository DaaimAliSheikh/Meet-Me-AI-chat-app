import mongoose from "mongoose";

export interface UserType {
  _id: mongoose.Types.ObjectId;
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
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  message: string;
  imagePath: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationType = {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};
