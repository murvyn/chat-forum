import { Router } from "express";
import {
  getChats,
  createChat,
  createCourseChat,
  getMessages,
  createGroupChat,
  addMemberToGroupChat,
  removeMemberFromGroupChat,
  editGroup,
} from "../controllers/chatController";
import { auth } from "../middleware/auth";

const router = Router();

/**
 * Create a direct chat with a specific user
 */
router.post(
  "/create-direct-chat/:userId",
  auth(["student", "lecturer", "HOD"]),
  createChat
);

/**
 * Manage course-specific chats
 */
router.post(
  "/manage-course-chats",
  auth(["student", "lecturer", "HOD"]),
  createCourseChat
);

/**
 * Create a new group chat
 */
router.post(
  "/create-group-chat",
  auth(["student", "lecturer", "HOD"]),
  createGroupChat
);

/**
 * Add a member to an existing group chat
 */
router.post(
  "/group-chat/add-member",
  auth(["student", "lecturer", "HOD"]),
  addMemberToGroupChat
);

/**
 * Remove a member from a group chat
 */
router.put(
  "/group-chat/remove-member",
  auth(["student", "lecturer", "HOD"]),
  removeMemberFromGroupChat
);

/**
 * Edit group chat details
 */
router.put(
  "/group-chat/edit-group",
  auth(["student", "lecturer", "HOD"]),
  editGroup
);

/**
 * Get all chats for the authenticated user
 */
router.get("/", auth(["student", "lecturer", "HOD"]), getChats);

/**
 * Get messages for a specific chat
 */
router.get(
  "/:chatId/messages",
  auth(["student", "lecturer", "HOD"]),
  getMessages
);

export default router;
