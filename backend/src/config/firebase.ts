import admin from "firebase-admin";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const serviceAccount = require(
  join(__dirname, "drivebox-fd469-firebase-adminsdk-fbsvc-9a9002959d.json")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "drivebox-fd469.appspot.com", // ✅ bucket name looks fine
});

export const bucket = admin.storage().bucket();
