import React, { useContext, useState, useEffect } from 'react';
import { Video, Plus, PlayCircle, StopCircle, Clock, X, Pencil, Trash2, Check, CalendarClock, Timer } from 'lucide-react';
import clsx from 'clsx';
import { SessionContext } from '../context/SessionContext';

// ─── Countdown Hook ────────────────────────────────────────────────────────────
function useCountdown(endTime, status) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (status !== 'active' || !endTime) {
      setRemaining('');
      return;
    }

    const tick = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) { setRemaining('Closing...'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h > 0 ? `${h}h ` : ''}${m}m ${s}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime, status]);

  return remaining;
}
// ──────────────────────────────────────────────────────────────────────────────

// ─── Session Card ─────────────────────────────────────────────────────────────
const SessionCard = ({ session, onUpdateStatus, onDelete, onUpdate }) => {
  const { _id, title, assignedCameras, startTime, endTime, status } = session;
  const room = assignedCameras?.length ? assignedCameras.join(', ') : 'Local Webcam';

  const fmt = (d) => d ? new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const countdown = useCountdown(endTime, status);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    const result = await onUpdate(_id, { title: editTitle });
    if (result.success) setIsEditing(false);
    else alert(result.message);
  };

  // Determine how far into the session we are for a progress bar
  const progress = (() => {
    if (status !== 'active' || !startTime || !endTime) return 0;
    const total = new Date(endTime) - new Date(startTime);
    const elapsed = new Date() - new Date(startTime);
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  })();

  return (
    <div className={clsx(
      "glass-panel p-5 relative overflow-hidden group border-white/5 transition-all duration-300",
      status === 'active' && "hover:border-blue-500/30",
      status === 'scheduled' && "hover:border-yellow-500/20",
      status === 'completed' && "hover:border-white/10 opacity-60 hover:opacity-100"
    )}>

      {/* Progress bar for active sessions */}
      {status === 'active' && endTime && (
        <div className="absolute bottom-0 left-0 h-[2px] bg-blue-500/60 transition-all duration-1000" style={{ width: `${progress}%` }} />
      )}

      {/* Glow for active */}
      {status === 'active' && (
        <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none z-0">
          <div className="absolute top-[-10px] right-[-10px] w-full h-full bg-blue-500/20 blur-2xl rounded-full" />
        </div>
      )}

      {/* Title row */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex-1 mr-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="flex-1 bg-black/80 border border-white/40 text-white text-xs font-bold tracking-widest uppercase px-2 py-1 focus:outline-none focus:border-white clip-chamfer font-mono"
              />
              <button onClick={handleSaveEdit} className="text-white hover:text-green-400 transition-colors"><Check className="w-4 h-4" /></button>
              <button onClick={() => { setIsEditing(false); setEditTitle(title); }} className="text-white/50 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <h3 className="text-sm font-bold tracking-widest uppercase text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
          )}
          <div className="text-[9px] text-white/40 font-mono tracking-widest mt-0.5">{room}</div>
        </div>
        <span className={clsx(
          "px-2 py-1 text-[9px] uppercase tracking-widest font-bold rounded-sm border whitespace-nowrap",
          status === 'active' ? "border-blue-500/50 text-blue-400 bg-blue-500/10" :
          status === 'scheduled' ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10" :
          "border-white/10 text-gray-500"
        )}>
          {status}
        </span>
      </div>

      {/* Time info */}
      <div className="space-y-1.5 mb-4 relative z-10">
        <div className="flex items-center gap-2 text-[10px] text-white/50 font-mono">
          <CalendarClock className="w-3 h-3 shrink-0" />
          <span>Start: {fmt(startTime)}</span>
        </div>
        {endTime && (
          <div className="flex items-center gap-2 text-[10px] text-white/50 font-mono">
            <Clock className="w-3 h-3 shrink-0" />
            <span>End: {fmt(endTime)}</span>
          </div>
        )}
        {countdown && (
          <div className="flex items-center gap-2 text-[10px] text-blue-400 font-mono animate-pulse">
            <Timer className="w-3 h-3 shrink-0" />
            <span>Time remaining: {countdown}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/10 relative z-10">
        {status === 'active' ? (
          <button onClick={() => onUpdateStatus(_id, 'completed')} className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <StopCircle className="w-3.5 h-3.5" /> Stop
          </button>
        ) : status === 'scheduled' ? (
          <button onClick={() => onUpdateStatus(_id, 'active')} className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <PlayCircle className="w-3.5 h-3.5" /> Start Now
          </button>
        ) : (
          <div className="flex-1 py-2 text-center text-gray-600 border border-white/5 rounded-lg text-[10px] uppercase tracking-widest">Completed</div>
        )}

        <button
          onClick={() => { setIsEditing(true); setEditTitle(title); }}
          disabled={status === 'active'}
          title="Edit title"
          className={clsx("p-2 border rounded-lg transition-colors",
            status === 'active' ? "text-white/20 border-white/5 cursor-not-allowed" : "text-white/50 border-white/10 hover:bg-white/10 hover:text-white cursor-pointer"
          )}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => { if (window.confirm(`Delete session "${title}"?`)) onDelete(_id); }}
          disabled={status === 'active'}
          title={status === 'active' ? 'Stop session before deleting' : 'Delete session'}
          className={clsx("p-2 border rounded-lg transition-colors",
            status === 'active' ? "text-white/20 border-white/5 cursor-not-allowed" : "text-red-400/60 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 cursor-pointer"
          )}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
// ──────────────────────────────────────────────────────────────────────────────

// ─── Helper: get local datetime string for input[type=datetime-local] ──────────
const toLocalDateTimeInput = (offsetMinutes = 0) => {
  const d = new Date(Date.now() + offsetMinutes * 60000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
};
// ──────────────────────────────────────────────────────────────────────────────

const SessionManagement = () => {
  const { sessions, loading, updateSessionStatus, createSession, updateSession, deleteSession } = useContext(SessionContext);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [startTime, setStartTime] = useState(toLocalDateTimeInput(1));
  const [endTime, setEndTime] = useState(toLocalDateTimeInput(61));

  const resetForm = () => {
    setNewTitle('');
    setStartTime(toLocalDateTimeInput(1));
    setEndTime(toLocalDateTimeInput(61));
    setShowCreate(false);
  };

  const handleUpdateStatus = async (id, status) => {
    const result = await updateSessionStatus(id, status);
    if (!result.success) alert(result.message);
  };

  const handleDelete = async (id) => {
    const result = await deleteSession(id);
    if (!result.success) alert(result.message);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (new Date(endTime) <= new Date(startTime)) {
      alert('End time must be after start time.');
      return;
    }
    const result = await createSession(newTitle, new Date(startTime), new Date(endTime), ['Local Webcam']);
    if (result.success) resetForm();
    else alert(result.message);
  };

  if (loading) {
    return <div className="text-white font-mono uppercase tracking-widest text-xs animate-pulse">Initializing Data Core...</div>;
  }

  const activeOrScheduled = sessions.filter(s => s.status !== 'completed');
  const history = sessions.filter(s => s.status === 'completed');

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Video className="w-6 h-6 text-blue-500" /> Session Control
          </h1>
          <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mt-1">Schedule & manage exam monitoring sessions</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); if (showCreate) resetForm(); }}
          className="glass-button px-4 py-2 flex items-center justify-center text-white bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30 text-xs tracking-widest uppercase font-bold gap-2"
        >
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreate ? 'Cancel' : 'New Session'}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="glass-panel p-5 shrink-0 border-blue-500/20 space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-1">Deploy New Exam Session</h2>

          <div>
            <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-1.5">Exam Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. CS101 Final Exam"
              required
              className="w-full bg-black/50 border border-white/20 clip-chamfer py-3 px-4 text-[11px] tracking-widest text-white focus:outline-none focus:border-white transition-all font-mono placeholder:text-white/20"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-1.5">
                <CalendarClock className="inline w-3 h-3 mr-1" /> Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/20 clip-chamfer py-3 px-4 text-[11px] tracking-widest text-white focus:outline-none focus:border-white transition-all font-mono [color-scheme:dark]"
              />
              <p className="text-[9px] text-white/30 font-mono mt-1 ml-1">Session auto-starts at this time</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-1.5">
                <Clock className="inline w-3 h-3 mr-1" /> End Date & Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/20 clip-chamfer py-3 px-4 text-[11px] tracking-widest text-white focus:outline-none focus:border-white transition-all font-mono [color-scheme:dark]"
              />
              <p className="text-[9px] text-white/30 font-mono mt-1 ml-1">Session auto-closes at this time</p>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="px-8 py-3 bg-white text-black text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-gray-200 transition-colors clip-chamfer">
              Schedule Session
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-3 border border-white/20 text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] hover:text-white hover:border-white transition-colors clip-chamfer">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Session Lists */}
      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {activeOrScheduled.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 mb-4 ml-1">Active & Scheduled</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeOrScheduled.map(session => (
                <SessionCard key={session._id} session={session} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} onUpdate={updateSession} />
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 mb-4 ml-1">History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {history.map(session => (
                <SessionCard key={session._id} session={session} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} onUpdate={updateSession} />
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && !showCreate && (
          <div className="flex flex-col items-center justify-center h-48 border border-white/10 border-dashed clip-chamfer text-white/30 font-mono text-[10px] tracking-widest uppercase gap-3">
            <CalendarClock className="w-8 h-8 opacity-30" />
            No Exam Sessions Initialized
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManagement;
