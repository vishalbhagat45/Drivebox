// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ----------------- 🔹 Firestore Helpers -----------------

// Create Folder
export const createFolder = async (name, parentId, userId) => {
  const folderRef = await addDoc(collection(db, "folders"), {
    name,
    parentId: parentId || "root",
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    starred: false,
  });
  await logActivity(userId, "create_folder", { folderId: folderRef.id, name });
  return folderRef;
};

// Rename Item (file or folder)
export const renameItem = async (collectionName, id, newName, userId) => {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, { name: newName, updatedAt: serverTimestamp() });
  await logActivity(userId, "rename_item", { id, newName, collection: collectionName });
};

// Delete Item (file or folder)
export const deleteItem = async (collectionName, id, userId) => {
  const ref = doc(db, collectionName, id);
  await deleteDoc(ref);
  await logActivity(userId, "delete_item", { id, collection: collectionName });
};

// Move Item
export const moveItem = async (collectionName, id, newParentId, userId) => {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, { parentId: newParentId, updatedAt: serverTimestamp() });
  await logActivity(userId, "move_item", { id, newParentId, collection: collectionName });
};

// Toggle Star (Day 15)
export const toggleStar = async (collectionName, id, isStarred, userId) => {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, { starred: isStarred, updatedAt: serverTimestamp() });
  await logActivity(userId, isStarred ? "star_item" : "unstar_item", {
    id,
    collection: collectionName,
  });
};

// ----------------- 🔹 Sharing & Permissions (Day 17-18) -----------------

// Share file with email
export const shareFileWithEmail = async (fileId, email, userId) => {
  const ref = doc(db, "files", fileId);
  await updateDoc(ref, {
    sharedWith: [email], // can extend to arrayUnion if needed
  });
  await logActivity(userId, "share_file", { fileId, email });
};

// Update file/folder permissions
export const updatePermissions = async (fileId, permissions, userId) => {
  const ref = doc(db, "files", fileId);
  await updateDoc(ref, { permissions, updatedAt: serverTimestamp() });
  await logActivity(userId, "update_permissions", { fileId, permissions });
};

// ----------------- 🔹 Activity Logs (Day 19) -----------------
export const logActivity = async (userId, action, details = {}) => {
  return await addDoc(collection(db, "activities"), {
    userId,
    action, // e.g., upload_file, share_file, update_permissions, etc.
    details,
    timestamp: serverTimestamp(),
  });
};

// Fetch activity logs for a user
export const getUserLogs = async (userId) => {
  const q = query(collection(db, "activities"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

// Analytics (only if in browser)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;
