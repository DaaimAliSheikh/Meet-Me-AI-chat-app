import express from "express";
import {
  createConversation,
  deleteConversation,
  getConversationById,
  updateConversation,
  getGroupConversations,
  getPersonalConversation,
  leaveConversation,
} from "../controllers/conversation.controller";

const router = express.Router();

router.get("/groups", getGroupConversations);
router.get("/personal/:otherUserId", getPersonalConversation);
router.get("/:conversationId", getConversationById);
router.post("/create", createConversation);
router.patch("/:conversationId", deleteConversation);
router.put("/:conversationId", updateConversation);
router.put("/leave/:conversationId", leaveConversation);

export default router;
