import { Router } from "express";
import passport from "passport";
import { signup, login, logout } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";

const router = Router();

// Local Auth
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected example
router.get("/me", protect, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: any, res) => {
    // Create JWT after Google login
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    // You can redirect with token in query or set as cookie
    res.redirect(`/dashboard?token=${token}`);
  }
);

export default router;
