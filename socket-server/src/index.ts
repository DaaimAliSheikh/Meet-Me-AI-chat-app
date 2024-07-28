import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { app, server } from "./socket";
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());
passport.use(localStrategy);
passport.use(googleStrategy);
passport.use(jwtStrategy);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);

const PORT = process.env.PORT || 3000;
(async () => {
  await connectToMongoDB();
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
