import { FaBell, FaCircle, FaCloudUploadAlt } from "react-icons/fa";
import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, clearUserNotifications } from "../services/api";

function Topbar() {
  const { user, searchQuery, setSearchQuery } = useContext(UserContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const username = localStorage.getItem("username") || user.name || "Guest";
  const role = localStorage.getItem("role") || "employee";
  const displayRole = role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const initials = username
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/notifications`);
        const data = await res.json();
        setNotifications(data.data || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); 
    return () => clearInterval(interval);
  }, [API_URL]);

  const markAsRead = async (id) => {
    try {
      await fetchWithAuth(`${API_URL}/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (let n of unread) {
       await markAsRead(n._id);
    }
  };

  const clearNotifications = async () => {
     try {
       await clearUserNotifications();
       setNotifications([]);
     } catch (error) {
       console.error("Failed to clear notifications:", error);
     }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center p-5 bg-[#edf4f1] relative">

      <input
        type="text"
        placeholder="Search meetings, tasks..."
        className="w-[500px] p-3 rounded-full border outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="flex items-center gap-5">
        
          <div className="relative cursor-pointer" ref={dropdownRef}>
            <FaBell size={24} onClick={() => setShowDropdown(!showDropdown)} className={`${unreadCount > 0 ? "text-red-500 animate-zoom-in-out" : "text-black"} transition-colors`} />
            {unreadCount > 0 && (
              <span onClick={() => setShowDropdown(!showDropdown)} className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm border border-white">
                {unreadCount}
              </span>
            )}
            
            {showDropdown && (
              <div className="absolute top-10 right-0 w-96 bg-white shadow-xl rounded-xl p-0 z-50 border border-gray-100 overflow-hidden animate-slide-down">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className="text-green-600 hover:text-green-800 transition">Mark read</button>
                    <button onClick={(e) => { e.stopPropagation(); clearNotifications(); }} className="text-gray-500 hover:text-gray-700 transition">Clear</button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto p-2">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No notifications</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {notifications.map((n) => (
                        <div 
                          key={n._id} 
                          className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-colors ${n.is_read ? 'hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                          onClick={() => !n.is_read && markAsRead(n._id)}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${n.is_read ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'}`}>
                            <FaCloudUploadAlt size={18} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm truncate pr-2 ${n.is_read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>{n.title}</span>
                              {!n.is_read && <FaCircle className="text-green-500 text-[8px] flex-shrink-0" />}
                            </div>
                            <p className="text-gray-500 text-xs leading-relaxed mb-2 line-clamp-2">{n.message}</p>
                            <p className="text-gray-400 text-[10px]">Just now</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-semibold text-gray-800">{username}</div>
            <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium inline-block">
              {displayRole}
            </div>
          </div>
          <div
            onClick={() => navigate("/settings")}
            className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold cursor-pointer hover:scale-105 transition"
          >
            {initials}
          </div>
        </div>

      </div>

    </div>
  );
}

export default Topbar;