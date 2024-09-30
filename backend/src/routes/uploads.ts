import { Router } from "express";
import { auth } from "../middleware/auth";
import { UploadApiOptions } from "cloudinary";
import multer from "multer";
import { Readable } from "stream";
import { logger } from "../startup/logger";
import "dotenv/config"
import cloudinary from "../startup/cloudinary";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/",
  auth(["student", "lecturer", "HOD"]),
  upload.single("file"),
  async (req, res) => {
    console.log('start')
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    try {
      
      let uploadOptions: UploadApiOptions = { folder: "chat-forum" };
      const mimeType = req.file.mimetype;
      let fileType = "document"; 

      console.log(mimeType)
      
      if (mimeType.startsWith("image/")) {
        fileType = "image";
      } else if (mimeType.startsWith("video/")) {
        fileType = "video";
        uploadOptions.resource_type = "video";
      } else if (mimeType.startsWith("audio/")) {
        fileType = "audio";
        uploadOptions.resource_type = "video";
      }

      const uploadResult = await cloudinary.uploader.upload(
        `data:${mimeType};base64,${req.file.buffer.toString("base64")}`,
        uploadOptions
      );

      res.status(200).json({ uploadResult, type: fileType });
    } catch (error) {
      console.log(error);
    }
  }
);

export default router;
