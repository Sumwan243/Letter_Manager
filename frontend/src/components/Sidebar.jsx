// components/Sidebar.jsx
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Users, FileText, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ role }) {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const commonLinks = [
    { to: "/", label: "Home", icon: <Home size={18} /> },
    { to: "/letters", label: "Letters", icon: <FileText size={18} /> },
  ];

  const adminLinks = [
    { to: "/admin", label: "Admin Dashboard", icon: <Users size={18} /> },
    { to: "/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  const staffLinks = [
    { to: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { to: "/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  const links =
    role === "admin" ? [...commonLinks, ...adminLinks] : [...commonLinks, ...staffLinks];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200`}> 
      <div className="p-4 flex items-center justify-between">
        <div className={`text-xl font-bold text-blue-600 dark:text-blue-400 ${collapsed ? 'sr-only' : ''}`}>Letter Manager</div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role || 'staff'}
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1 py-4">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
            title={collapsed ? link.label : undefined}
          >
            {link.icon}
            {!collapsed && link.label}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={handleLogout}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 transition-colors duration-200`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
}
