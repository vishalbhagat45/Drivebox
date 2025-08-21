import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "./db";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [profile.id]
        );
        if (user.rows.length > 0) {
          return done(null, user.rows[0]);
        }

        const newUser = await pool.query(
          "INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING *",
          [profile.displayName, profile.emails?.[0].value, profile.id]
        );
        return done(null, newUser.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  done(null, user.rows[0]);
});
