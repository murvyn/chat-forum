import express, { Application } from "express";
import { error } from "../middleware/error";
import cors, { CorsOptions } from "cors";
import auth from "../routes/auth";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import feed from "../routes/feed";
import chat from "../routes/chat";
import users from "../routes/users";
import message from "../routes/message";
import uploads from "../routes/uploads";

import "dotenv/config";
import { logger } from "./logger";
import { RtcRole, RtcTokenBuilder, RtmTokenBuilder } from "agora-token";

export const routes = (app: Application) => {
  const corsOptions: CorsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  };

  app.use(express.json({ limit: "50mb" }));
  app.use(cors(corsOptions));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  app.use("/api/auth", auth);
  app.use("/api/feed", feed);
  app.use("/api/chats", chat);
  app.use("/api/users", users);
  app.use("/api/message", message);
  app.use("/api/uploads", uploads);
  app.post("/api/generate-rtc-token", (req, res) => {
    const { channelName, uid } = req.body;
    console.log(channelName, uid);

    const role = RtcRole.PUBLISHER;

    if (!channelName || !uid) {
      logger.error("Missing required parameters for rtc");
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const tokenExpirationInSecond = 3600;
    const privilegeExpirationInSecond = 3600;

    const tokenWithUid = RtcTokenBuilder.buildTokenWithUid(
      process.env.APP_ID!,
      process.env.APP_CERTIFICATE!,
      channelName,
      uid,
      role,
      tokenExpirationInSecond,
      privilegeExpirationInSecond
    );
    res.json({ tokenWithUid });
  });
 
  app.post("/api/generate-rtm-token", (req, res) => {
    const { uid } = req.body;

    if (!uid) {
      logger.error("Missing required parameters for rtm");
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const expirationInSeconds = 3600;

    const token = RtmTokenBuilder.buildToken(
      process.env.APP_ID!,
      process.env.APP_CERTIFICATE!,
      uid,
      expirationInSeconds
    );
    res.json({ token });
  });

  app.use(error);
};
