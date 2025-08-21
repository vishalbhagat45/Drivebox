import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase"; // import firebase storage

const FileUpload = ({ onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = (selectedFiles) => {
    const fileList = Array.from(selectedFiles);
    setFiles(fileList);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select a file to upload");
      return;
    }
    setUploading(true);

    try {
      for (let file of files) {
        const fileRef = ref(storage, `uploads/${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        console.log("Uploaded file URL:", downloadURL);
      }

      toast.success("Files uploaded successfully!");
      setFiles([]);
      onClose(); // Close modal after success
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[500px] p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 transition"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>

        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition 
            ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          `}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-10 w-10 text-gray-500 mb-2" />
          <p className="text-gray-600">Drag & drop your files here</p>
          <p className="text-gray-500 text-sm">or</p>
          <label className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
            Browse
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg text-sm"
              >
                <span>{file.name}</span>
                <span className="text-gray-500 text-xs">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
