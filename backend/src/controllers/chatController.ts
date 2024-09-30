import { Request, Response } from "express";
import Chat from "../models/chatModel";
import User from "../models/userModel";
import { logger } from "../startup/logger";
import mongoose from "mongoose";
import Course from "../models/courseModel";
import Message from "../models/messageModel";
import { redisClient } from "../startup/db";

async function cacheData(key: string, data: any, expiration = 3600) {
  const redis = await redisClient();
  return redis.set(key, JSON.stringify(data), { EX: expiration });
}

export const createChat = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findById(req.user?._id);
    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    const { userId } = req.params;

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ error: "Other user not found" });
    }

    const existingChat = await Chat.findOne({
      members: { $all: [currentUser._id, otherUser._id] },
      type: "direct",
    });

    if (existingChat) {
      return res
        .status(400)
        .json({ error: "Chat already exists between the users" });
    }

    if (!currentUser.courses || !otherUser.courses) {
      return res.status(400).json({ error: "Courses not populated correctly" });
    }

    const commonCourses = currentUser.courses.filter((course: any) =>
      otherUser.courses.some((otherCourse: any) =>
        course._id.equals(otherCourse._id)
      )
    );

    if (commonCourses.length === 0) {
      return res.status(400).json({
        error: "Both users must share at least one course to create a chat",
      });
    }

    const commonCourseIds = commonCourses?.map((course: any) => course._id);

    const chat = new Chat({
      members: [currentUser._id, otherUser._id],
      type: "direct",
      courses: commonCourseIds,
      messages: [],
      department: currentUser.department._id,
      name: `${currentUser.indexNumber} ${otherUser.indexNumber}`,
    });

    await chat.save();

    await cacheData(`chats:${currentUser._id}`, JSON.stringify(chat));
    res
      .status(201)
      .json({ message: "Direct message chat successfully created", chat });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to create chat" });
  }
};

export const getChats = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const redis = await redisClient();
  const cachedChats = await redis.get(`chats:${userId}`);
  const chats = cachedChats ? JSON.parse(cachedChats) : null

    if (chats && Array.isArray(chats) && chats.length !== 0) {
      return res
        .status(200)
        .json({ message: "Chats successfully fetched", chats });
    } else {
      logger.error("Cached chats are not in the expected format");
    }
  

  try {
    const chats = await Chat.find({ members: req.user?._id });
    await cacheData(`chats:${userId}`, JSON.stringify(chats));
    res.status(200).json({ message: "Chats successfully fetched", chats });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to get chats" });
  }
};

export const addMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, text, type } = req.body;
    // console.log(chatId);

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat id" });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    if (chat.type === "course" || chat.type === "group") {
      const message = new Message({
        chatId,
        sender: req.user?._id,
        text,
        type,
        course: chat.courses && chat.courses[0],
      });
      const response = await message.save();
      return res.status(200).json({ message: "message sent", response });
    }

    const message = await new Message({
      chatId,
      sender: req.user?._id,
      text,
      type,
    }).save();

    const chatMessages = await Message.find({ chatId });
    await cacheData(`chat:${chatId}`, chatMessages);

    res.status(200).json({ message: "Message sent", response: message });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const createCourseChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId).populate("courses");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userCourses = user.courses;

    if (!userCourses || userCourses.length === 0) {
      return res
        .status(400)
        .json({ error: "User is not enrolled in any courses" });
    }

    const userCourseNames = userCourses.map((course) => course.name);

    const existingGroupChats = await Chat.find({
      name: { $in: userCourseNames },
    });

    for (const courseName of userCourseNames) {
      let groupChat = existingGroupChats.find(
        (chat) => chat.name === courseName
      );
      const courseUsers = await User.find({ "courses.name": courseName });
      const course = await Course.findOne({ name: courseName });

      if (!groupChat) {
        const newMembersIds: any = courseUsers.map(
          (courseUser) => courseUser._id
        );
        groupChat = new Chat({
          members: [...newMembersIds],
          type: "course",
          courses: [course?._id],
          department: user.department._id,
          name: course?.name,
        });
      } else {
        const newMembersIds: any = courseUsers
          .map((courseUser) => courseUser._id)
          .filter((courseUserId: any) => {
            return !groupChat?.members.some((id) => {
              return id.toString() === courseUserId.toString();
            });
          });

        if (newMembersIds) {
          groupChat?.members.push(...newMembersIds);
        }
      }

      await groupChat.save();
    }

    res.status(200).json({ message: "Group chats managed successfully" });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to manage group chats" });
  }
};

