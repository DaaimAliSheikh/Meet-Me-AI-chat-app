import mongoose from "mongoose";
import { ConversationType } from "../types";

///personal convo has no participants, only admins
const conversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    public_id: {
      type: String,
    },
    description: {
      type: String,
    },

    type: {
      enum: ["personal", "group"],
      type: String,
      default: "personal",
    },
    admins: [
      {
        type: String,
        ref: "User",
        default: [],
      },
    ],
    participants: [
      {
        type: String,
        ref: "User",
        default: [],
      },
    ],
    messages: [
      {
        type: String,
        ref: "Message",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model<ConversationType>(
  "Conversation",
  conversationSchema
);

export default Conversation;
