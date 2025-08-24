import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Ensure all Firebase env variables are set
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_PRIVATE_KEY ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_STORAGE_BUCKET
) {
  throw new Error("⚠️ Missing Firebase environment variables in .env");
}

// Configure Firebase service account
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

// Export bucket for file uploads
export const bucket = admin.storage().bucket();
export default admin;
