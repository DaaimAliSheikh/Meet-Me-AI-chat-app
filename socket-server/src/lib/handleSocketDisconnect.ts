import {  Socket } from "socket.io";

const handleSocketDisconnect = (socket: Socket) => {
  ///to remove online status
  socket.broadcast.emit("user-left", { userId: socket.handshake.query.userId });
};

export default handleSocketDisconnect;
