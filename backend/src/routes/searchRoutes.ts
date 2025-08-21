import { Router } from "express";
import { search } from "../controllers/searchController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect, search);

export default router;
