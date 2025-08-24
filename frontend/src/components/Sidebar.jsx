// src/components/Sidebar.jsx
import React from "react";
import { Home, Star, Clock, Trash, Laptop, Users, Folder } from "lucide-react";

const Sidebar = ({ active, setActive, setUploadOpen }) => {
  const menu = [
    { name: "Home", icon: <Home size={18} />, value: "home" },
    { name: "My Drive", icon: <Folder size={18} />, value: "myDrive" },
    { name: "Shared with Me", icon: <Users size={18} />, value: "shared" },
    { name: "Recent", icon: <Clock size={18} />, value: "recent" },
    { name: "Starred", icon: <Star size={18} />, value: "starred" },
    { name: "Trash", icon: <Trash size={18} />, value: "trash" },
    { name: "Computers", icon: <Laptop size={18} />, value: "computers" },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-md h-screen p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">DriveBox</h1>

      {/* + New Button */}
      <button
        onClick={() => setUploadOpen(true)}
        className="flex items-center gap-2 px-4 py-2 mb-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
      >
        + New
      </button>

      {/* Menu */}
      <ul className="space-y-2">
        {menu.map((item) => (
          <li
            key={item.value}
            onClick={() => setActive(item.value)}
            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition ${
              active === item.value
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
