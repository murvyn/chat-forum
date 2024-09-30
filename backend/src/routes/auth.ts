/* This TypeScript code is defining a router in an Express application. It imports necessary modules
such as `express`, `multer`, `bcrypt`, `cloudinary`, and custom modules like controllers, models,
middleware, and types. */
import { Router } from "express";
import {
  forgotPassword,
  login,
  resetPasswordGet,
  resetPasswordPost,
} from "../controllers/authController";
import multer from "multer";
import { IUser } from "../types/types";
import User from "../models/userModel";
import { logger } from "../startup/logger";
import bcrypt from "bcrypt";
import { UploadApiOptions } from "cloudinary";
import cloudinary from "../startup/cloudinary";
import { auth } from "../middleware/auth";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:id/:token", resetPasswordGet);
router.post("/reset-password/:id/:token", resetPasswordPost);
router.put(
  "/",
  auth(["student", "lecturer", "HOD"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const currentUser = req.user as IUser;
      const data = req.body;
      const user = await User.findOne({ _id: currentUser._id }).select(
        "+password"
      );
      if (!user) {
        logger.error("No user");
        return res.status(409).json({ error: "No user" });
      }
      if (data.photoUrl) {
        user.photoUrl = data.photoUrl;
        await user.save();
        return res.status(200).json({ message: "updated", user });
      }
      if (req.file) {
        let uploadOptions: UploadApiOptions = { folder: "chat-forum" };
        const mimeType = req.file.mimetype;
        const uploadResult = await cloudinary.uploader.upload(
          `data:${mimeType};base64,${req.file.buffer.toString("base64")}`,
          uploadOptions
        );
        user.photoUrl = uploadResult.url;
        await user.save();
        return res.status(200).json({ message: "uploaded", user });
      }
      if (data.oldPassword && data.newPassword) {
        const isValidPassword = await bcrypt.compare(
          data.oldPassword,
          user.password
        );
        if (isValidPassword) {
          user.password = await bcrypt.hash(data.newPassword, 10);
          await user.save();
          return res.status(201).json({ message: "user updated" });
        } else {
          logger.error("Incorrect password");
          return res.status(409).json({ error: "Incorrect password" });
        }
      }
    } catch (error) {
      logger.error("An error occurred while updating user.", error);
      res.status(500).json({ error: "An error occurred while updating user." });
    }
  }
);

export default router;
