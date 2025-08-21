// src/controllers/fileController.ts
import { Request, Response } from "express";
import { bucket } from "../config/firebase";
import * as fileModel from "../models/fileModel";
import { v4 as uuidv4 } from "uuid";
import pool from "../config/db"; // ✅ needed for custom queries
import { Multer } from "multer";

// ------------------- Upload -------------------
export const uploadFile = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const file = req.file as Express.Multer.File;
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    const blob = bucket.file(uniqueName);

    const blobStream = blob.createWriteStream({
      metadata: { contentType: file.mimetype },
    });

    blobStream.on("error", (err) => {
      console.error("Firebase upload error:", err);
      res.status(500).json({ message: "Upload error", error: err });
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      try {
        const savedFile = await fileModel.createFile(
          file.originalname,
          req.body.folderId ? Number(req.body.folderId) : null,
          (req as any).user.id,
          uniqueName, // store internal path, not public URL
          file.size,
          file.mimetype
        );
        res.status(201).json({ message: "File uploaded", file: savedFile });
      } catch (err) {
        console.error("DB save error:", err);
        res.status(500).json({ message: "Database error", error: err });
      }
    });

    blobStream.end(file.buffer);
  } catch (err) {
    console.error("Upload handler error:", err);
    res.status(500).json({ message: "Unexpected server error", error: err });
  }
};

// ------------------- Get Files -------------------
export const getFiles = async (req: Request, res: Response) => {
  try {
    const { folderId, includeTrash } = req.query;
    const userId = (req as any).user.id;
    const files = await fileModel.listFiles(
      folderId ? Number(folderId) : null,
      userId,
      includeTrash === "true"
    );
    res.json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Error fetching files" });
  }
};

// ------------------- Rename File -------------------
export const renameFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;
    const userId = (req as any).user.id;

    const perm = await pool.query(
      "SELECT role FROM permissions WHERE file_id=$1 AND user_id=$2",
      [id, userId]
    );
    if (!perm.rows.length)
      return res.status(403).json({ msg: "No access to this file" });

    if (perm.rows[0].role === "viewer")
      return res.status(403).json({ msg: "View-only access" });

    const updated = await fileModel.renameFile(Number(id), userId, newName);
    if (!updated) return res.status(404).json({ error: "File not found" });

    res.json(updated);
  } catch (err) {
    console.error("Error renaming file:", err);
    res.status(500).json({ error: "Error renaming file" });
  }
};

// ------------------- Soft Delete File -------------------
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const perm = await pool.query(
      "SELECT role FROM permissions WHERE file_id=$1 AND user_id=$2",
      [id, userId]
    );
    if (!perm.rows.length)
      return res.status(403).json({ msg: "No access to this file" });

    if (perm.rows[0].role === "viewer")
      return res.status(403).json({ msg: "View-only access" });

    await fileModel.softDeleteFile(Number(id), userId);
    res.json({ message: "File moved to Trash" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Error deleting file" });
  }
};

// ------------------- Restore File -------------------
export const restoreFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const perm = await pool.query(
      "SELECT role FROM permissions WHERE file_id=$1 AND user_id=$2",
      [id, userId]
    );
    if (!perm.rows.length)
      return res.status(403).json({ msg: "No access to this file" });

    await fileModel.restoreFile(Number(id), userId);
    res.json({ message: "File restored" });
  } catch (err) {
    console.error("Error restoring file:", err);
    res.status(500).json({ error: "Error restoring file" });
  }
};

// ------------------- Permanent Delete File -------------------
export const permanentDeleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const perm = await pool.query(
      "SELECT role FROM permissions WHERE file_id=$1 AND user_id=$2",
      [id, userId]
    );
    if (!perm.rows.length)
      return res.status(403).json({ msg: "No access to this file" });

    if (perm.rows[0].role !== "owner")
      return res.status(403).json({ msg: "Only owner can delete permanently" });

    await fileModel.permanentDeleteFile(Number(id), userId);
    res.json({ message: "File permanently deleted" });
  } catch (err) {
    console.error("Error permanently deleting file:", err);
    res.status(500).json({ error: "Error permanently deleting file" });
  }
};

