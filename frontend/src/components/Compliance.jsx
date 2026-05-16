import React from 'react';

export default function Compliance() {
  return (
    <section className="relative w-full min-h-[90vh] bg-[#000] text-white flex flex-col justify-center px-6 md:px-10 py-32 z-20 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-[15vw] font-black text-white/[0.02] tracking-tighter whitespace-nowrap" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>P R I V A C Y</div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[1400px] mx-auto relative z-10 flex flex-col items-start text-left">

        <div className="w-full flex flex-col gap-8 opacity-0 animate-fade-in-up mb-20 md:mb-24">
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/30"></div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-bold">05 // Compliance</span>
          </div>

          <h2
            className="text-white leading-[0.85] tracking-tighter flex flex-col"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(60px, 8vw, 140px)' }}
          >
            <span>PRIVACY IS</span>
            <span className="text-white/40">THE SYSTEM</span>
            <span className="ml-[10%]">ARCHITECTURE</span>
          </h2>
        </div>

        <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 opacity-0 animate-fade-in-up animation-delay-400">
          <div className="flex flex-col items-center md:items-start text-center md:text-left group relative p-10 bg-white/[0.01] border border-white/5 hover:border-white/20 transition-all backdrop-blur-md">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.3em] text-white mb-6">Ephemeral Data</h4>
            <p className="text-[11px] md:text-xs font-light text-white/50 tracking-widest leading-[2]">
              Biometric streams are evaluated entirely in-memory. Zero face data is permanently written to physical storage disks. It is pure algorithmic analysis, instantaneously evaporated post-metric computation.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left group relative p-10 bg-white/[0.01] border border-white/5 hover:border-white/20 transition-all backdrop-blur-md">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.3em] text-white mb-6">Academic Integrity</h4>
            <p className="text-[11px] md:text-xs font-light text-white/50 tracking-widest leading-[2]">
              Engineered exclusively for academic rigor by our CS team, prioritizing student privacy while effectively identifying cheating and blocking systematic impersonation vulnerabilities natively.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
