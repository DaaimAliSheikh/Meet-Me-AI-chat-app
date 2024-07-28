import mongoose from "mongoose";

const verifyTokenSchema = new mongoose.Schema(
  {
    email: {
      required: true,
      type: String,
    },
    token: {
      required: true,
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

const verifyToken = mongoose.model("verifyToken", verifyTokenSchema);

export default verifyToken;
