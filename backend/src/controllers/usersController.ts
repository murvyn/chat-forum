import { Request, Response } from "express";
import User from "../models/userModel";
import { IUser } from "../types/types";
import { redisClient } from "../startup/db";
import { logger } from "../startup/logger";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as IUser;
    const redis = await redisClient();

    const cacheKey = `users:${currentUser._id}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const users = JSON.parse(cachedData);
      if (Array.isArray(users) && users.length > 0) {
        return res.status(200).json({ users });
      } else {
        logger.error("Cached users are not in the expected format");
      }
    }
    const allUsers = await User.find({ _id: { $ne: currentUser?._id } })
      .select("id firstName lastName indexNumber courses role photoUrl")
      .exec();

    const currentUserCourseIds = currentUser?.courses?.map(
      (course) => course._id
    );

    const users = allUsers.filter((user) =>
      user.courses?.some((course) =>
        currentUserCourseIds?.some((currentCourseId) =>
          (course._id as any).equals(currentCourseId)
        )
      )
    );

    await redis.setEx(cacheKey, 3600, JSON.stringify({ users }));
    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving users." });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { recipientId } = req.params;
    const user = await User.findById(recipientId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    logger.error("Error fetching user:", error);
    res.status(500).json({ error: "An error occurred while retrieving user." });
  }
};
