import express from "express";
import {
  deleteMessage,
  generateGroqResponse,
  sendMessage,
  updateMessage,
  seenMessages
} from "../controllers/message.controller";

const router = express.Router();

router.post("/send", sendMessage);
router.post("/ai/:conversationId", generateGroqResponse);
router.put("/:messageId", updateMessage);
router.put("/seen/:conversationId", seenMessages);
router.delete("/:messageId", deleteMessage);

export default router;
