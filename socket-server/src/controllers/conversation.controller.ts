import { Request, Response } from "express";
import Conversation from "../models/conversation.model";
import mongoose from "mongoose";
import Message from "../models/message.model";
import { io } from "../socket";

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
    })
      .populate({
        path: "messages",
        select: "-conversationId -updatedAt",
        populate: { path: "senderId", select: "username _id image" },
      })
      .populate({ path: "participants", select: "username _id image" })
      .populate({ path: "admins", select: "username _id image" });

    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in getMessages controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const conversation = await Conversation.create(req.body);
    ///admin should be the creator of the conversation by default

    io.to(String(conversation._id)).emit("new-conversation", {
      conversationId: conversation._id,
      userId: req.user?._id,
    });
    ///client will listen for this event and will emit join event
    //creator of the group will first emit join event before calling the api
    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in createConversation controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  try {
    const conversation = await Conversation.deleteOne({ _id: conversationId });
    await Message.deleteMany({ conversationId });
    ///admin should be the creator of the conversation by default

    io.to(conversationId).emit("conversation-deleted", {
      conversationId,
      userId: req.user?._id,
    });

    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in deleteConversation controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  try {
    const conversation = await Conversation.updateOne(
      { conversationId },
      req.body
    );

    io.to(conversationId).emit("conversation-updated", req.body);

    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in updateConversation controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAdmins = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { admins }: { admins: mongoose.Schema.Types.ObjectId[] } = req.body;
  try {
    const conversation = await Conversation.updateOne(
      { conversationId },
      { admins }
    );

    io.to(conversationId).emit("admins-updated", admins);

    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in updateAdmins controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateParticipants = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { participants }: { participants: mongoose.Schema.Types.ObjectId[] } =
    req.body;
  try {
    const conversation = await Conversation.updateOne(
      { conversationId },
      { participants }
    );

    io.to(conversationId).emit("participants-updated", participants);

    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in updateParticipants controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
