import React, { useContext } from 'react';
import { Menu, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Topbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useContext(AuthContext);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 glass-panel border-x-0 border-t-0 rounded-none bg-black/80">
      <div className="flex items-center gap-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white clip-chamfer"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,1)] rounded-full animate-pulse"></span>
          <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-white">SYSTEM ONLINE</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center pl-6 border-l border-white/10 gap-4">
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-bold text-white tracking-widest uppercase">{user?.name || 'Operator'}</p>
            <p className="text-[8px] text-white/50 tracking-[0.2em] uppercase font-mono mt-0.5">{user?.role || 'User'}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 border border-white/20 clip-chamfer bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
