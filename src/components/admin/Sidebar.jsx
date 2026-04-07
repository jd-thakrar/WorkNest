import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Network,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/app/dashboard" },
    { icon: Users, label: "Employees", path: "/app/employees" },
    { icon: Network, label: "Teams", path: "/app/teams" },
    { icon: CheckSquare, label: "Tasks", path: "/app/tasks" },
    { icon: Calendar, label: "Attendance", path: "/app/attendance" },
    { icon: CreditCard, label: "Payroll", path: "/app/payroll" },
    { icon: BarChart3, label: "Reports", path: "/app/reports" },
  ];

  const bottomItems = [
    { icon: Bell, label: "Notifications", path: "/app/notifications" },
    { icon: Settings, label: "Settings", path: "/app/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  // Function to handle link click - close sidebar on mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setCollapsed(true);
    }
  };

  return (
    <aside
      className={`fixed lg:sticky left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-68 flex flex-col ${
        collapsed
          ? "w-20 lg:w-20 -translate-x-full lg:translate-x-0"
          : "w-56 translate-x-0 shadow-2xl lg:shadow-none"
      }`}
    >
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1 custom-scrollbar">
        {!collapsed && (
          <div className="px-3 mb-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            General Navigation
          </div>
        )}
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
              isActive(item.path)
                ? "bg-teal-50 text-[#0d9488]"
                : "text-gray-500 hover:bg-gray-50 hover:text-[#042f2e]"
            }`}
          >
            <item.icon
              size={20}
              className={
                isActive(item.path)
                  ? "text-[#0d9488]"
                  : "text-gray-400 group-hover:text-[#042f2e] transition-colors"
              }
            />
            {!collapsed && (
              <span className="text-sm font-semibold">{item.label}</span>
            )}
            {collapsed && (
              <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-[#042f2e] text-white text-[10px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-50 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
              isActive(item.path)
                ? "bg-teal-50 text-[#0d9488]"
                : "text-gray-500 hover:bg-gray-50 hover:text-[#042f2e]"
            }`}
          >
            <item.icon
              size={20}
              className={
                isActive(item.path)
                  ? "text-[#0d9488]"
                  : "text-gray-400 group-hover:text-[#042f2e] transition-colors"
              }
            />
            {!collapsed && (
              <span className="text-sm font-semibold">{item.label}</span>
            )}
          </Link>
        ))}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-[#042f2e] transition-all duration-200 cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight size={20} className="text-gray-400" />
          ) : (
            <ChevronLeft size={20} className="text-gray-400" />
          )}
          {!collapsed && (
            <span className="text-sm font-semibold text-left">Minimize</span>
          )}
        </button>

        <div className="mt-4 pt-4 border-t border-gray-50 px-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#042f2e]/5 shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${(user?.name || 'Admin').replace(' ', '+')}&background=042f2e&color=fff&bold=true`}
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[10px] font-black text-[#042f2e] truncate">
                {user?.name || 'Admin'}
              </div>
              <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest truncate">
                {user?.role === 'admin' ? 'Admin' : (user?.role || 'Personnel')}
              </div>
            </div>
          )}
          {!collapsed && (
            <Link
              to="/login"
              className="ml-auto p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
