import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Command, Menu } from 'lucide-react';

const Topbar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-gray-100 bg-white z-70 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Brand Logo */}
      <div className="flex items-center shrink-0">
        <Link to="/app/dashboard" className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="WorkNest Logo" 
            className="h-8 w-auto transition-transform hover:scale-105"
          />
        </Link>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl w-full transition-all focus-within:ring-4 focus-within:ring-teal-500/5 focus-within:border-teal-500/30 group">
          <Search size={16} className="text-gray-400 group-focus-within:text-teal-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search operations, personnel, or files..." 
            className="bg-transparent border-none outline-none text-[13px] font-medium text-[#042f2e] w-full placeholder:text-gray-400"
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-gray-200 rounded-md text-[9px] text-gray-400 font-bold shadow-sm">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Section: Profile + Mobile Toggle */}
      <div className="flex items-center gap-2">
        <Link to="/app/settings" className="flex items-center gap-3 pl-2 pr-3 py-1.5 hover:bg-gray-50 rounded-2xl transition-all group">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-black text-[#042f2e] leading-none mb-0.5 truncate max-w-[100px]">{user?.name || 'Admin'}</div>
            <div className="text-[9px] font-bold text-teal-600 uppercase tracking-widest leading-none">
              {user?.role === 'admin' ? 'Admin' : (user?.role || 'Personnel')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-md ring-1 ring-gray-100 group-hover:ring-teal-500/30 transition-all bg-[#042f2e]/5">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${(user?.name || 'Admin').replace(' ', '+')}&background=042f2e&color=fff&bold=true`} 
              alt={user?.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
