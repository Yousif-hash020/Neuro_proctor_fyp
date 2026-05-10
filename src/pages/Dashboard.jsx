import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Users, AlertTriangle, ShieldCheck, Activity, CalendarClock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { SessionContext } from '../context/SessionContext';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', { autoConnect: false });

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
  const [alerts, setAlerts] = useState([]);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) return;

    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/alerts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlerts(data.data || []);
      } catch (err) {
        console.error('Failed to fetch alerts:', err.message);
      }
    };

    fetchAlerts();
    socket.connect();
    socket.on('new_alert', (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 50));
    });
    socket.on('alert_updated', (updatedAlert) => {
      setAlerts((prev) => prev.map((a) => (a._id === updatedAlert._id ? updatedAlert : a)));
    });

    return () => {
      socket.off('new_alert');
      socket.off('alert_updated');
      socket.disconnect();
    };
  }, [user]);

  const activeCount = sessions.filter(s => s.status === 'active').length;
  const totalCount = sessions.length;
  const scheduledCount = sessions.filter(s => s.status === 'scheduled').length;
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const activeSessionAlerts = useMemo(() => {
    if (!activeSession?._id) return [];
    return alerts.filter((a) => String(a.sessionId) === String(activeSession._id));
  }, [alerts, activeSession?._id]);
  const activeAlertsCount = activeSessionAlerts.filter((a) => a.status === 'active').length;

  const chartData = useMemo(() => {
    const recent = alerts.slice(0, 8).reverse();
    return recent.map((alert, index) => ({
      time: new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      alerts: index + 1,
    }));
  }, [alerts]);

  const recentAlerts = activeSessionAlerts.slice(0, 6);

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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Active Sessions" value={activeCount} icon={Activity} color="blue" trend={0} />
        <StatCard title="Total Sessions Created" value={totalCount} icon={Users} color="indigo" trend={0} />
        <StatCard title="Scheduled Sessions" value={scheduledCount} icon={CalendarClock} color="yellow" trend={0} />
        <StatCard title="Active Session Alerts" value={activeAlertsCount} icon={AlertTriangle} color="red" trend={activeAlertsCount > 0 ? 8 : 0} />
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

          <h3 className="mb-4 text-xs font-bold text-white/50 tracking-[0.2em] uppercase">Session Activity / Time</h3>
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="border border-white/10 bg-white/5 p-3 clip-chamfer">
              <p className="text-[9px] text-white/40 uppercase tracking-widest">Scheduled</p>
              <p className="text-lg text-white font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>{scheduledCount}</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-3 clip-chamfer">
              <p className="text-[9px] text-white/40 uppercase tracking-widest">Active</p>
              <p className="text-lg text-white font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>{activeCount}</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-3 clip-chamfer">
              <p className="text-[9px] text-white/40 uppercase tracking-widest">Completed</p>
              <p className="text-lg text-white font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>{completedCount}</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
          <h3 className="mb-6 text-xs font-bold text-white/50 tracking-[0.2em] uppercase">Active Session Alerts</h3>
          <div className="space-y-3">
            {!activeSession && (
              <div className="p-4 border border-white/10 bg-white/5 clip-chamfer text-[10px] text-white/40 uppercase tracking-widest font-mono">
                No active session running
              </div>
            )}
            {recentAlerts.length === 0 && (
              <div className="p-4 border border-white/10 bg-white/5 clip-chamfer text-[10px] text-white/40 uppercase tracking-widest font-mono">
                {activeSession ? 'No alerts in active session' : 'No alerts yet'}
              </div>
            )}
            {recentAlerts.map((alert) => (
              <div key={alert._id} className="flex items-start p-4 transition-colors border border-white/10 bg-white/5 hover:bg-white/10 clip-chamfer relative group">
                <div className="absolute left-0 top-0 h-full w-1 bg-white/20 group-hover:bg-white transition-colors"></div>
                <div className="p-2 mr-4 bg-white/10 clip-chamfer shrink-0">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {alert.type}
                  </h4>
                  <div className="flex gap-2 mt-1 items-center flex-wrap">
                    <p className="text-[9px] text-white/50 font-mono tracking-widest uppercase">{alert.cameraName || `Cam ${alert.cameraId}`}</p>
                    <span className="text-[9px] text-white/30">•</span>
                    <p className="text-[9px] text-white/50 font-mono tracking-widest uppercase">
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className="text-[9px] text-white/30">•</span>
                    <span className="text-[8px] px-2 py-0.5 border border-white/20 bg-black/40 text-white/80 uppercase tracking-widest font-mono clip-chamfer">
                      {alert.severity || 'N/A'}
                    </span>
                    <span className="text-[8px] px-2 py-0.5 border border-white/20 bg-black/40 text-white/80 uppercase tracking-widest font-mono clip-chamfer">
                      {alert.status || 'active'}
                    </span>
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
