// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FaFolder, FaFile, FaStar, FaTrash, FaEdit, FaUndo } from "react-icons/fa";
// import { getAuth } from "firebase/auth";

// // ✅ Axios instance
// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// // ✅ Attach Firebase ID token to all requests
// API.interceptors.request.use(async (config) => {
//   const auth = getAuth();
//   const user = auth.currentUser;
//   if (user) {
//     const token = await user.getIdToken();
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default function FileExplorer() {
//   const [files, setFiles] = useState([]);
//   const [currentFolder, setCurrentFolder] = useState(null);
//   const [showTrash, setShowTrash] = useState(false);
//   const [renameId, setRenameId] = useState(null);
//   const [renameValue, setRenameValue] = useState("");
//   const [moveId, setMoveId] = useState(null);
//   const [moveTarget, setMoveTarget] = useState("");

//   const fetchFiles = async () => {
//     try {
//       const res = await API.get(
//         `/files?trash=${showTrash}&folder=${currentFolder || ""}`
//       );
//       setFiles(res.data || []);
//     } catch (err) {
//       console.error("Error fetching files:", err);
//     }
//   };

//   useEffect(() => {
//     fetchFiles();
//   }, [currentFolder, showTrash]);

//   const handleRename = async (id) => {
//     if (!renameValue.trim()) return;
//     try {
//       await API.put(`/files/${id}/rename`, { name: renameValue });
//       setRenameId(null);
//       setRenameValue("");
//       fetchFiles();
//     } catch (err) {
//       console.error("Error renaming:", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Move to Trash?")) return;
//     try {
//       await API.delete(`/files/${id}`);
//       fetchFiles();
//     } catch (err) {
//       console.error("Error deleting:", err);
//     }
//   };

//   const handleStar = async (id) => {
//     try {
//       await API.put(`/files/${id}/star`);
//       fetchFiles();
//     } catch (err) {
//       console.error("Error starring file:", err);
//     }
//   };

//   const handleMove = async (id) => {
//     if (!moveTarget) return;
//     try {
//       await API.put(`/files/${id}/move`, { targetFolder: moveTarget });
//       setMoveId(null);
//       setMoveTarget("");
//       fetchFiles();
//     } catch (err) {
//       console.error("Error moving:", err);
//     }
//   };

//   const handleRestore = async (id) => {
//     try {
//       await API.put(`/files/${id}/restore`);
//       fetchFiles();
//     } catch (err) {
//       console.error("Error restoring:", err);
//     }
//   };

//   const handlePermanentDelete = async (id) => {
//     if (!window.confirm("Permanently delete? This cannot be undone.")) return;
//     try {
//       await API.delete(`/files/${id}/permanent`);
//       fetchFiles();
//     } catch (err) {
//       console.error("Error permanent deleting:", err);
//     }
//   };

//   return (
//     <div className="p-4">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-bold">
//           {showTrash ? "🗑️ Trash Bin" : currentFolder ? "📂 Folder" : "💾 My Drive"}
//         </h2>
//         <button
//           className="px-4 py-2 bg-gray-700 text-white rounded"
//           onClick={() => setShowTrash(!showTrash)}
//         >
//           {showTrash ? "⬅️ Back to Drive" : "🗑️ View Trash"}
//         </button>
//       </div>

//       {/* File List */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {files.length === 0 && <p className="text-gray-500">No files or folders here.</p>}

//         {files.map((file) => (
//           <div key={file._id} className="border rounded p-3 flex flex-col shadow bg-white">
//             <div className="flex items-center gap-2">
//               {file.type === "folder" ? (
//                 <FaFolder className="text-yellow-500 text-xl" />
//               ) : (
//                 <FaFile className="text-blue-500 text-xl" />
//               )}

//               {renameId === file._id ? (
//                 <input
//                   type="text"
//                   value={renameValue}
//                   onChange={(e) => setRenameValue(e.target.value)}
//                   onBlur={() => handleRename(file._id)}
//                   className="border p-1"
//                   autoFocus
//                 />
//               ) : (
//                 <span
//                   className="cursor-pointer font-medium"
//                   onDoubleClick={() =>
//                     file.type === "folder" && setCurrentFolder(file._id)
//                   }
//                 >
//                   {file.name}
//                 </span>
//               )}
//             </div>

//             <div className="flex gap-2 mt-2 flex-wrap">
//               {!showTrash ? (
//                 <>
//                   <button
//                     className="text-gray-600 hover:text-yellow-500"
//                     onClick={() => handleStar(file._id)}
//                   >
//                     <FaStar className={file.starred ? "text-yellow-400" : ""} />
//                   </button>
//                   <button
//                     className="text-gray-600 hover:text-blue-500"
//                     onClick={() => {
//                       setRenameId(file._id);
//                       setRenameValue(file.name);
//                     }}
//                   >
//                     <FaEdit />
//                   </button>
//                   <button
//                     className="text-gray-600 hover:text-red-500"
//                     onClick={() => handleDelete(file._id)}
//                   >
//                     <FaTrash />
//                   </button>
//                   <button
//                     className="text-gray-600 hover:text-green-500"
//                     onClick={() => setMoveId(file._id)}
//                   >
//                     Move
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <button
//                     className="text-gray-600 hover:text-green-500"
//                     onClick={() => handleRestore(file._id)}
//                   >
//                     <FaUndo /> Restore
//                   </button>
//                   <button
//                     className="text-gray-600 hover:text-red-700"
//                     onClick={() => handlePermanentDelete(file._id)}
//                   >
//                     <FaTrash /> Delete
//                   </button>
//                 </>
//               )}
//             </div>

//             {moveId === file._id && (
//               <div className="mt-2">
//                 <select
//                   value={moveTarget}
//                   onChange={(e) => setMoveTarget(e.target.value)}
//                   className="border p-1 w-full"
//                 >
//                   <option value="">Select folder</option>
//                   {files
//                     .filter((f) => f.type === "folder" && f._id !== file._id)
//                     .map((f) => (
//                       <option key={f._id} value={f._id}>
//                         {f.name}
//                       </option>
//                     ))}
//                 </select>
//                 <button
//                   className="px-2 py-1 bg-blue-500 text-white rounded mt-1"
//                   onClick={() => handleMove(file._id)}
//                 >
//                   Confirm Move
//                 </button>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
