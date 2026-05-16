import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { UserCog, PlayCircle, StopCircle, ChevronRight } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

const fmt = (d) => (d ? new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

const AdminInvigilators = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchList = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/admin/invigilators', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setList(data.data || []);
    } catch (err) {
      console.error('Failed to load invigilators', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = useCallback(
    async (id) => {
      if (!id) {
        setDetail(null);
        return;
      }
      try {
        setDetailLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/admin/invigilators/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDetail(data.data);
      } catch (err) {
        console.error('Failed to load invigilator detail', err.message);
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId);
    else setDetail(null);
  }, [selectedId, fetchDetail]);

  const updateSessionStatus = async (sessionId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/sessions/${sessionId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = data.data;
      setDetail((prev) => {
        if (!prev?.scheduledSessions && !prev?.completedSessions) return prev;
        return {
          ...prev,
          scheduledSessions: (prev.scheduledSessions || []).map((s) => (s._id === sessionId ? { ...s, ...updated } : s)),
          completedSessions: (prev.completedSessions || []).map((s) => (s._id === sessionId ? { ...s, ...updated } : s)),
        };
      });
      await fetchList();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="shrink-0">
        <h1
          className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <UserCog className="w-6 h-6 text-white/70" /> Invigilators
        </h1>
        <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mt-1">
          Select an invigilator to see sessions created and activate or deactivate them
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* List */}
        <div className="lg:w-[320px] shrink-0 flex flex-col border border-white/10 clip-chamfer bg-black/20">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">Staff</span>
            <button
              type="button"
              onClick={fetchList}
              className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white"
            >
              Refresh
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading && (
              <p className="text-white/30 font-mono text-xs uppercase tracking-widest animate-pulse p-3">Loading…</p>
            )}
            {!loading && list.length === 0 && (
              <p className="text-white/30 font-mono text-[10px] uppercase tracking-widest p-3">No invigilators registered</p>
            )}
            {!loading &&
              list.map((inv) => (
                <button
                  key={inv._id}
                  type="button"
                  onClick={() => setSelectedId(inv._id)}
                  className={clsx(
                    'w-full text-left px-3 py-3 flex items-center justify-between gap-2 clip-chamfer transition-colors',
                    selectedId === inv._id
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'border border-transparent hover:bg-white/5 text-white/70'
                  )}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold tracking-wide text-white truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {inv.name}
                    </div>
                    <div className="text-[9px] text-white/40 font-mono truncate">{inv.email}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono">Scheduled</div>
                      <div className="text-[11px] font-mono text-white/70">{inv.scheduledCount ?? 0}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono">Completed</div>
                      <div className="text-[11px] font-mono text-white/70">{inv.completedCount ?? 0}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Detail */}
        <div className="flex-1 min-w-0 flex flex-col border border-white/10 clip-chamfer bg-black/10">
          {!selectedId && (
            <div className="flex-1 flex items-center justify-center text-white/30 font-mono text-[10px] uppercase tracking-widest p-8">
              Select an invigilator to view sessions
            </div>
          )}

          {selectedId && (
            <>
              <div className="px-5 py-4 border-b border-white/10">
                {detailLoading ? (
                  <p className="text-white/40 font-mono text-xs animate-pulse">Loading details…</p>
                ) : detail ? (
                  <>
                    <h2
                      className="text-lg font-bold text-white tracking-widest uppercase"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {detail.name}
                    </h2>
                    <p className="text-[10px] text-white/50 font-mono mt-1">{detail.email}</p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="border border-white/10 bg-black/30 p-3 clip-chamfer">
                        <div className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono">Scheduled</div>
                        <div className="text-lg font-bold text-white font-mono">{detail.scheduledCount ?? detail.scheduledSessions?.length ?? 0}</div>
                      </div>
                      <div className="border border-white/10 bg-black/30 p-3 clip-chamfer">
                        <div className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono">Completed</div>
                        <div className="text-lg font-bold text-white font-mono">{detail.completedCount ?? detail.completedSessions?.length ?? 0}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-red-400/80 text-xs">Could not load invigilator.</p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {detail && (detail.scheduledSessions?.length || 0) === 0 && (detail.completedSessions?.length || 0) === 0 && (
                  <div className="border border-white/10 border-dashed clip-chamfer p-8 text-center text-white/30 font-mono text-[10px] uppercase tracking-widest">
                    No sessions yet
                  </div>
                )}

                {/* Scheduled sessions (actions allowed) */}
                {(detail?.scheduledSessions?.length || 0) > 0 && (
                  <div className="mb-6">
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-3">Scheduled sessions</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detail?.scheduledSessions?.map((s) => (
                        <div key={s._id} className="glass-panel p-4 border-white/5">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <h3
                              className="text-sm font-bold tracking-widest uppercase text-white truncate"
                              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                              {s.title}
                            </h3>
                            <span
                              className={clsx(
                                'px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold rounded-sm border shrink-0',
                                'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                              )}
                            >
                              scheduled
                            </span>
                          </div>
                          <div className="space-y-1 mb-3 text-[10px] text-white/50 font-mono">
                            <div>Start: {fmt(s.startTime)}</div>
                            <div>End: {fmt(s.endTime)}</div>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-white/10">
                            <button
                              type="button"
                              onClick={() => updateSessionStatus(s._id, 'active')}
                              className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2"
                            >
                              <PlayCircle className="w-3.5 h-3.5" /> Activate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed sessions (no actions) */}
                {(detail?.completedSessions?.length || 0) > 0 && (
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-3">Completed sessions</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detail?.completedSessions?.map((s) => (
                        <div key={s._id} className="glass-panel p-4 border-white/5 opacity-70">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <h3
                              className="text-sm font-bold tracking-widest uppercase text-white truncate"
                              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                              {s.title}
                            </h3>
                            <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold rounded-sm border shrink-0 border-white/10 text-gray-500">
                              completed
                            </span>
                          </div>
                          <div className="space-y-1 text-[10px] text-white/50 font-mono">
                            <div>Start: {fmt(s.startTime)}</div>
                            <div>End: {fmt(s.endTime)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInvigilators;
