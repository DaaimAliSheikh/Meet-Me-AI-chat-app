import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import Message from "./models/message.model";

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL!, ///update during production
    credentials: true,
  })
);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL!, ///update during production
    credentials: true,
  },
});

let onlineUsersIds: Map<string, string> = new Map();
//socket id to user id

const handleSocketConnect = (socket: Socket) => {
  if (
    !Array.from(onlineUsersIds.values()).find(
      (key) => key === (socket.handshake.query.userId as string)
    )
  )
    onlineUsersIds.set(socket.id, socket.handshake.query.userId as string);
  io.emit("onlineUsers", {
    onlineUsersIds: Array.from(onlineUsersIds.values()),
  });

  ///every client when they receive a message will emit this event to the server
  socket.on("seen-by", async (messageId, userId) => {
    await Message.findByIdAndUpdate(messageId, { $push: { $seenBy: userId } });
  });

  let hasJoined = false;
  socket.on("join", (conversationId) => {
    if (hasJoined) return;
    socket.join(conversationId);
    hasJoined = true;
  });

  socket.on("leave", (conversationId) => {
    socket.leave(conversationId);
    hasJoined = false;
  });
};

const handleSocketDisconnect = (socket: Socket) => {
  ///to remove online status
  onlineUsersIds.delete(socket.id);
  io.emit("onlineUsers", {
    onlineUsersIds: Array.from(onlineUsersIds.values()),
  });
};

io.on("connection", (socket) => {
  handleSocketConnect(socket);
  socket.on("disconnect", () => {
    handleSocketDisconnect(socket);
  });
});

io.on("error", (err: Error) => {
  console.error("Socket IO Server Error:", err);
});

//client only makes a connection when signed in

export { app, io, server };
