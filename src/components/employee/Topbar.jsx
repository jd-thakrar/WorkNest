import { Link } from "react-router-dom";
import { Search, Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Topbar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl z-70 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Brand Logo */}
      <div className="flex items-center shrink-0">
        <Link
          to="/employee/dashboard"
          className="flex items-center gap-3 group"
        >
          <img
            src="/logo.png"
            alt="WorkNest Logo"
            className="h-9 w-auto transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Center Search - Minimalist */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl w-full transition-all focus-within:ring-4 focus-within:ring-teal-500/5 focus-within:border-teal-500/30 group">
          <Search
            size={16}
            className="text-slate-400 group-focus-within:text-teal-600 transition-colors"
          />
          <input
            type="text"
            placeholder="Search tasks, docs..."
            className="bg-transparent border-none outline-none text-[13px] font-medium text-slate-900 w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Section: Profile + Actions */}
      <div className="flex items-center gap-2">
        <Link to="/employee/settings" className="flex items-center gap-3 pl-2 pr-3 py-1.5 hover:bg-slate-50 rounded-2xl transition-all group">
          <div className="text-right hidden sm:block">
            <div className="text-[12px] font-black text-[#042f2e] leading-none mb-1">
              {user?.name || 'Personnel'}
            </div>
            <div className="text-[9px] font-bold text-teal-600 uppercase tracking-widest leading-none">
              {user?.company || 'Organization'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-100 group-hover:ring-teal-500/30 transition-all bg-slate-50">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${(user?.name || 'User').replace(' ', '+')}&background=042f2e&color=fff&bold=true`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        <Link
          to="/login"
          className="hidden sm:flex p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
        >
          <LogOut size={18} />
        </Link>

        {/* Mobile Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all ml-1"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
