import { useState, useRef, useEffect } from "react";
import { Search, Settings, Grid } from "lucide-react";

export default function Navbar({ onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center justify-between bg-white border-b px-6 py-2 relative">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img
          src="/drive-logo.png"
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
      <div className="flex items-center gap-4 relative">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Grid size={20} className="text-gray-600" />
        </button>

        {/* Settings with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Settings size={20} className="text-gray-600" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  alert("Drivebox Settings clicked!");
                  setDropdownOpen(false);
                }}
              >
                Drivebox Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  if (onLogout) onLogout();
                  setDropdownOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
