import React, { useContext } from 'react';
import { Users, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { SessionContext } from '../context/SessionContext';

const data = [
  { time: '09:00', alerts: 2 },
  { time: '09:30', alerts: 5 },
  { time: '10:00', alerts: 1 },
  { time: '10:30', alerts: 8 },
  { time: '11:00', alerts: 3 },
  { time: '11:30', alerts: 12 },
  { time: '12:00', alerts: 4 },
];

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="p-6 glass-panel relative group overflow-hidden">
    <div className="absolute inset-0 bg-white/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold text-white/50 tracking-widest uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
        <div className={`p-2 border border-${color}-500/30 bg-${color}-500/10 clip-chamfer`}>
          <Icon className={`w-4 h-4 text-${color}-400`} />
        </div>
      </div>
      <div className="flex items-baseline">
        <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>{value}</h2>
        <span className={`ml-3 text-[10px] font-bold tracking-widest text-${trend > 0 ? 'red' : 'green'}-400`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { sessions, activeSession } = useContext(SessionContext);
  const isAdmin = user?.role === 'admin';

  const activeCount = sessions.filter(s => s.status === 'active').length;
  const totalCount = sessions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-white tracking-widest uppercase flex items-center gap-2 md:gap-4" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
            {isAdmin ? 'System Overview' : 'Session Overview'}
          </h1>
          <p className="text-[8px] md:text-[10px] text-white/50 tracking-[0.3em] uppercase mt-1 font-mono">
            {isAdmin ? 'Global Neural Analysis Interface' : 'Local Monitoring Interface'}
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 clip-chamfer">
          <span className="flex items-center text-[10px] uppercase tracking-widest font-bold text-white">
            <span className="w-1.5 h-1.5 mr-3 bg-white shadow-[0_0_8px_rgba(255,255,255,1)] rounded-full animate-pulse"></span>
            System Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Sessions" value={activeCount} icon={Activity} color="blue" trend={0} />
        {isAdmin && <StatCard title="Total Sessions" value={totalCount} icon={Users} color="indigo" trend={0} />}
        <StatCard title="Active Alerts" value={activeSession ? '1' : '0'} icon={AlertTriangle} color="red" trend={activeSession ? 12 : 0} />
        {isAdmin && <StatCard title="System Health" value="99.9" icon={ShieldCheck} color="green" trend={-1} />}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 p-6 glass-panel min-h-[400px] flex flex-col relative border-white/10">
          <div className="absolute top-0 right-0 p-4">
            <div className="flex gap-1 h-[20px] relative" style={{ transform: 'skewX(-25deg)' }}>
              <div className="w-[4px] bg-white/20"></div>
              <div className="w-[4px] bg-white/20"></div>
              <div className="w-[4px] bg-white/20"></div>
            </div>
          </div>

          <h3 className="mb-8 text-xs font-bold text-white/50 tracking-[0.2em] uppercase">Detection Activity / Time</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#ffffff20', borderRadius: '0', fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="alerts" stroke="#ffffff" fillOpacity={1} fill="url(#colorAlerts)" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="p-6 glass-panel border-white/10 relative">
          <h3 className="mb-6 text-xs font-bold text-white/50 tracking-[0.2em] uppercase">Recent Alerts Log</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start p-4 transition-colors border border-white/10 bg-white/5 hover:bg-white/10 clip-chamfer relative group">
                <div className="absolute left-0 top-0 h-full w-1 bg-white/20 group-hover:bg-white transition-colors"></div>
                <div className="p-2 mr-4 bg-white/10 clip-chamfer shrink-0">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Multiple Persons Detected</h4>
                  <div className="flex gap-2 mt-1">
                    <p className="text-[9px] text-white/50 font-mono tracking-widest uppercase">Cam {i} - Hall A</p>
                    <span className="text-[9px] text-white/30">•</span>
                    <p className="text-[9px] text-white/50 font-mono tracking-widest uppercase">2m ago</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
