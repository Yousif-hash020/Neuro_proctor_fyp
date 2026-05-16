import React, { useEffect, useRef, useContext, useState } from 'react';
import { AlertCircle, Cpu, ShieldAlert, Phone, Users, PauseCircle, PlayCircle } from 'lucide-react';
import clsx from 'clsx';
import { io } from 'socket.io-client';
import axios from 'axios';
import { SessionContext } from '../context/SessionContext';

const socket = io('http://localhost:5000', { autoConnect: false });

// ─── Camera Card ──────────────────────────────────────────────────────────────
const CameraCard = ({ id, name, isLocalCamera, liveData }) => {
  const [lastFrame, setLastFrame] = useState(null);
  const [lastDetections, setLastDetections] = useState([]);
  const status = isLocalCamera ? 'active' : (liveData ? liveData.status : 'offline');
  const risk = liveData?.risk || 'low';
  const students = liveData?.students ?? (isLocalCamera ? '—' : 0);
  const phones = liveData?.phones ?? 0;
  const confidence = liveData?.confidence ?? 0;
  const yoloFrame = liveData?.frame || null; // base64 annotated YOLO frame
  const detections = liveData?.detections || [];

  // Keep last non-empty YOLO frame to avoid flicker on intermittent frame payloads.
  useEffect(() => {
    if (yoloFrame) setLastFrame(yoloFrame);
  }, [yoloFrame]);

  // Persist last non-empty detections so object panel does not blink to empty.
  useEffect(() => {
    if (detections.length > 0) setLastDetections(detections);
  }, [detections]);

  // The browser webcam (getUserMedia) has been removed to prevent hardware lock
  // conflicts with the Python AI service (cv2.VideoCapture) on Windows.
  // The stream is now exclusively received via WebSockets from the AI backend.

  return (
    <div className="flex flex-col overflow-hidden glass-panel group border-white/10 relative clip-chamfer">
      {/* Corner decorator */}
      <div className="absolute top-0 right-0 p-3 z-20 flex gap-1 h-[20px]" style={{ transform: 'skewX(-25deg)' }}>
        <div className="w-[3px] bg-white/50" />
        <div className="w-[3px] bg-white/50" />
      </div>

      {/* Video area */}
      <div className="relative aspect-video bg-black flex items-center justify-center border-b border-white/10 overflow-hidden">

        {/* Waiting for AI stream placeholder (shown until first frame arrives) */}
        {isLocalCamera && !lastFrame && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mb-4" />
            <span className="text-white/50 font-mono text-xs tracking-[0.2em] uppercase z-10">CONNECTING TO AI STREAM...</span>
          </div>
        )}

        {/* YOLO annotated overlay frame (shown on top of raw video when available) */}
        {lastFrame && isLocalCamera && (
          <img
            src={`data:image/jpeg;base64,${lastFrame}`}
            alt="YOLO Detection"
            className="absolute inset-0 w-full h-full object-contain opacity-90 mix-blend-normal"
          />
        )}

        {/* Offline / no-signal state */}
        {!isLocalCamera && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-black" />
            <span className="text-white/20 font-mono text-xs tracking-[0.5em] uppercase z-10">SIGNAL // UNAVAILABLE</span>
          </div>
        )}

        {/* Status badge + name */}
        <div className="absolute top-4 left-4 flex items-center space-x-3 z-30">
          <span className={clsx(
            "px-2 py-1 text-[8px] tracking-[0.3em] font-bold uppercase backdrop-blur-md clip-chamfer",
            status === 'active' ? "bg-white/10 border border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "bg-red-500/20 border border-red-500 text-red-400"
          )}>
            {status === 'active' ? 'REC // ON' : 'OFFLINE'}
          </span>
          <span className="px-3 py-1 text-[8px] tracking-[0.2em] font-bold text-white bg-black/80 backdrop-blur-md border border-white/20 clip-chamfer font-mono">
            {name}
          </span>
        </div>

        {/* Phone alert badge */}
        {phones > 0 && (
          <div className="absolute top-4 right-12 z-30 flex items-center gap-1 px-2 py-1 bg-red-500/80 border border-red-400 text-white text-[8px] font-bold uppercase tracking-widest clip-chamfer animate-pulse backdrop-blur-md">
            <Phone className="w-3 h-3" /> PHONE DETECTED
          </div>
        )}

        {/* High-risk border pulse */}
        {risk === 'high' && status === 'active' && (
          <div className="absolute inset-0 border-[3px] border-red-500/80 shadow-[inset_0_0_30px_rgba(239,68,68,0.2)] animate-pulse pointer-events-none z-20" />
        )}
      </div>

      {/* Stats bar */}
      <div className="p-4 grid grid-cols-4 gap-2 bg-black/50 relative z-10">
        <div className="flex flex-col">
          <span className="text-[7px] text-white/50 uppercase tracking-[0.2em] mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Persons</span>
          <span className="text-xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>{students}</span>
        </div>
        <div className="flex flex-col border-l border-white/10 pl-2">
          <span className="text-[7px] text-white/50 uppercase tracking-[0.2em] mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phones</span>
          <span className={clsx("text-xl font-bold", phones > 0 ? "text-red-400" : "text-white")} style={{ fontFamily: "'Orbitron', sans-serif" }}>{phones}</span>
        </div>
        <div className="flex flex-col items-center border-l border-white/10 pl-2">
          <span className="text-[7px] text-white/50 uppercase tracking-[0.2em] mb-1">Risk</span>
          <span className={clsx(
            "text-[8px] font-bold uppercase tracking-widest mt-1 px-2 py-1 clip-chamfer border",
            risk === 'low'    && "bg-white/5 border-white/20 text-white/70",
            risk === 'medium' && "bg-yellow-500/10 border-yellow-500/50 text-yellow-400",
            risk === 'high'   && "bg-red-500/20 border-red-500 text-red-400 animate-pulse"
          )}>
            {status === 'active' ? risk : 'N/A'}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[7px] text-white/50 uppercase tracking-[0.2em] mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> Conf.</span>
          <span className="text-xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {status === 'active' ? confidence : 0}<span className="text-[10px]">%</span>
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 bg-black/30 border-t border-white/10">
        <span className="text-[8px] text-white/50 uppercase tracking-[0.2em] font-mono">
          Phones: {phones}
        </span>
      </div>
    </div>
  );
};
// ──────────────────────────────────────────────────────────────────────────────

