import React, { useState } from "react";
import FileItem from "./FileItem"; // ✅ Import FileItem

const FileList = ({
  files,
  folders,
  setCurrentFolder,
  breadcrumbs,
  setBreadcrumbs,
  moveItem,
  renameItem,
  deleteItem,
  onShare,
  onPermissions,
  showTrash,
}) => {
  // ✅ Navigate into folder
  const openFolder = (folder) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  // ✅ Breadcrumb navigation
  const goToBreadcrumb = (crumb) => {
    setCurrentFolder(crumb.id);
    setBreadcrumbs(breadcrumbs.slice(0, breadcrumbs.indexOf(crumb) + 1));
  };

  return (
    <div className="mt-6">
      {/* Breadcrumb */}
      <div className="flex items-center mb-4 gap-2">
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.id} className="flex items-center gap-1">
            <button
              onClick={() => goToBreadcrumb(crumb)}
              className="text-blue-600 hover:underline"
            >
              {crumb.name}
            </button>
            {idx < breadcrumbs.length - 1 && <span>/</span>}
          </span>
        ))}
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Folders</h3>
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="flex justify-between border-b p-2 hover:bg-gray-50"
            >
              <button
                onClick={() => openFolder(folder)}
                className="text-blue-600 text-left truncate"
              >
                📁 {folder.name}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => renameItem("folders", folder.id, folder.name)}
                  className="text-yellow-600 hover:underline"
                >
                  Rename
                </button>
                <button
                  onClick={() => deleteItem("folders", folder.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Files */}
      <div className="border rounded-lg shadow-sm">
        <div className="grid grid-cols-6 bg-gray-100 p-2 font-semibold">
          <div>Name</div>
          <div>Size</div>
          <div>Uploaded</div>
          <div>Actions</div>
          <div>Share</div>
          <div>Permissions</div>
        </div>
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            renameItem={renameItem}
            deleteItem={deleteItem}
            onShare={onShare}
            onPermissions={onPermissions}
            showTrash={showTrash}
          />
        ))}
      </div>
    </div>
  );
};

export default FileList;
