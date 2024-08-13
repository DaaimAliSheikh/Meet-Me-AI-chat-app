import mongoose from "mongoose";
import { MessageType } from "../types";
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: String,
      ref: "Conversation",
      required: true,
    },
    message: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
    public_id: {
      type: String,
      default: "",
    },
    seenBy: [
      {
        type: String,
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
