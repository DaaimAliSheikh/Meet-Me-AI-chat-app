import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import handleSocketConnect from "./lib/handleSocketConnect";
import handleSocketDisconnect from "./lib/handleSocketDisconnect";

const app = express();
app.use(
  cors({
    origin: "*", ///update during production
    credentials: true,
  })
);
const server = http.createServer(app);
const io = new Server(server);

const connectSocket = () => {
  io.on("connection", (socket) => {
    handleSocketConnect(socket);
    socket.on("disconnect", () => {
      handleSocketDisconnect(socket);
    });
  });

  io.on("error", (err: Error) => {
    console.error("Socket IO Server Error:", err);
  });
};

export { app, io, server, connectSocket };
