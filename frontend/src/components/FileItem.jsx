import React, { useState } from "react";
import FilePreview from "./FilePreview";

const FileItem = ({ file, renameItem, deleteItem, onShare, onPermissions, showTrash }) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-6 items-center border-b p-2 hover:bg-gray-50">
        {/* File Name */}
        <button
          onClick={() => setPreviewOpen(true)}
          className="text-blue-600 text-left truncate"
        >
          {file.name}
        </button>

        {/* Size */}
        <div>{(file.size / 1024).toFixed(2)} KB</div>

        {/* Created At */}
        <div>{file.createdAt?.toDate().toLocaleString()}</div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => renameItem("files", file.id, file.name)}
            className="text-yellow-600 hover:underline"
          >
            Rename
          </button>
          <button
            onClick={() => deleteItem("files", file.id)}
            className="text-red-500 hover:underline"
          >
            {showTrash ? "Delete Permanently" : "Delete"}
          </button>
        </div>

        {/* Sharing */}
        <button
          onClick={() => onShare(file)}
          className="text-green-600 hover:underline"
        >
          Share
        </button>

        {/* Permissions */}
        <button
          onClick={() => onPermissions(file)}
          className="text-purple-600 hover:underline"
        >
          Permissions
        </button>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <FilePreview file={file} onClose={() => setPreviewOpen(false)} />
      )}
    </>
  );
};

export default FileItem;