// ------------------- Shareable Link -------------------
export const generateShareableLink = async (req: Request, res: Response) => {
  const { fileId } = req.params;
  const userId = (req as any).user.id;

  try {
    const perm = await pool.query(
      "SELECT role FROM permissions WHERE file_id=$1 AND user_id=$2",
      [fileId, userId]
    );
    if (!perm.rows.length || perm.rows[0].role !== "owner") {
      return res.status(403).json({ msg: "Only owner can generate links" });
    }

    const shareableLink = uuidv4();
    await pool.query("UPDATE files SET shareable_link=$1 WHERE id=$2", [
      shareableLink,
      fileId,
    ]);

    res.json({
      msg: "Shareable link generated",
      link: `${process.env.APP_URL}/share/${shareableLink}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ------------------- Access Shared File -------------------
export const accessSharedFile = async (req: Request, res: Response) => {
  const { link } = req.params;

  try {
    const file = await pool.query(
      "SELECT * FROM files WHERE shareable_link=$1",
      [link]
    );

    if (!file.rows.length) return res.status(404).json({ msg: "Invalid link" });

    const [signedUrl] = await bucket
      .file(file.rows[0].storage_path)
      .getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000,
      });

    res.json({
      file: {
        name: file.rows[0].name,
        url: signedUrl,
        role: file.rows[0].role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const searchFiles = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ msg: "Query required" });
    }

    const offset = (Number(page) - 1) * Number(limit);

    const result = await pool.query(
      `SELECT * FROM files 
       WHERE to_tsvector('english', name) @@ plainto_tsquery('english', $1)
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [q, limit, offset]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✨ Autocomplete (prefix search)
export const autocompleteFiles = async (req: Request, res: Response) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q) {
      return res.status(400).json({ msg: "Query required" });
    }

    const result = await pool.query(
      `SELECT id, name FROM files
       WHERE name ILIKE $1
       ORDER BY name ASC
       LIMIT $2`,
      [`${q}%`, limit]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// 🕒 Recent files
export const recentFiles = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      `SELECT * FROM files
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getFilesPaged = async (req: Request, res: Response) => {
  try {
    const { folderId, includeTrash, limit, offset } = req.query;
    const userId = (req as any).user.id;
    const pageSize = Math.min(Number(limit) || 20, 100);
    const pageOffset = Number(offset) || 0;

    const files = await fileModel.listFilesPaged(
      folderId ? Number(folderId) : null,
      userId,
      includeTrash === "true",
      pageSize,
      pageOffset
    );

    res.json({ items: files, limit: pageSize, offset: pageOffset });
  } catch (err) {
    console.error("Error fetching files paged:", err);
    res.status(500).json({ error: "Error fetching files" });
  }
};

export const moveFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newParentId } = req.body;
    const userId = (req as any).user.id;

    const perm = await pool.query(
      "SELECT role FROM permissions WHERE file_id=$1 AND user_id=$2",
      [id, userId]
    );
    if (!perm.rows.length || perm.rows[0].role === "viewer") {
      return res.status(403).json({ msg: "No permission to move" });
    }

    const updated = await fileModel.moveFile(Number(id), userId, newParentId ? Number(newParentId) : null);
    res.json({ message: "File moved", file: updated });
  } catch (err) {
    console.error("Error moving file:", err);
    res.status(500).json({ error: "Error moving file" });
  }
};

export const starFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { starred } = req.body;
    const userId = (req as any).user.id;

    const updated = await fileModel.starFile(Number(id), userId, starred);
    res.json({ message: starred ? "File starred" : "File unstarred", file: updated });
  } catch (err) {
    console.error("Error starring file:", err);
    res.status(500).json({ error: "Error starring file" });
  }
};
