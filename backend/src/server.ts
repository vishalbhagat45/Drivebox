// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import fileRoutes from "./routes/fileRoutes";
import searchRoutes from "./routes/searchRoutes";

import authRoutes from "./routes/authRoutes";
import "./config/passport"; // registers Google strategy

dotenv.config();

const app = express();

// --- Core middleware ---
app.use(cors({
  origin: "http://localhost:5173",   // frontend URL
  credentials: true                  // allow cookies / credentials
}));                 // add options here if you need specific origins
app.use(express.json());

// --- Sessions (required for Passport OAuth) ---
app.set("trust proxy", 1); // safe to keep for local; helps when deploying behind proxies
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sessionsecret_dev_only",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set to true when behind HTTPS in production
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// --- Passport ---
app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/search", searchRoutes);

app.get("/", (_req, res) => {
  res.send("DriveBox Backend is running 🚀");
});

// --- Start server ---
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
