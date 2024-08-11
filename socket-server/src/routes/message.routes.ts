import express from "express";
import {
  deleteMessage,
  generateGroqResponse,
  sendMessage,
  updateMessage,
  seenAllMessages,
  seenMessage,
} from "../controllers/message.controller";

const router = express.Router();

router.post("/send", sendMessage);
router.post("/ai/:conversationId", generateGroqResponse);
router.put("/:messageId", updateMessage);
router.put("/seen-all/:conversationId", seenAllMessages);
router.put("/seen/:messageId", seenMessage);
router.patch("/:messageId", deleteMessage);

export default router;