export const createGroupChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { name, members } = req.body.data;
    const redis = await redisClient();

    if (!name || !members || !Array.isArray(members) || members.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid input: Group name and members are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const groupChat = await Chat.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });

    if (groupChat) {
      return res.status(400).json({ error: "Group name already exists" });
    }

    const uniqueMembers = Array.from(new Set([...members, user.id]));

    const chat = new Chat({
      members: uniqueMembers,
      type: "group",
      name,
      owner: user._id,
      courses: [user._id],
    });

    await chat.save();

    await cacheData(`chats:${userId}`, JSON.stringify(chat));

    res.status(200).json({ message: "Group chat created successfully", chat });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to create group chats" });
  }
};

export const addMemberToGroupChat = async (req: Request, res: Response) => {
  try {
    const { chatId, memberId } = req.body;
    const userId = req.user?._id;
    
    const chat = await Chat.findById(chatId);
    console.log(chat)
    if (!chat) {
      return res.status(404).json({ error: "Group chat not found" });
    }

    if (chat.type !== "group") {
      return res
        .status(400)
        .json({ error: "Can only add members to group chats" });
    }

    if (chat.owner?.toString() !== userId?.toString()) {
      return res
        .status(403)
        .json({ error: "Only the group owner can add members" });
    }

    const memberIds = Array.isArray(memberId) ? memberId : [memberId];

    const newMembers = memberIds.filter((id) => !chat.members.includes(id));

    if (newMembers.length === 0) {
      return res
        .status(400)
        .json({ error: "All members are already in the group chat" });
    }

    chat.members.push(...newMembers);
    await chat.save();
    

    await cacheData(`chats:${userId}`, JSON.stringify(chat));

    res.status(200).json({ message: "Member added successfully", chat });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to add member to group chat" });
  }
};

export const removeMemberFromGroupChat = async (
  req: Request,
  res: Response
) => {
  try {
    const { chatId, memberId } = req.body;
    const userId = req.user?._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Group chat not found" });
    }

    if (chat.type !== "group") {
      return res
        .status(400)
        .json({ error: "Can only remove members from group chats" });
    }

    if (chat.owner?.toString() !== userId?.toString()) {
      return res
        .status(403)
        .json({ error: "Only the group owner can remove members" });
    }

    if (chat.owner?.toString() === memberId.toString()) {
      return res.status(400).json({ error: "Owner cannot be removed" });
    }

    if (!chat.members.includes(memberId)) {
      return res.status(400).json({ error: "Member is not in the group chat" });
    }

    chat.members = chat.members.filter(
      (member) => member.toString() !== memberId
    );
    await chat.save();

    await cacheData(`chats:${userId}`, JSON.stringify(chat));

    res.status(200).json({ message: "Member removed successfully", chat });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to remove member from group chat" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { latest } = req.query;

  // const redis = await redisClient();
  // const cachedMessages = await redis.get(`chat:${chatId}`);
  // const messages = cachedMessages ? JSON.parse(cachedMessages) : null;

  // if (messages && Array.isArray(messages)) {
  //   return res
  //     .status(200)
  //     .json({ message: "Messages successfully fetched", messages });
  // } else {
  //   logger.error("Cached messages are not in the expected format");
  // }

  try {
    if (latest === "true") {
      const messages = await Message.findOne({ chatId })
        .sort({ createdAt: -1 })
        .exec();
      if (!messages) {
        return res.json({ message: "No messages found" });
      }
      return res
        .status(200)
        .json({ message: "Messages successfully fetched", messages });
    }

    const messages = await Message.find({ chatId });

    if (!messages) {
      return res.json({ message: "No messages found" });
    }

    await cacheData(`chat:${chatId}`, JSON.stringify(messages));

    return res
      .status(200)
      .json({ message: "Messages successfully fetched", messages });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

export const editGroup = async (req: Request, res: Response) => {
  try {
    const { chatId, channelName } = req.body;
    const userId = req.user?._id;

    if (!channelName || !chatId) {
      return res
        .status(400)
        .json({ error: "Channel name and chatId is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Group chat not found" });
    }

    if (chat.type !== "group") {
      return res
        .status(400)
        .json({ error: "Can only remove members from group chats" });
    }

    if (chat.owner?.toString() !== userId?.toString()) {
      return res
        .status(403)
        .json({ error: "Only the group owner can edit group" });
    }

    chat.name = channelName;
    await chat.save();
    await cacheData(`chats:${userId}`, JSON.stringify(chat));
    return res.status(200).json({ message: "Group successfully edited" });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).json({ error: "Failed to edit group" });
  }
};
