import express from "express";
import {
  googleLogin,
  localLogin,
  logout,
  register,
  verifyEmail,
  loginSuccess,
} from "../controllers/auth.controller";
import passport from "passport";

const router = express.Router();

router.post("/register", register);

router.post("/login", localLogin);
router.get(
  "/login/success",
  passport.authenticate("jwt", { session: false }),

  loginSuccess
);

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

router.get("/verifyemail/:token", verifyEmail);

export default router;
