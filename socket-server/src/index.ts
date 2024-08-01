import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { app, io, server } from "./socket";
///cors setting done in socket.ts
import connectToMongoDB from "./db/connectToMongodb";
import passport from "passport";
import cookieParser from "cookie-parser";
import {
  googleStrategy,
  jwtStrategy,
  localStrategy,
} from "./lib/passportStrategies";
import authRoutes from "./routes/auth.routes";
import messageRoutes from "./routes/message.routes";
import conversationRoutes from "./routes/conversation.routes";
import userRoutes from "./routes/user.routes";
import handleSocketConnect from "./lib/handleSocketConnect";
import handleSocketDisconnect from "./lib/handleSocketDisconnect";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());
passport.use(localStrategy);
passport.use(googleStrategy);
passport.use(jwtStrategy);

app.use("/api/auth", authRoutes);
app.use(
  "/api/messages",
  passport.authenticate("jwt", { session: false }),
  messageRoutes
);
app.use(
  "/api/users",
  passport.authenticate("jwt", { session: false }),
  userRoutes
);
app.use(
  "/api/conversations",
  passport.authenticate("jwt", { session: false }),
  conversationRoutes
);

io.on("connection", (socket) => {
  handleSocketConnect(socket);
  socket.on("disconnect", () => {
    handleSocketDisconnect(socket);
  });
});

io.on("error", (err: Error) => {
  console.error("Socket IO Server Error:", err);
});

const PORT = process.env.PORT || 3000;
(async () => {
  await connectToMongoDB();
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
