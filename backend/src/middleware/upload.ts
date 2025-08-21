import multer from "multer";

// Store files temporarily in memory before uploading to Firebase
const storage = multer.memoryStorage();
export const upload = multer({ storage });
