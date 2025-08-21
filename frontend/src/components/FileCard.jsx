import { Folder, File } from "lucide-react";

export default function FileCard({ file, onOpen }) {
  return (
    <div
      className="p-4 border rounded-xl hover:shadow-md cursor-pointer flex flex-col items-center justify-center"
      onClick={() => onOpen(file)}
    >
      {file.type === "folder" ? (
        <Folder size={40} className="text-yellow-500" />
      ) : (
        <File size={40} className="text-blue-500" />
      )}
      <p className="mt-2 text-sm truncate w-full text-center">{file.name}</p>
    </div>
  );
}
