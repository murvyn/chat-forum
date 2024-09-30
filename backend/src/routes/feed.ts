import { Router } from "express";
import { getFeed, postFeed } from "../controllers/feedController";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/", auth(["lecturer", "HOD"]), postFeed);
router.get("/", auth(["student", "lecturer", "HOD"]), getFeed);

export default router;
