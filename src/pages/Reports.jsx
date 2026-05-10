import React, { useContext, useEffect, useState } from 'react';
import { FileText, BarChart3, Clock, ShieldAlert, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import { SessionContext } from '../context/SessionContext';

const SEV_COLOR = { Red: '#ef4444', Orange: '#f97316', Yellow: '#eab308' };

const ReportCard = ({ session, alerts }) => {
  const sessionAlerts = alerts.filter(a => String(a.sessionId) === String(session._id));
  const high   = sessionAlerts.filter(a => a.severity === 'Red').length;
  const medium = sessionAlerts.filter(a => a.severity === 'Orange').length;
  const low    = sessionAlerts.filter(a => a.severity === 'Yellow').length;

  const duration = (() => {
    if (!session.startTime || !session.endTime) return 'N/A';
    const ms = new Date(session.endTime) - new Date(session.startTime);
    const h  = Math.floor(ms / 3600000);
    const m  = Math.floor((ms % 3600000) / 60000);
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  })();

  const fmt = (d) => d ? new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const chartData = [
    { name: 'High',   count: high,   color: '#ef4444' },
    { name: 'Medium', count: medium, color: '#f97316' },
    { name: 'Low',    count: low,    color: '#eab308' },
  ];

  return (
    <div className="glass-panel p-6 border-white/5 space-y-5">
      {/* Title row */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {session.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-white/40 font-mono">
            <Clock className="w-3 h-3" /> {fmt(session.startTime)} → {fmt(session.endTime)} ({duration})
          </div>
        </div>
        <span className="px-2 py-1 text-[9px] border border-white/10 text-white/40 uppercase tracking-widest font-mono rounded-sm">
          Completed
        </span>
      </div>

      {/* Alert breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'High', count: high,   color: 'text-red-400',    border: 'border-red-500/20',    bg: 'bg-red-500/5' },
          { label: 'Med',  count: medium, color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5' },
          { label: 'Low',  count: low,    color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5' },
        ].map(({ label, count, color, border, bg }) => (
          <div key={label} className={`flex flex-col items-center justify-center p-3 rounded-lg border ${border} ${bg}`}>
            <span className={`text-2xl font-bold ${color}`} style={{ fontFamily: "'Orbitron', sans-serif" }}>{count}</span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest mt-1">{label}</span>
          </div>
        ))}
      </div>

      {/* Mini bar chart */}
      {sessionAlerts.length > 0 && (
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#ffffff40', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#000', borderColor: '#ffffff20', fontFamily: 'monospace', fontSize: 10 }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {sessionAlerts.length === 0 && (
        <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest text-center py-2">No alerts recorded for this session</p>
      )}

      <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest border-t border-white/5 pt-3 flex justify-between">
        <span>Total: {sessionAlerts.length} alerts</span>
        <span>Resolved: {sessionAlerts.filter(a => a.status === 'resolved').length}</span>
      </div>
    </div>
  );
};

const Reports = () => {
  const { sessions } = useContext(SessionContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/alerts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlerts(data.data);
      } catch (err) {
        console.error('Failed to load alerts', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const completedSessions = sessions.filter(s => s.status === 'completed');

  // Overall summary stats
  const totalAlerts = alerts.length;
  const totalHigh   = alerts.filter(a => a.severity === 'Red').length;
  const totalRes    = alerts.filter(a => a.status === 'resolved').length;

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <FileText className="w-6 h-6 text-white/70" /> Session Reports
          </h1>
          <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mt-1">Post-session analysis & threat summaries</p>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'Completed Sessions', value: completedSessions.length, icon: BarChart3,    color: 'text-white' },
          { label: 'Total Alerts',       value: totalAlerts,              icon: ShieldAlert,  color: 'text-red-400' },
          { label: 'High Severity',      value: totalHigh,                icon: TrendingUp,   color: 'text-red-400' },
          { label: 'Resolved',           value: totalRes,                 icon: FileText,     color: 'text-green-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-panel p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Icon className={clsx('w-4 h-4', color)} />
              <span className="text-[9px] text-white/40 uppercase tracking-widest">{label}</span>
            </div>
            <span className={clsx('text-3xl font-bold', color)} style={{ fontFamily: "'Orbitron', sans-serif" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Session report cards */}
      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {loading && <p className="text-white/30 font-mono text-xs uppercase tracking-widest animate-pulse">Loading report data...</p>}

        {!loading && completedSessions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 border border-white/10 border-dashed clip-chamfer text-white/20 font-mono text-[10px] uppercase tracking-widest gap-3">
            <FileText className="w-8 h-8 opacity-30" />
            No completed sessions yet
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {completedSessions.map(session => (
            <ReportCard key={session._id} session={session} alerts={alerts} />
          ))}
        </div>
      </div>
    </div>
  );
};

// small utility used inside ReportCard
function clsx(...classes) { return classes.filter(Boolean).join(' '); }

export default Reports;
