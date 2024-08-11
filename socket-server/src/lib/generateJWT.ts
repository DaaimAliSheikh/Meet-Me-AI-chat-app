import jwt from "jsonwebtoken";
import { UserType } from "../types";

export const generateJWT = (user: UserType) => {
  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7days" }
  );
  return token;
};
