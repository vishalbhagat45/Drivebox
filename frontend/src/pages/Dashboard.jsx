// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Folder,
  File,
  Search,
  Upload,
  Share2,
  Trash2,
  MoreVertical,
  Plus,
  Home,
  Monitor,
  Users,
  Clock,
  Star,
  ShieldAlert,
  Grid,
  Settings,
} from "lucide-react";
import { db } from "../firebase"; // ✅ import Firestore
import { collection, getDocs, query, orderBy } from "firebase/firestore";

import FileUpload from "../components/FileUpload";
import FilePreview from "../components/FilePreview";
import FileExplorer from "../components/FileExplorer";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState(["My Drive"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);

  // ✅ Fetch files from Firestore
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const q = query(collection(db, "files"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const filesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFiles(filesData);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  // Handle search & sorting (local only)
  const filteredFiles = files
    .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return (a.size || "").localeCompare(b.size || "");
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      return 0;
    });

  // Breadcrumb click navigation
  const handleBreadcrumbClick = (index) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r flex flex-col justify-between p-4">
        <div>
          {/* + New button */}
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 mb-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
          >
            <Plus size={18} /> New
          </button>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Home size={18} /> Home
            </button>
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Folder size={18} /> My Drive
            </button>
            <FileExplorer />
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Monitor size={18} /> Computers
            </button>
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Users size={18} /> Shared with me
            </button>
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Clock size={18} /> Recent
            </button>
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Star size={18} /> Starred
            </button>
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <ShieldAlert size={18} /> Spam
            </button>
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Trash2 size={18} /> Bin
            </button>
          </nav>
        </div>

        {/* Storage */}
        <div className="px-2">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
            <div
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: "45%" }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
            7.03 GB of 15 GB used
          </p>
          <button className="text-sm text-blue-600 hover:underline">
            Get more storage
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 border-b px-6 py-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Drivebox
            </span>
          </div>

          {/* Search */}
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

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Grid size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 flex flex-col p-6 overflow-y-auto">
          {/* Breadcrumbs + Sort */}
          <div className="flex items-center justify-between mb-4">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-1 cursor-pointer">
                  <span onClick={() => handleBreadcrumbClick(index)} className="hover:underline">
                    {crumb}
                  </span>
                  {index < breadcrumbs.length - 1 && <span>/</span>}
                </span>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="date">Date</option>
            </select>
          </div>

          {/* File Grid */}
          <div className="grid grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  {file.type === "folder" ? (
                    <Folder className="text-yellow-500" size={36} />
                  ) : (
                    <File className="text-blue-500" size={36} />
                  )}
                  <MoreVertical className="opacity-0 group-hover:opacity-100 transition cursor-pointer" />
                </div>
                <p className="mt-3 text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {file.size || "-"} • {file.date || ""}
                </p>

                {/* Quick actions */}
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition">
                  {file.type !== "folder" && (
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <Upload size={14} /> Preview
                    </button>
                  )}
                  <button
                    onClick={() => setShareFile(file)}
                    className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                  >
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* File Upload Modal */}
      {uploadOpen && <FileUpload onClose={() => setUploadOpen(false)} setFiles={setFiles} />}

      {/* File Preview Modal */}
      {previewFile && <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />}

      {/* Share Modal */}
      {shareFile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Share {shareFile.name}</h2>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:text-gray-200"
            />
            <select className="w-full border px-3 py-2 rounded mb-3 dark:bg-gray-700 dark:text-gray-200">
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <div className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded mb-3">
              Shareable link:{" "}
              <span className="text-blue-600">
                https://drivebox.app/file/{shareFile.id}
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShareFile(null)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
