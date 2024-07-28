import express from "express";
import {
  deletedMessage,
  generateGroqResponse,
  sendMessage,
  updateMessage,
} from "../controllers/message.controller";

const router = express.Router();

router.post("/send", sendMessage);
router.post("/ai/:conversationId", generateGroqResponse);
router.put("/:messageId", updateMessage);
router.delete("/:messageId", deletedMessage);

export default router;
