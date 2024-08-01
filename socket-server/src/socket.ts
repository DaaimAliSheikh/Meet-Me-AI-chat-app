import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

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

//client only makes a connection when signed in

export { app, io, server };
