import { Request } from "express";
import { UserType } from "./types";

declare global {
  namespace Express {
    interface Request {
      user?: UserType; // Add the custom property
    }
  }
}
