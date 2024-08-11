import { Request, Response } from "express";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import { io } from "../socket";
import { v2 as cloudinary } from "cloudinary";

export const getGroupConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.find({
      type: "group",
      $or: [
        {
          admins: req.user?._id,
        },
        {
          participants: req.user?._id,
        },
      ],
    }).select("_id name image");

    res.status(200).json(conversations);
  } catch (error) {
    console.log("Error in getGroupConversations controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPersonalConversation = async (req: Request, res: Response) => {
  const { otherUserId } = req.params;
  try {
    const conversation = await Conversation.findOne({
      type: "personal",
      admins: { $all: [req.user?._id, otherUserId] }, ///personal convo has no participants, only admins
    })
      .populate({ path: "participants", select: "_id username image" })
      .populate({ path: "admins", select: "_id username image" })
      .populate({ path: "messages" });

    if (!conversation) {
      return res.status(400).json({ message: "Conversation not found" });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in getPersonalConversation controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params; ///other user id

    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        {
          admins: req.user?._id,
        },
        { participants: req.user?._id },
      ],
    })
      .populate({
        path: "messages",
      })
      .populate({ path: "participants", select: "_id username image" })
      .populate({ path: "admins", select: "_id username image" });

    if (!conversation) {
      return res.status(400).json({ message: "Conversation not found" });
    }
    return res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in getConversationById controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    //name, description, type, image, admins, public_id participants
    const conversation = await Conversation.create(req.body);

    conversation.populate({
      path: "participants",
      select: "_id username image",
    });
    conversation.populate({ path: "admins", select: "_id username image" });
    conversation.populate({ path: "messages" });
    ///creator should be in the admins of the conversation by default
    io.emit("conversation-refetch", req.user?._id); ///invalidate queries on frontend
    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in createConversation controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { public_id } = req.body;
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      admins: { $elemMatch: { $eq: req.user?._id } },
    });
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (public_id) await cloudinary.uploader.destroy(public_id);
    await Conversation.deleteOne({ _id: conversationId });
    (await Message.find({ conversationId }).select("public_id")).forEach(
      async (message) => {
        if (message.public_id)
          await cloudinary.uploader.destroy(message.public_id);
      }
    );

    await Message.deleteMany({ conversationId });
    ///admin should be the creator of the conversation by default

    ///received by all users and clears the currently selected convo
    io.emit("conversation-delete", req.user?._id, conversationId);

    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in deleteConversation controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const {
    admins,
    participants,
    name,
    description,
    public_id,
    prev_public_id,
    image,
  } = req.body;

  try {
    if (prev_public_id) await cloudinary.uploader.destroy(prev_public_id);

    //if new image string is sent then update, if empty string is sent then leave it

    const conversation = await Conversation.updateOne(
      { _id: conversationId, admins: req.user?._id },
      image && public_id
        ? { admins, participants, name, description, image, public_id }
        : { admins, participants, name, description }
    );
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    io.emit(
      "conversation-update",
      req.user?._id,
      conversationId,
      admins,
      participants
    ); ///invalidate queries on frontend

    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in updateAdmins controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const leaveConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  try {
    const conversation = await Conversation.updateOne(
      { _id: conversationId },
      { $pull: { admins: req.user?._id, participants: req.user?._id } }
    );
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    io.emit("conversation-refetch", req.user?._id); ///invalidate queries on frontend

    res.status(200).json(conversation);
  } catch (error) {
    console.log("Error in updateAdmins controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
