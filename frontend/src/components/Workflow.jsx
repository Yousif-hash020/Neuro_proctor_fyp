import React from 'react';

const ProtocolPane = ({ number, title, desc, align, delay }) => (
  <div className={`relative opacity-0 animate-fade-in-up ${delay} flex ${align === 'right' ? 'justify-end' : 'justify-start'} w-full mb-12`}>
    <div className={`w-full md:w-[70%] p-10 md:p-14 bg-white/[0.01] border border-white/5 backdrop-blur-3xl hover:bg-white/[0.03] transition-colors relative group`}
      style={{ clipPath: align === 'right' ? 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' : 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>

      <div className={`absolute top-[-40px] ${align === 'right' ? 'right-10' : 'left-10'} text-[100px] md:text-[180px] font-black text-white/[0.03] pointer-events-none`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{number}</div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
        <div className="flex flex-col gap-2 shrink-0">
          <span className="text-[10px] text-white/50 tracking-[0.4em] font-bold uppercase">Step {number}</span>
          <h3 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{title}</h3>
          <div className={`w-12 h-[2px] bg-white mt-4 ${align === 'right' ? 'ml-auto' : ''}`}></div>
        </div>
        <p className={`text-[12px] font-light text-white/60 tracking-widest leading-[2.2] border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 ${align === 'right' ? 'text-right' : 'text-left'}`}>
          {desc}
        </p>
      </div>
    </div>
  </div>
);

export default function Workflow() {
  return (
    <section className="relative w-full min-h-screen bg-[#010101] text-white flex flex-col items-center px-6 md:px-10 py-32 z-20 overflow-hidden border-t border-white/5">
      <div className="absolute top-1/4 right-0 w-[50vw] h-[60vh] bg-white/[0.015] blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-0 w-[50vw] h-[60vh] bg-white/[0.015] blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[1400px] mx-auto relative z-10 flex flex-col">
        <div className="w-full flex flex-col gap-8 opacity-0 animate-fade-in-up mb-24 md:mb-32">
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/30"></div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-bold">03 // Initialization</span>
          </div>

          <h2
            className="text-white leading-[0.85] tracking-tighter flex flex-col"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(60px, 8vw, 140px)' }}
          >
            <span>PROTOCOL</span>
            <span className="text-white/40">EXECUTION</span>
            <span className="ml-[10%]">SEQUENCE</span>
          </h2>
        </div>

        <div className="flex flex-col w-full relative">
          <ProtocolPane number="01" title="Impersonation Detection" desc="Advanced biometric validation ensures the active user matches registered physical profiles instantly, preventing unauthorized identity hand-offs before connection." align="left" delay="animation-delay-200" />
          <ProtocolPane number="02" title="Environment Scan" desc="Pre-flight checks analyze background acoustics, lighting parameters, and external hardware connections to actively block cheating methodologies." align="right" delay="animation-delay-400" />
          <ProtocolPane number="03" title="Live Telemetry" desc="Continuous streaming of micro-expressions and eye-tracking guarantees active exam integrity, halting cheating behaviors natively during the session." align="left" delay="animation-delay-600" />
        </div>
      </div>
    </section>
  );
}
