import { Router } from "express";
import multer from "multer";
import {
  uploadFile,
  getFiles,
  renameFile,
  deleteFile,
  restoreFile,
  permanentDeleteFile,
  accessSharedFile ,
  generateShareableLink,
  searchFiles,
  autocompleteFiles,
  recentFiles,
  getFilesPaged,
  starFile
} from "../controllers/fileController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", protect, upload.single("file"), uploadFile);
router.get("/", protect, getFiles);
router.put("/:id/rename", protect, renameFile);
router.delete("/:id", protect, deleteFile);
router.put("/:id/restore", protect, restoreFile);
router.delete("/:id/permanent", protect, permanentDeleteFile);
router.post("/:fileId/share", protect, generateShareableLink);
router.get("/share/:link", accessSharedFile);
router.get("/search", protect, searchFiles);
router.get("/autocomplete", protect, autocompleteFiles);
router.get("/recent", protect, recentFiles);
router.get("/file",protect,getFilesPaged);
router.put("/:id/star", protect, starFile);


export default router;
