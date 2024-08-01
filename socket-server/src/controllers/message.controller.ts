import { Request, Response } from "express";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import { io } from "../socket";
import streamFromGroq from "../groq";
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const {
      message,
      conversationId,
    }: {
      message: string;
      conversationId: string;
    } = req.body;

    let conversation = await Conversation.findOne({
      _id: conversationId,
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const newMessage = new Message({
      senderId: req.user?._id,
      conversationId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([conversation.save(), newMessage.save()]);
    ///broadcast to others if everything succeeds
    io.to(conversationId).emit("message-receive", {
      senderId: req.user?._id,
      message,
    });
    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error sending Message: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error, could not send message" });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  try {
    const deletedMessage = await Message.findOne({
      _id: messageId,
      senderId: req.user?._id,
    });

    if (!deletedMessage) {
      throw new Error("Message not found");
    }

    await Message.findByIdAndDelete(messageId);
    const conversationId = deletedMessage.conversationId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    conversation.messages = conversation.messages.filter(
      (msgId) => !msgId.equals(messageId)
    );

    await conversation.save();
    ///broadcast to others if everything succeeds

    io.to(String(conversationId)).emit("message-delete", {
      messageId,
    });
    return res.status(201).json(deletedMessage);
  } catch (error) {
    console.log("Error deleting Message: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error, could not delete message" });
    ///remove the message on client by listening to this event
  }
};

export const updateMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { message, imagePath, conversationId } = req.body;
  try {
    const existingMessage = await Message.findOne({
      _id: messageId,
      senderId: req.user?._id,
    });
    if (!existingMessage) {
      throw new Error("Message not found");
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { message, imagePath, edited: true },
      {
        new: true,
      }
    );

    io.to(conversationId).emit("message-updated", updatedMessage);
    res.status(200).json(updatedMessage);
  } catch (error) {
    console.log("Error updating Message: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error, could not update message" });
  }
};

export const generateGroqResponse = async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");
  const { conversationId } = req.params;

  const messages = req.body.messages;
  let message = "";

  io.to(conversationId).emit("ai-response-start");
  ///when ai-response-start is listened by client, it will create a new message box for the AI

  for await (const chunk of streamFromGroq(messages)) {
    io.to(conversationId).emit("ai-response", chunk || "");
    message += chunk || "";
  }

  let conversation = await Conversation.findOne({
    _id: conversationId,
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const newMessage = new Message({
    senderId: "ai", ///will return null when populate is called as no user with id "ai" exists
    conversationId,
    message,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }
  await Promise.all([conversation.save(), newMessage.save()]);

  res.json(message);
};

export const seenMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  try {
    await Message.updateMany(
      {
        seenBy: { $not: { $elemMatch: { $eq: req.user?._id } } },
        conversationId,
      },
      { $push: { seenBy: req.user?._id } }
    );

    const messageIds = await Message.find().select("_id");

    io.to(conversationId).emit("seen", {
      ///seenBy would be a SET(for each message) on the frontend, just push this id in the set, stays unique
      //attach seen listener on frontend before making this http request
      userId: req.user?._id,
    });

    res.status(200).json({ message: "Messages seen successfully" });
  } catch (error) {
    console.log("Error updating Message: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error, could not update message" });
  }
};
