import express from "express";
import {
  createConversation,
  deleteConversation,
  getConversation,
  updateAdmins,
  updateConversation,
  updateParticipants,
} from "../controllers/conversation.controller";

const router = express.Router();

router.get("/:conversationId", getConversation);
router.post("/create", createConversation);
router.delete("/:conversationId", deleteConversation);
router.put("/:conversationId", updateConversation);
router.put("/admins/:conversationId", updateAdmins);
router.put("/participants/:conversationId", updateParticipants);

export default router;
