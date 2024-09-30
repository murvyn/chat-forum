import { Request, Response } from "express";
import Feed from "../models/feedModel";
import { logger } from "../startup/logger";

export const postFeed = async (req: Request, res: Response) => {
  try {
    const { text, images, audio, video } = req.body;

    const feed = new Feed({
      author: req.user?._id,
      text,
      images,
      audio,
      video,
    });

    await feed.save();

    res.status(201).json({ message: "feed successfully posted", feed });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "failed to post feed" });
  }
};

export const getFeed = async (req: Request, res: Response) => {
  try {
    const feed = await Feed.find({ author: req.params.id });

    res.status(200).json({ message: "feed successfully fetched", feed });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "failed to get feed" });
  }
};
