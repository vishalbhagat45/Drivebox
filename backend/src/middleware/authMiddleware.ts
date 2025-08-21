import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db";

interface JwtPayload {
  id: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name?: string; email?: string };
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      // Fetch user details from DB
      const userRes = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [decoded.id]);
      const user = userRes.rows[0];

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};