const LiveMonitoring = () => {
  const { activeSession, loading } = useContext(SessionContext);
  const [detectionData, setDetectionData] = useState({});
  const [alertCount, setAlertCount] = useState(0);
  const [detectionPaused, setDetectionPaused] = useState(false);
  const [controlBusy, setControlBusy] = useState(false);
  const [controlError, setControlError] = useState('');

  // ─── Socket.IO: receive AI detections ─────────────────────────────────────
  useEffect(() => {
    if (!activeSession) return;

    socket.connect();

    socket.on('frontend_update', (payload) => {
      setDetectionData(prev => ({
        ...prev,
        [payload.cameraId]: payload,
      }));
    });

    socket.on('new_alert', () => setAlertCount(c => c + 1));

    return () => {
      socket.off('frontend_update');
      socket.off('new_alert');
      socket.disconnect();
    };
  }, [activeSession]);

  // Reset control panel state when active session changes
  useEffect(() => {
    setDetectionPaused(false);
    setControlBusy(false);
    setControlError('');
  }, [activeSession?._id]);

  const handlePause = async () => {
    if (!activeSession || controlBusy) return;
    setControlBusy(true);
    setControlError('');
    try {
      await axios.post('http://localhost:8000/stop');
      setDetectionPaused(true);
    } catch (err) {
      setControlError(err.response?.data?.detail || 'Unable to pause detection');
    } finally {
      setControlBusy(false);
    }
  };

  const handleResume = async () => {
    if (!activeSession || controlBusy) return;
    setControlBusy(true);
    setControlError('');
    try {
      const sessionId = activeSession._id;
      await axios.post(`http://localhost:8000/start?session_id=${sessionId}&camera_id=0`);
      setDetectionPaused(false);
    } catch (err) {
      setControlError(err.response?.data?.detail || 'Unable to resume detection');
    } finally {
      setControlBusy(false);
    }
  };

  if (loading) return <div className="text-white font-mono uppercase tracking-widest text-xs animate-pulse">Establishing Secure Uplink...</div>;

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
        <ShieldAlert className="w-16 h-16 text-white/20 mb-6" />
        <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Neural Monitoring Offline</h2>
        <p className="text-xs text-white/50 tracking-[0.2em] uppercase font-mono max-w-md leading-relaxed border border-white/10 bg-black p-4 clip-chamfer">
          No active exam session. Initialize a session from the Session Control panel to enable monitoring.
        </p>
      </div>
    );
  }

  // AI data keyed by camera id "0" for single active session monitoring
  const cam0Data = detectionData['0'] || null;
  const objectsDetected = cam0Data?.phones || 0;
  const feedDetections = cam0Data?.detections || [];

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-widest uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
            Active Session Monitoring
          </h1>
          <p className="text-[10px] text-white/50 tracking-[0.3em] uppercase mt-1 font-mono">
            Session: <span className="text-white">{activeSession.title}</span>
            {!detectionPaused && cam0Data && <span className="ml-4 text-green-400">● AI Active</span>}
            {!detectionPaused && !cam0Data && <span className="ml-4 text-yellow-400/70">○ Waiting for AI service…</span>}
            {detectionPaused && <span className="ml-4 text-orange-400">◌ Detection Paused</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {!detectionPaused ? (
            <button
              onClick={handlePause}
              disabled={controlBusy}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-bold border clip-chamfer transition-colors",
                controlBusy
                  ? "text-white/40 border-white/10 bg-white/5 cursor-not-allowed"
                  : "text-orange-400 border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20"
              )}
            >
              <PauseCircle className="w-4 h-4" />
              Pause
            </button>
          ) : (
            <button
              onClick={handleResume}
              disabled={controlBusy}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-bold border clip-chamfer transition-colors",
                controlBusy
                  ? "text-white/40 border-white/10 bg-white/5 cursor-not-allowed"
                  : "text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
              )}
            >
              <PlayCircle className="w-4 h-4" />
              Resume
            </button>
          )}
          {alertCount > 0 && (
            <div className="flex items-center px-4 py-2 bg-red-500/10 border border-red-500/30 clip-chamfer">
              <AlertCircle className="w-4 h-4 text-red-400 mr-3 animate-pulse" />
              <span className="text-[10px] font-bold text-red-400 tracking-[0.2em] uppercase">{alertCount} Alert{alertCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {controlError && (
        <div className="px-4 py-2 border border-red-500/30 bg-red-500/10 text-red-300 text-[10px] tracking-[0.2em] uppercase font-mono clip-chamfer">
          {controlError}
        </div>
      )}

      {/* Active-session focused layout */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8">
            {/* Local camera with YOLO overlay */}
            <CameraCard id="0" name="Cam 1 — Local" isLocalCamera={true} liveData={cam0Data} />
          </div>
          <div className="xl:col-span-4 space-y-4">
            <div className="glass-panel p-4 border-white/10 h-fit">
              <h2 className="text-[10px] text-white/50 tracking-[0.25em] uppercase font-mono mb-4">Session Intel</h2>
              <div className="space-y-3">
                <div className="border border-white/10 bg-white/5 clip-chamfer p-3">
                  <p className="text-[8px] text-white/50 uppercase tracking-[0.2em] font-mono">Session Status</p>
                  <p className="text-[11px] text-white uppercase tracking-widest mt-1 font-bold">{activeSession.status}</p>
                </div>
                <div className="border border-white/10 bg-white/5 clip-chamfer p-3">
                  <p className="text-[8px] text-white/50 uppercase tracking-[0.2em] font-mono">Objects Flagged</p>
                  <p className="text-2xl text-white font-bold mt-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>{objectsDetected}</p>
                </div>
                <div className="border border-white/10 bg-white/5 clip-chamfer p-3">
                  <p className="text-[8px] text-white/50 uppercase tracking-[0.2em] font-mono">Detection Mode</p>
                  <p className={clsx(
                    "text-[10px] uppercase tracking-[0.2em] mt-1 font-bold",
                    detectionPaused ? "text-orange-400" : "text-green-400"
                  )}>
                    {detectionPaused ? 'Paused' : 'Running'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 border-white/10 h-fit">
              <h2 className="text-[10px] text-white/50 tracking-[0.25em] uppercase font-mono mb-4">Detection Alerts</h2>
              <div className="border border-white/10 bg-white/5 clip-chamfer p-3">
                <p className="text-[8px] text-white/50 uppercase tracking-[0.2em] font-mono">Live Objects</p>
                <p className="text-[11px] text-white uppercase tracking-widest mt-1 font-bold">{feedDetections.length}</p>
              </div>
              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {feedDetections.length === 0 ? (
                  <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-mono border border-white/10 bg-white/5 clip-chamfer p-3">
                    No detection in current frame
                  </div>
                ) : (
                  feedDetections.slice(0, 12).map((item, idx) => (
                    <div key={`${item.label}-${idx}`} className="flex items-center justify-between text-[9px] font-mono tracking-widest uppercase border border-white/10 bg-white/5 px-3 py-2 clip-chamfer">
                      <span className="text-white/80">
                        {item.id ? `Person ID: ${item.id}` : item.label}
                      </span>
                      {!item.id && <span className="text-white/60">{item.confidence}%</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
