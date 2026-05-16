import React from 'react';
import { Users, FileText, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';

const Tile = ({ title, subtitle, icon: Icon, to }) => (
  <Link to={to} className="glass-panel p-6 border-white/10 hover:bg-white/5 transition-colors block">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">{title}</h3>
      <div className="p-2 border border-white/10 bg-white/5 clip-chamfer">
        <Icon className="w-4 h-4 text-white/70" />
      </div>
    </div>
    <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-mono">{subtitle}</p>
  </Link>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Admin Control Center
        </h1>
        <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mt-1">Manage students, invigilators, and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Tile title="Students" subtitle="View, search, edit, delete, activate/deactivate" icon={Users} to="/app/admin/students" />
        <Tile
          title="Invigilators"
          subtitle="Names, session counts, activate/deactivate their sessions"
          icon={UserCog}
          to="/app/admin/invigilators"
        />
        <Tile title="Reports" subtitle="Post-session analytics and summaries" icon={FileText} to="/app/reports" />
      </div>
    </div>
  );
};

export default AdminDashboard;

