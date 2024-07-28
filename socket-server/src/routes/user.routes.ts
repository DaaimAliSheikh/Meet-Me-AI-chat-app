import express from "express";
import passport from "passport";
import { getUsersForSidebar } from "../controllers/users.controller";

const router = express.Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getUsersForSidebar
);

export default router;
