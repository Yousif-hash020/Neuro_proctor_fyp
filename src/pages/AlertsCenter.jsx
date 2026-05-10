import React, { useEffect, useState, useContext, useRef } from 'react';
import { ShieldAlert, AlertTriangle, Filter, Search, XCircle, CheckCircle2, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const socket = io('http://localhost:5000', { autoConnect: false });

const SEV_STYLE = {
  Red:    'bg-red-500/10 border-red-500/30 text-red-400',
  Orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  Yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  default:'bg-white/5 border-white/10 text-gray-400',
};

const AlertItem = ({ alert, onResolve, onDismiss }) => {
  const { _id, type, severity, cameraName, cameraId, status, createdAt } = alert;
  const timeStr = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className={clsx(
      "flex items-start md:items-center justify-between p-4 border rounded-xl backdrop-blur-md transition-all duration-300 hover:bg-white/5 group",
      SEV_STYLE[severity] || SEV_STYLE.default,
      status === 'resolved' && 'opacity-50'
    )}>
      <div className="flex items-start gap-4">
        <div className="mt-1 md:mt-0 p-2 bg-black/20 rounded-lg shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold tracking-wider uppercase text-sm">{type}</h3>
          <div className="flex items-center gap-3 mt-1.5 text-xs opacity-80 font-mono flex-wrap">
            <span>{cameraName || `Cam ${cameraId}`}</span>
            <span className="w-1 h-1 rounded-full bg-current" />
            <span>{timeStr}</span>
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className={clsx(
              "px-2 py-0.5 text-[9px] rounded-full border uppercase tracking-widest font-bold",
              status === 'resolved' ? "border-green-500/50 text-green-400" : "border-current"
            )}>
              {status}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 ml-2 shrink-0">
        {status !== 'resolved' && (
          <button onClick={() => onResolve(_id)} title="Resolve" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => onDismiss(_id)} title="Dismiss" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-red-400">
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const AlertsCenter = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSev, setFilterSev] = useState('All');
  const [loading, setLoading] = useState(true);

  // ─── Fetch existing alerts from API ─────────────────────────────────────────
  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(data.data);
    } catch (err) {
      console.error('Failed to fetch alerts', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Socket: real-time new alerts ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetchAlerts();
    socket.connect();
    socket.on('new_alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });
    return () => {
      socket.off('new_alert');
      socket.disconnect();
    };
  }, [user]);

  // ─── Resolve ────────────────────────────────────────────────────────────────
  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(`http://localhost:5000/api/alerts/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(prev => prev.map(a => a._id === id ? data.data : a));
    } catch (err) {
      console.error('Resolve failed', err.message);
    }
  };

  // ─── Dismiss (remove from local state only) ─────────────────────────────────
  const handleDismiss = (id) => setAlerts(prev => prev.filter(a => a._id !== id));

  // ─── Clear all resolved ─────────────────────────────────────────────────────
  const handleClearResolved = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/alerts/resolved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(prev => prev.filter(a => a.status !== 'resolved'));
    } catch (err) {
      console.error('Clear failed', err.message);
    }
  };

  // ─── Derived counts ─────────────────────────────────────────────────────────
  const counts = {
    Red:      alerts.filter(a => a.severity === 'Red'    && a.status === 'active').length,
    Orange:   alerts.filter(a => a.severity === 'Orange' && a.status === 'active').length,
    Yellow:   alerts.filter(a => a.severity === 'Yellow' && a.status === 'active').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  // ─── Filtered list ───────────────────────────────────────────────────────────
  const filtered = alerts.filter(a => {
    const matchSev = filterSev === 'All' || a.severity === filterSev;
    const matchSearch = !search || a.type.toLowerCase().includes(search.toLowerCase()) || (a.cameraName || '').toLowerCase().includes(search.toLowerCase());
    return matchSev && matchSearch;
  });

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <ShieldAlert className="w-6 h-6 text-red-500" /> Alerts Center
          </h1>
          <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mt-1">Real-time threat monitoring & resolution</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative glass-panel rounded-xl overflow-hidden p-0 border-white/10 flex items-center">
            <Search className="w-4 h-4 text-gray-500 ml-3 absolute" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none py-2 pl-9 pr-4 text-xs tracking-widest text-white focus:ring-0 focus:outline-none w-44 font-mono placeholder:text-gray-600"
            />
          </div>
          <select
            value={filterSev}
            onChange={e => setFilterSev(e.target.value)}
            className="bg-black border border-white/20 text-white text-[10px] tracking-widest uppercase font-bold clip-chamfer px-4 py-2 focus:outline-none appearance-none cursor-pointer hover:bg-white/5"
          >
            <option value="All">All Severity</option>
            <option value="Red">High (Red)</option>
            <option value="Orange">Medium (Orange)</option>
            <option value="Yellow">Low (Yellow)</option>
          </select>
          <button onClick={handleClearResolved} className="flex items-center gap-2 px-3 py-2 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 text-[10px] uppercase tracking-widest transition-colors clip-chamfer">
            <Trash2 className="w-3.5 h-3.5" /> Clear Resolved
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'High Severity',   count: counts.Red,      color: 'text-red-500',    border: 'border-red-500/20' },
          { label: 'Medium Severity', count: counts.Orange,   color: 'text-orange-500', border: 'border-orange-500/20' },
          { label: 'Low Severity',    count: counts.Yellow,   color: 'text-yellow-500', border: 'border-yellow-500/20' },
          { label: 'Resolved',        count: counts.resolved, color: 'text-green-500',  border: 'border-green-500/20' },
        ].map(({ label, count, color, border }) => (
          <div key={label} className={clsx('glass-panel p-4 flex flex-col gap-1', border)}>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{label}</span>
            <span className={clsx('text-2xl font-bold', color)} style={{ fontFamily: "'Orbitron', sans-serif" }}>{count}</span>
          </div>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex-1 glass-panel overflow-hidden flex flex-col border-white/5">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">Live Alert Log</h2>
          {counts.Red + counts.Orange + counts.Yellow > 0 && (
            <span className="flex items-center gap-2 text-[9px] text-red-400 font-mono tracking-widest animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {counts.Red + counts.Orange + counts.Yellow} ACTIVE
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && <p className="text-white/30 font-mono text-xs uppercase tracking-widest animate-pulse">Loading alerts...</p>}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-white/20 font-mono text-[10px] uppercase tracking-widest gap-2">
              <ShieldAlert className="w-8 h-8 opacity-30" />
              No alerts found
            </div>
          )}
          {filtered.map(alert => (
            <AlertItem key={alert._id} alert={alert} onResolve={handleResolve} onDismiss={handleDismiss} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsCenter;
