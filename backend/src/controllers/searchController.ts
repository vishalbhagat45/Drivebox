import { Request, Response } from "express";
import { searchAll } from "../models/searchModel";

export const search = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || "";
    if (!q.trim()) return res.status(400).json({ message: "Query 'q' is required" });

    const userId = (req as any).user.id;
    const includeTrash = req.query.includeTrash === "true";
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    const data = await searchAll({ userId, q, includeTrash, limit, offset });

    res.json({
      q,
      total: data.total,
      limit,
      offset,
      items: data.items,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
