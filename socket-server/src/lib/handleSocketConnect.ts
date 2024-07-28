import { Socket } from "socket.io";

const handleSocketConnect = (socket: Socket) => {
  socket.broadcast.emit("user-joined", {
    ///to add online status
    userId: socket.handshake.query.userId,
  });
  socket.on("join", (conversationId) => socket.join(conversationId));
  socket.on("leave", (conversationId) => socket.leave(conversationId));
};

export default handleSocketConnect;
