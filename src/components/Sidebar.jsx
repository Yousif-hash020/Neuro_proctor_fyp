import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MonitorPlay, ShieldAlert, Video, FileText, Settings, LogOut, Brain } from 'lucide-react';
import clsx from 'clsx';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNavItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, roles: ['admin', 'invigilator'] },
    { name: 'Live Monitoring', path: '/app/monitoring', icon: MonitorPlay, roles: ['admin', 'invigilator'] },
    { name: 'Alerts Center', path: '/app/alerts', icon: ShieldAlert, roles: ['admin', 'invigilator'] },
    { name: 'Sessions', path: '/app/sessions', icon: Video, roles: ['admin', 'invigilator'] },
    { name: 'Reports', path: '/app/reports', icon: FileText, roles: ['admin'] },
    { name: 'Settings', path: '/app/settings', icon: Settings, roles: ['admin'] },
  ];

  const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside
      className={clsx(
        'glass-panel border-y-0 border-l-0 rounded-none h-screen flex flex-col transition-all duration-300 z-50 bg-black absolute md:relative',
        isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0 md:w-20'
      )}
    >
      <div className="flex items-center justify-center h-20 border-b border-white/10 relative">
        <Brain className="w-6 h-6 text-white animate-pulse-slow relative z-10" />
        {isOpen && (
          <span 
            className="ml-3 text-xs uppercase tracking-[0.3em] font-bold text-white relative z-10 mt-1" 
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            NEURO<span className="text-white/50">PROCTOR</span>
          </span>
        )}
        <div className="absolute bottom-0 w-full flex items-center justify-center pointer-events-none">
          <div className="w-[10px] h-[10px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-50 relative bottom-[-5px] transform rotate-45"></div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto">
        <div className="text-[7px] uppercase tracking-[0.5em] text-white/30 mb-4 pl-2 font-mono">
          System // Modules
        </div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-4 py-3 transition-all duration-200 group relative clip-chamfer',
                isActive
                  ? 'bg-white/10 text-white border-l-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              )
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {isOpen && (
              <span className="ml-4 text-[10px] uppercase tracking-widest font-medium mt-[1px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {item.name}
              </span>
            )}
            
            {/* Hover Decorator */}
            <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-white/50 transition-colors hover:bg-red-500/10 hover:text-red-400 clip-chamfer group">
          <LogOut className="w-4 h-4 flex-shrink-0 group-hover:text-red-400" />
          {isOpen && <span className="ml-4 text-[10px] uppercase tracking-widest font-medium mt-[1px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
