import { v4 as uuid } from "uuid";
import SendMail from "./SendMail";
import verifyToken from "../models/verifyToken.model";

const sendVerifyToken = async (email: string) => {
  const existingToken = await verifyToken.deleteOne({ email });
  const token = uuid();
  await verifyToken.create({ token, email });
  SendMail(email, token);
};

export default sendVerifyToken;
