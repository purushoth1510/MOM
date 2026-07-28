import {
  FaTachometerAlt,
  FaTasks,
  FaCog,
  FaUsers,
  FaExternalLinkAlt,
  FaUserShield
} from "react-icons/fa";

import { Link, useLocation } from "react-router-dom";

function Sidebar() {

  const location = useLocation();
  const role = localStorage.getItem("role") || "employee";

  const navItem = (path) =>
    location.pathname === path
      ? "bg-green-100 text-black p-3 rounded-xl flex items-center gap-3"
      : "p-3 flex items-center gap-3";

  return (
    <div className="w-64 bg-white min-h-screen border-r">

      <div className="p-6 text-3xl font-bold text-green-600">
        MoM
      </div>

      <div className="p-4 space-y-3">

        <Link to="/dashboard" className={navItem("/dashboard")}>
          <FaTachometerAlt />
          Dashboard
        </Link>

        <Link to="/meetings" className={navItem("/meetings")}>
          <FaUsers />
          Meetings
        </Link>

        <Link to="/tasks" className={navItem("/tasks")}>
          <FaTasks />
          Tasks
        </Link>

        {(role === "admin" || role === "super_admin") && (
          <Link to="/users" className={navItem("/users")}>
            <FaUserShield />
            Users
          </Link>
        )}

         <Link to="/extension" className={navItem("/extension")}>
          <FaExternalLinkAlt />
          Extension
        </Link>

        <Link to="/settings" className={navItem("/settings")}>
          <FaCog />
          Settings
        </Link>

      </div>

    </div>
  );
}

export default Sidebar;