import { Router } from "express";
import { addMessage } from "../controllers/chatController";
import { auth } from "../middleware/auth";

const router = Router();

/**
 * Route to send a message in a chat.
 * Authenticated users (students, lecturers, HODs) can send messages.
 */
router.post("/send-message", auth(["student", "lecturer", "HOD"]), addMessage);

export default router;
