import { Request, Response } from "express";
import { generateJWT } from "../lib/generateJWT";
import { UserType } from "../types";
import User from "../models/user.model";
import sendVerifyToken from "../lib/sendVerifyToken";
import bcrypt from "bcryptjs";
import { RegisterFormSchema } from "../lib/RegisterFormSchema";
import passport from "passport";
import verifyToken from "../models/verifyToken.model";

export const googleLogin = async (req: Request, res: Response) => {
  passport.authenticate(
    "google",
    {
      session: false,
    },
    (err: Error, user: UserType) => {
      if (err) return res.redirect(process.env.CLIENT_LOGIN_URL!);
      if (!user)
        return res.redirect(process.env.CLIENT_LOGIN_URL + "?credentials=true");
      const token = generateJWT(user);
      res.cookie(process.env.COOKIE_NAME!, token, {
        httpOnly: true,
        sameSite: "strict",
      });
      return res.redirect(process.env.CLIENT_LOGIN_URL!);
    }
  )(req, res);
};

export const localLogin = async (req: Request, res: Response) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: Error, user: UserType, info: { message: string }) => {
      if (err) return res.status(400).json({ message: err.message });
      if (!user) return res.status(401).json(info); //email resent
      const token = generateJWT(user);
      res.cookie(process.env.COOKIE_NAME!, token, {
        httpOnly: true,
        sameSite: "strict",
      });
      return res.status(200).json({ user });
    }
  )(req, res);
};

export const register = async (req: Request, res: Response) => {
  const result = RegisterFormSchema.safeParse(req.body);

  if (result.error) return res.status(400).json({ message: result.error });

  try {
    const user = await User.findOne({ email: result.data.email });

    if (user) return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({
      ...result.data,
      password: await bcrypt.hash(result.data.password, 10),
    });

    await sendVerifyToken(result.data.email);
    return res.status(200).json({ message: `Verification email sent!` });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Could not register user" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie(process.env.COOKIE_NAME!, "", { maxAge: 0 });
  return res.end();
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) return res.status(400).json({ validated: false });

  try {
    const user = await verifyToken.findOne({ token }).select("email");
    if (!user) return res.status(400).json({ validated: false });
    await User.updateOne({ email: user.email }, { emailVerified: true });
    await verifyToken.deleteOne({ token });
    res.status(200).json({ validated: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ validated: false });
  }
};

export const loginSuccess = async (req: Request, res: Response) => {
  return res.status(200).json({ user: req.user });
};
