import React, { useEffect, useRef, useContext, useState } from 'react';
import { Maximize2, AlertCircle, Cpu, ShieldAlert, Phone, Users } from 'lucide-react';
import clsx from 'clsx';
import { io } from 'socket.io-client';
import { SessionContext } from '../context/SessionContext';

const socket = io('http://localhost:5000', { autoConnect: false });

// ─── Camera Card ──────────────────────────────────────────────────────────────
const CameraCard = ({ id, name, isLocalCamera, liveData }) => {
  const videoRef = useRef(null);
  const status = isLocalCamera ? 'active' : (liveData ? liveData.status : 'offline');
  const risk = liveData?.risk || 'low';
  const students = liveData?.students ?? (isLocalCamera ? '—' : 0);
  const phones = liveData?.phones ?? 0;
  const confidence = liveData?.confidence ?? 0;
  const yoloFrame = liveData?.frame || null; // base64 annotated YOLO frame

  // Browser webcam for the local card
  useEffect(() => {
    let stream = null;
    if (isLocalCamera) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.error('Webcam error:', err));
    }
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [isLocalCamera]);

  return (
    <div className="flex flex-col overflow-hidden glass-panel group border-white/10 relative clip-chamfer">
      {/* Corner decorator */}
      <div className="absolute top-0 right-0 p-3 z-20 flex gap-1 h-[20px]" style={{ transform: 'skewX(-25deg)' }}>
        <div className="w-[3px] bg-white/50" />
        <div className="w-[3px] bg-white/50" />
      </div>

      {/* Video area */}
      <div className="relative aspect-video bg-black flex items-center justify-center border-b border-white/10 overflow-hidden">

        {/* Raw browser webcam (always shown for local camera) */}
        {isLocalCamera && (
          <video ref={videoRef} autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale-[20%] contrast-110"
          />
        )}

        {/* YOLO annotated overlay frame (shown on top of raw video when available) */}
        {yoloFrame && isLocalCamera && (
          <img
            src={`data:image/jpeg;base64,${yoloFrame}`}
            alt="YOLO Detection"
            className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-normal"
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

        <button className="absolute p-2 text-white transition-opacity bg-black/80 border border-white/20 clip-chamfer opacity-0 top-4 right-12 backdrop-blur-md group-hover:opacity-100 hover:bg-white/10 z-30">
          <Maximize2 className="w-3 h-3" />
        </button>

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
    </div>
  );
};
// ──────────────────────────────────────────────────────────────────────────────

const LiveMonitoring = () => {
  const { activeSession, loading } = useContext(SessionContext);
  const [detectionData, setDetectionData] = useState({});
  const [alertCount, setAlertCount] = useState(0);

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

  // AI data keyed by camera id "0"
  const cam0Data = detectionData['0'] || null;

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-widest uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
            Live Monitoring
          </h1>
          <p className="text-[10px] text-white/50 tracking-[0.3em] uppercase mt-1 font-mono">
            Session: <span className="text-white">{activeSession.title}</span>
            {cam0Data && <span className="ml-4 text-green-400">● AI Active</span>}
            {!cam0Data && <span className="ml-4 text-yellow-400/70">○ Waiting for AI service…</span>}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {alertCount > 0 && (
            <div className="flex items-center px-4 py-2 bg-red-500/10 border border-red-500/30 clip-chamfer">
              <AlertCircle className="w-4 h-4 text-red-400 mr-3 animate-pulse" />
              <span className="text-[10px] font-bold text-red-400 tracking-[0.2em] uppercase">{alertCount} Alert{alertCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Camera grid */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Local camera with YOLO overlay */}
          <CameraCard id="0" name="Cam 1 — Local" isLocalCamera={true} liveData={cam0Data} />
          {/* Dummy offline feeds */}
          <CameraCard id="1" name="Cam 2 — Hall A" isLocalCamera={false} liveData={null} />
          <CameraCard id="2" name="Cam 3 — Hall B" isLocalCamera={false} liveData={null} />
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
