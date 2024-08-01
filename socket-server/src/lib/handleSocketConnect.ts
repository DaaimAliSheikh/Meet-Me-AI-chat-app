import { Socket } from "socket.io";
import Message from "../models/message.model";

const handleSocketConnect = (socket: Socket) => {
  socket.broadcast.emit("user-joined", {
    ///to add online status
    userId: socket.handshake.query.userId,
  });

  ///every client when they receive a message will emit this event to the server
  socket.on("seen-by", async (messageId, userId) => {
    await Message.findByIdAndUpdate(messageId, { $push: { $seenBy: userId } });
  });

  socket.on("join", (conversationId) => socket.join(conversationId));
  socket.on("leave", (conversationId) => socket.leave(conversationId));
};

export default handleSocketConnect;
