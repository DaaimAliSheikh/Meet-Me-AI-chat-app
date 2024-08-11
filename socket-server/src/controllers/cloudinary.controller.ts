import "../cloudinary.config";
import { Request, Response, NextFunction } from "express";

import { v2 as cloudinary } from "cloudinary";
const apiSecret = cloudinary.config().api_secret as string;
const apikey = cloudinary.config().api_key;
const cloudName = cloudinary.config().cloud_name;

const signuploadform = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: "meet-me",
    },
    apiSecret
  );

  return { timestamp, signature };
};
export const cloudinaryUploadForm = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sig = signuploadform();
  res.json({
    signature: sig.signature,
    timestamp: sig.timestamp,
    cloudname: cloudName,
    apikey,
  });
};

