import { Search, Settings, Grid } from "lucide-react";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between bg-white border-b px-6 py-2">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img
          src="/drive-logo.png" // Replace with your logo or Google colors triangle
          alt="Drive"
          className="w-8 h-8"
        />
        <span className="text-lg font-medium text-gray-700">Drivebox</span>
      </div>

      {/* Search bar (center) */}
      <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full w-[40%] shadow-sm">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search in Drive"
          className="bg-transparent ml-2 outline-none text-sm w-full"
        />
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Grid size={20} className="text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Settings size={20} className="text-gray-600" />
        </button>
        <img
          src="/avatar.png" // Replace with user profile pic
          alt="Profile"
          className="w-8 h-8 rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
}
