import React, { useState } from "react";
import { X, Trash2, Share2, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../firebase"; // firebase storage

const FilePreview = ({ file, onClose }) => {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(file?.name || "");

  if (!file) return null;

  // Preview Type (image, pdf, text)
  const renderPreview = () => {
    if (file.type.startsWith("image/")) {
      return <img src={file.url} alt={file.name} className="max-h-[70vh] mx-auto rounded-lg" />;
    }
    if (file.type === "application/pdf") {
      return (
        <iframe
          src={file.url}
          title={file.name}
          className="w-full h-[70vh] rounded-lg"
        />
      );
    }
    if (file.type.startsWith("text/")) {
      return (
        <iframe
          src={file.url}
          title={file.name}
          className="w-full h-[70vh] rounded-lg bg-gray-100 p-4"
        />
      );
    }
    return <p className="text-gray-600 text-center mt-10">Preview not available</p>;
  };

  const handleDelete = async () => {
    try {
      const fileRef = ref(storage, `uploads/${file.name}`);
      await deleteObject(fileRef);
      toast.success("File deleted!");
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete file.");
    }
  };

  const handleRename = () => {
    if (!newName.trim()) {
      toast.error("File name cannot be empty");
      return;
    }
    // Firebase Storage doesn’t support renaming directly → need to copy + delete
    toast.info("Renaming not directly supported in Firebase Storage.");
    setRenaming(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-5xl overflow-hidden">
        
        {/* Top Bar (Actions) */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          {renaming ? (
            <div className="flex items-center gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
                autoFocus
              />
              <button
                onClick={handleRename}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setRenaming(false)}
                className="px-3 py-1 bg-gray-200 text-sm rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h3 className="font-medium text-gray-800 truncate max-w-xs">{file.name}</h3>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRenaming(true)}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <Pencil className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(file.url)}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <Share2 className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* File Preview */}
        <div className="p-4">{renderPreview()}</div>
      </div>
    </div>
  );
};

export default FilePreview;
