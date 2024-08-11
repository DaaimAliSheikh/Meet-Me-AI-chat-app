import express from "express";
import passport from "passport";
import { getUsers } from "../controllers/users.controller";

const router = express.Router();

router.get("/", passport.authenticate("jwt", { session: false }), getUsers);

export default router;
