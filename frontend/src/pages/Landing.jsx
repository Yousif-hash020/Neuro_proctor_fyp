import React from 'react';
import bgImg from '../assets/bg_img.png';
import { Terminal, Shield, Eye, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-y-auto overflow-x-hidden font-inter selection:bg-white selection:text-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={bgImg} alt="Background" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black"></div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-white" />
          <span className="text-xl font-bold tracking-widest uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Neuro<span className="text-white/50">Proctor</span>
          </span>
        </div>
        <Link to="/login" className="px-6 py-2 text-xs font-bold tracking-widest uppercase bg-white text-black hover:bg-white/90 clip-chamfer transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]">
          System Login
        </Link>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-white/20 bg-white/5 clip-chamfer">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          <span className="text-[9px] font-bold tracking-widest uppercase text-white/70">AI Monitoring Active</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tight mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Uncompromised <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-white">Integrity</span>
        </h1>
        
        <p className="max-w-2xl text-sm md:text-base text-white/50 font-mono tracking-widest leading-relaxed mb-12">
          Advanced AI-based exam cheating and impersonation detection system. Real-time neural analysis. Behavioral pattern recognition. Total surveillance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {[
            { title: "Object Detection", desc: "YOLOv8 powered real-time object tracking", icon: Eye },
            { title: "Face Match", desc: "Biometric identity verification protocol", icon: Shield },
            { title: "Risk Engine", desc: "Automated behavioral threat scoring", icon: ShieldAlert }
          ].map((feature, idx) => (
            <div key={idx} className="p-6 border border-white/10 bg-black/50 backdrop-blur-sm glass-panel group hover:bg-white/5 transition-all">
              <feature.icon className="w-8 h-8 mb-4 text-white/70 group-hover:text-white" />
              <h3 className="text-sm font-bold tracking-widest uppercase mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{feature.title}</h3>
              <p className="text-[10px] font-mono text-white/40 uppercase leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
