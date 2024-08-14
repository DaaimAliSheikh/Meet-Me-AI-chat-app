import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import { app, server } from "./socket";
import path from "path";
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
import cloudinaryRoutes from "./routes/cloudinary.routes";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());
passport.use(localStrategy);
passport.use(googleStrategy);
passport.use(jwtStrategy);

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/cloudinary", cloudinaryRoutes);

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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log("server error");
  return res.status(500).json({ error: err.message });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.all("*", (req: Request, res: Response) => {
  res.json({
    message: path.join(__dirname, "public"),
  });
});

const PORT = process.env.PORT || 3000;
(async () => {
  await connectToMongoDB();
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
