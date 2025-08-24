import { Request, Response, NextFunction } from "express";
import admin from "../firebase"; // Correct relative path

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      user?: { uid: string; email?: string; name?: string };
    }
  }
}

// Protect routes middleware
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid, email: decodedToken.email, name: decodedToken.name };
    next();
  } catch (err) {
    console.error("Firebase token verification failed:", err);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
