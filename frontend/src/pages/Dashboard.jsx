// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Folder,
  File,
  Search,
  Upload,
  Share2,
  MoreVertical,
  Grid,
  Settings,
} from "lucide-react";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import Sidebar from "../components/Sidebar";
import FileUpload from "../components/FileUpload";
import FilePreview from "../components/FilePreview";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [files, setFiles] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState(["My Drive"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);

  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");
  const [activities, setActivities] = useState([]);
  const [activeSection, setActiveSection] = useState("myDrive");

  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();
  const cacheRef = useRef(null);

  // 🔹 Settings dropdown state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Fetch files depending on section
  const fetchFiles = async (isLoadMore = false) => {
    if (!user) return;

    let q;
    const filesRef = collection(db, "files");

    switch (activeSection) {
      case "shared":
        q = query(
          filesRef,
          where("sharedWith", "array-contains", user.email),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        break;
      case "recent":
        q = query(
          filesRef,
          where("userId", "==", user.uid),
          orderBy("lastAccessed", "desc"),
          limit(20)
        );
        break;
      case "starred":
        q = query(
          filesRef,
          where("userId", "==", user.uid),
          where("starred", "==", true),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        break;
      case "trash":
        q = query(
          filesRef,
          where("userId", "==", user.uid),
          where("isTrashed", "==", true),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        break;
      case "computers":
        q = query(
          filesRef,
          where("userId", "==", user.uid),
          where("source", "==", "computer"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        break;
      default:
        q = query(
          filesRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        break;
    }

    const snapshot = await getDocs(q);
    const newFiles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (isLoadMore) {
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles);
      cacheRef.current = newFiles;
    }

    if (snapshot.docs.length > 0) {
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    }
  };

  // 🔹 Fetch recent activities
  const fetchActivities = async () => {
    if (!user) return;
    const q = query(
      collection(db, "activities"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(5)
    );
    const snapshot = await getDocs(q);
    setActivities(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchFiles();
    fetchActivities();
  }, [user, activeSection]);

  // Infinite scroll
  const lastFileRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true);
          fetchFiles(true).then(() => setLoadingMore(false));
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, lastDoc, activeSection]
  );

  // Search + sort
  const filteredFiles = files
    .filter((f) => f.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return (a.size || 0) - (b.size || 0);
      if (sortBy === "date")
        return (
          new Date(b.createdAt?.toDate?.() || b.createdAt || 0) -
          new Date(a.createdAt?.toDate?.() || a.createdAt || 0)
        );
      return 0;
    });

  // Breadcrumb click
  const handleBreadcrumbClick = (index) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  // ✅ Handle Sharing
  const handleShare = async () => {
    if (!shareEmail || !shareFile) return;
    try {
      await addDoc(collection(db, "shares"), {
        fileId: shareFile.id,
        fileName: shareFile.name,
        ownerId: user.uid,
        sharedWith: shareEmail,
        role: shareRole,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "activities"), {
        userId: user.uid,
        action: "Shared file",
        details: { name: shareFile.name, sharedWith: shareEmail, role: shareRole },
        timestamp: serverTimestamp(),
      });

      alert("File shared successfully!");
      setShareFile(null);
      setShareEmail("");
      setShareRole("viewer");
      fetchActivities();
    } catch (err) {
      console.error("Error sharing file:", err);
    }
  };

  // ✅ Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login"; // redirect to login
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar active={activeSection} setActive={setActiveSection} setUploadOpen={setUploadOpen} />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 border-b px-6 py-2 relative">
          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
            Drivebox
          </span>

          <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full w-[40%] shadow-sm">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search in Drive"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent ml-2 outline-none text-sm w-full dark:text-gray-200"
            />
          </div>

          <div className="flex items-center gap-4" ref={dropdownRef}>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Grid size={20} />
            </button>
            {/* Settings with dropdown */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen((prev) => !prev)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings size={20} />
              </button>
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border rounded-lg shadow-lg z-50">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => {
                      alert("Drivebox Settings clicked!");
                      setSettingsOpen(false);
                    }}
                  >
                    Drivebox Settings
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        {/* ... same as your code (files, breadcrumbs, activities, modals) ... */}

        {/* Upload Modal */}
        {uploadOpen && <FileUpload onClose={() => setUploadOpen(false)} setFiles={setFiles} />}
        {previewFile && <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />}
        {shareFile && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            {/* share modal content same as your code */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
