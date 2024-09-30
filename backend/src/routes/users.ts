import { Router } from "express";
import { auth } from "../middleware/auth";
import { getUser, getUsers } from "../controllers/usersController";

const router = Router();

/**
 * @route GET /users
 * @desc Get all users
 * @access Authenticated users (student, lecturer, HOD)
 */
router.get("/", auth(["student", "lecturer", "HOD"]), getUsers);

/**
 * @route GET /users/:recipientId
 * @desc Get a specific user by recipientId
 * @access Authenticated users (student, lecturer, HOD)
 */
router.get("/:recipientId", auth(["student", "lecturer", "HOD"]), getUser);

export default router;
