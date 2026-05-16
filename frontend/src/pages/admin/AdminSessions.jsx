import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, PlayCircle, StopCircle, Pencil, X, Check } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

const toInput = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const fmt = (d) => d ? new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editSession, setEditSession] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', startTime: '', endTime: '' });

  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(data.data || []);
    } catch (err) {
      console.error('Failed to load sessions', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/sessions/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(prev => prev.map(s => s._id === id ? data.data : s));
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const openEdit = (s) => {
    setEditSession(s);
    setEditForm({ title: s.title || '', startTime: toInput(s.startTime), endTime: toInput(s.endTime) });
  };

  const saveEdit = async () => {
    try {
      const payload = {
        title: editForm.title,
        startTime: editForm.startTime ? new Date(editForm.startTime) : null,
        endTime: editForm.endTime ? new Date(editForm.endTime) : null,
      };
      const { data } = await axios.put(`http://localhost:5000/api/sessions/${editSession._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(prev => prev.map(s => s._id === editSession._id ? data.data : s));
      setEditSession(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <CalendarClock className="w-6 h-6 text-white/70" /> Session Control (Admin)
          </h1>
          <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mt-1">View status, activate/deactivate, manage schedule</p>
        </div>
        <button onClick={fetchSessions} className="px-4 py-2 border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-[10px] uppercase tracking-widest clip-chamfer">
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {loading && <p className="text-white/30 font-mono text-xs uppercase tracking-widest animate-pulse">Loading sessions...</p>}

        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 border border-white/10 border-dashed clip-chamfer text-white/20 font-mono text-[10px] uppercase tracking-widest gap-3">
            No sessions found
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map((s) => (
            <div key={s._id} className="glass-panel p-5 border-white/5 relative overflow-hidden">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {s.title}
                  </h3>
                  <div className="text-[9px] text-white/40 font-mono tracking-widest mt-0.5">
                    Invigilator: {s.invigilatorId?.name || '—'}
                  </div>
                </div>
                <span className={clsx(
                  "px-2 py-1 text-[9px] uppercase tracking-widest font-bold rounded-sm border whitespace-nowrap",
                  s.status === 'active' ? "border-blue-500/50 text-blue-400 bg-blue-500/10" :
                  s.status === 'scheduled' ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10" :
                  "border-white/10 text-gray-500"
                )}>
                  {s.status}
                </span>
              </div>

              <div className="space-y-1.5 mb-4 text-[10px] text-white/50 font-mono">
                <div>Start: {fmt(s.startTime)}</div>
                <div>End: {fmt(s.endTime)}</div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                {s.status === 'active' ? (
                  <button onClick={() => updateStatus(s._id, 'completed')} className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2">
                    <StopCircle className="w-3.5 h-3.5" /> Deactivate
                  </button>
                ) : (
                  <button onClick={() => updateStatus(s._id, 'active')} className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2">
                    <PlayCircle className="w-3.5 h-3.5" /> Activate
                  </button>
                )}
                <button onClick={() => openEdit(s)} className="p-2 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white rounded-lg transition-colors" title="Edit schedule">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">Edit Session Schedule</h3>
              <button onClick={() => setEditSession(null)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-1">Title</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-black/50 border border-white/20 clip-chamfer py-3 px-4 text-[11px] tracking-widest text-white focus:outline-none focus:border-white transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-1">Start</label>
                <input
                  type="datetime-local"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full bg-black/50 border border-white/20 clip-chamfer py-3 px-4 text-[11px] tracking-widest text-white focus:outline-none focus:border-white transition-all font-mono scheme-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-1">End</label>
                <input
                  type="datetime-local"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full bg-black/50 border border-white/20 clip-chamfer py-3 px-4 text-[11px] tracking-widest text-white focus:outline-none focus:border-white transition-all font-mono scheme-dark"
                />
              </div>
              <button onClick={saveEdit} className="glass-button px-6 py-3 flex items-center gap-2 text-white bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30 text-[10px] tracking-widest uppercase font-bold">
                <Check className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSessions;

