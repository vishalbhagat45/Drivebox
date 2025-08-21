import {
  Home,
  Folder,
  Monitor,
  Users,
  Clock,
  Star,
  ShieldAlert,
  Trash2,
  Plus,
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r h-screen p-4 flex flex-col justify-between">
      {/* Top Section */}
      <div>
        {/* + New button */}
        <button className="flex items-center gap-2 px-4 py-2 mb-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow">
          <Plus size={18} /> New
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 text-sm text-gray-700">
          <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
            <Home size={18} /> Home
          </a>
          <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
            <Folder size={18} /> My Drive
          </a>
          <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
            <Monitor size={18} /> Computers
          </a>
          <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
            <Users size={18} /> Shared with me
          </a>
          <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
            <Clock size={18} /> Recent
          </a>
          <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
            <Star size={18} /> Starred
          </a>
          <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
            <ShieldAlert size={18} /> Spam
          </a>
          <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
            <Trash2 size={18} /> Bin
          </a>
        </nav>
      </div>

      {/* Bottom Storage Info */}
      <div className="px-2">
        <div className="h-2 bg-gray-200 rounded-full mb-2">
          <div
            className="h-2 bg-blue-600 rounded-full"
            style={{ width: "45%" }} // replace with actual usage %
          ></div>
        </div>
        <p className="text-xs text-gray-600 mb-2">7.03 GB of 15 GB used</p>
        <button className="text-sm text-blue-600 hover:underline">
          Get more storage
        </button>
      </div>
    </div>
  );
}
