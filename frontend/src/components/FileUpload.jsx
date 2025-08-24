import React, { useState, useEffect } from "react";
import {
  storage,
  db,
  logActivity,
  shareFileWithEmail,
  updatePermissions,
  createFolder,
  renameItem,
  deleteItem,
  moveItem,
} from "../firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import FileList from "./FileList";

const FileUpload = ({ user }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("root");
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "root", name: "My Drive" }]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterBy, setFilterBy] = useState("all");
  const [showTrash, setShowTrash] = useState(false);

  // ✅ Fetch files + folders for current folder
  const fetchFilesAndFolders = async () => {
    const q = query(collection(db, "files"), where("deleted", "==", false));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    setFiles(items.filter((i) => i.type !== "folder"));
    setFolders(items.filter((i) => i.type === "folder"));
  };

  useEffect(() => {
    fetchFilesAndFolders();
  }, []);

  // ✅ Upload file + log activity
  const handleUpload = () => {
    if (!file || !user) return;

    const storageRef = ref(storage, `uploads/${currentFolder}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (error) => console.error(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);

        const docRef = await addDoc(collection(db, "files"), {
          name: file.name,
          url,
          size: file.size,
          type: file.type,
          parentId: currentFolder,
          createdAt: serverTimestamp(),
          trashed: false,
          deleted: false,
          sharedWith: [],
          permissions: { [user.uid]: "owner" }, // default owner
        });

        await logActivity(user.uid, "upload_file", { fileId: docRef.id, name: file.name });

        setFile(null);
        setProgress(0);
        fetchFilesAndFolders();
      }
    );
  };

  // ✅ Create folder
  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name) return;
    await createFolder(name, currentFolder, user.uid);
    await logActivity(user.uid, "create_folder", { name });
    fetchFilesAndFolders();
  };

  // ✅ Share file by email
  const handleShare = async (file) => {
    const email = prompt("Enter email to share with:");
    if (!email) return;
    await shareFileWithEmail(file.id, email, user.uid);
    await logActivity(user.uid, "share_file", { fileId: file.id, email });
    fetchFilesAndFolders();
    alert(`File shared with ${email}`);
  };

  // ✅ Change permissions
  const handlePermissions = async (file) => {
    const role = prompt("Enter role (viewer/editor):", "viewer");
    if (!role) return;
    const newPermissions = { ...file.permissions, [user.uid]: role };
    await updatePermissions(file.id, newPermissions, user.uid);
    await logActivity(user.uid, "update_permissions", { fileId: file.id, role });
    fetchFilesAndFolders();
  };

  // ✅ Apply search + filter + sort
  const visibleFiles = files
    .filter(
      (f) =>
        !f.deleted &&
        f.parentId === currentFolder &&
        (showTrash ? f.trashed : !f.trashed) &&
        f.name.toLowerCase().includes(search.toLowerCase()) &&
        (filterBy === "all" || f.type.includes(filterBy))
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return a.size - b.size;
      return b.createdAt?.seconds - a.createdAt?.seconds;
    });

  const visibleFolders = folders.filter(
    (f) =>
      !f.deleted &&
      f.parentId === currentFolder &&
      (showTrash ? f.trashed : !f.trashed)
  );

  return (
    <div className="p-6">
      {/* Upload + Folder Creation */}
      <div className="border-2 border-dashed p-6 rounded-lg text-center bg-gray-50">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-4" />
        <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-3">
          Upload
        </button>
        <button onClick={handleCreateFolder} className="bg-green-600 text-white px-4 py-2 rounded-lg">
          + New Folder
        </button>
        {progress > 0 && (
          <div className="mt-3">
            <progress value={progress} max="100" className="w-full"></progress>
          </div>
        )}
      </div>

      {/* 🔹 Pass sharing & permissions handlers into FileList */}
      <FileList
        files={visibleFiles}
        folders={visibleFolders}
        setCurrentFolder={setCurrentFolder}
        breadcrumbs={breadcrumbs}
        setBreadcrumbs={setBreadcrumbs}
        moveItem={moveItem}
        renameItem={renameItem}
        deleteItem={deleteItem}
        onShare={handleShare}
        onPermissions={handlePermissions}
        showTrash={showTrash}
      />
    </div>
  );
};

export default FileUpload;
