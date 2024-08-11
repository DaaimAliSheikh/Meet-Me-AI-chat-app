import mongoose from "mongoose";
import { UserType } from "../types";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      required: true,
      default: "credentials",
    },
  },
  { timestamps: true }
);

const User = mongoose.model<UserType>("User", userSchema);

export default User;
