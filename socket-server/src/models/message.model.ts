import mongoose from "mongoose";
import { MessageType } from "../types";
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    imagePath: {
      type: String,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
    // createdAt, updatedAt
  },
  { timestamps: true }
);

const Message = mongoose.model<MessageType>("Message", messageSchema);

export default Message;
