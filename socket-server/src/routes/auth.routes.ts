import express from "express";
import {
  googleLogin,
  localLogin,
  logout,
  register,
  verifyEmail,
} from "../controllers/auth.controller";
import passport from "passport";

const router = express.Router();

router.post("/register", register);

router.post("/login", localLogin);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get("/callback/google", googleLogin);

router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  logout
);

router.get("/verifyemail", verifyEmail);

export default router;
