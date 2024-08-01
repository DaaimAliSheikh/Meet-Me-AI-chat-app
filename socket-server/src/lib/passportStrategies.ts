import { Strategy as PassportLocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";

import User from "../models/user.model";
import sendVerifyToken from "./sendVerifyToken";
import { LoginFormSchema } from "./LoginFormSchema";

//local strategy for login
export const localStrategy = new PassportLocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    session: false, ///important for JWT
  },
  async (email, password, done) => {
    const result = LoginFormSchema.safeParse({ email, password });

    if (result.error)
      return done(null, false, { message: "Invalid credentials" });
    try {
      const user = await User.findOne({ email: result.data.email });

      if (!user) return done(null, false, { message: "User not found" });

      if (user.provider !== "credentials") {
        return done(null, false, {
          message: "Email already registered through Google",
        });
      }

      if (
        !user.password ||
        !(await bcrypt.compare(result.data.password, user.password))
      )
        return done(null, false, { message: "Invalid credentials" });

      if (!user.emailVerified) {
        await sendVerifyToken(result.data.email);
        return done(null, false, { message: "New verification email sent!" });
      }

      return done(null, user);
    } catch (e) {
      console.log(e);
      return done(e);
    }
  }
);

//google strategy for login/register
export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    proxy: true,
  },
  async (accessToken, refreshToken, profile, done) => {
    // Extract user information from profile
    const { id, displayName, emails, photos } = profile;

    // `emails` is an array of email addresses
    const email = emails && emails.length > 0 ? emails[0].value : null;

    // `photos` is an array of URLs to profile pictures
    const image = photos && photos.length > 0 ? photos[0].value : null;
    const username = displayName ? displayName : id;
    try {
      const user = await User.findOne({
        email,
      }).select("-password");

      if (!user) {
        //create user and call
        const newUser = await User.create({
          username,
          image,
          email,
          emailVerified: true,
          provider: "google",
        });
        return done(null, newUser);
      } else if (user.provider !== "google") {
        return done(null, false);
      } else {
        return done(null, user);
      }
    } catch (e) {
      console.log(e);
      return done(e);
    }
  }
);

// JWT strategy for authorizing routes with  passport.authenticate("jwt", { session: false }) middleware
export const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromExtractors([
      (req) => req.cookies[process.env.COOKIE_NAME!],
    ]),
    secretOrKey: process.env.JWT_SECRET!,
  },
  async (payload: { id: string }, done) => {
    try {
      done(null, await User.findById(payload.id).select("-password"));
    } catch (e) {
      console.log("Error in protected route", e);
      done(e);
    }
  }
);
