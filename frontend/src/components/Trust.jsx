import React from 'react';

const TeamBadge = ({ name, role, desc, idNumber, delay }) => (
  <div className={`relative flex flex-col p-8 md:p-12 border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all group opacity-0 animate-fade-in-up ${delay} backdrop-blur-2xl`}
    style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>

    <div className="absolute top-0 right-0 p-4 flex gap-1 items-center">
      <div className="text-[8px] font-mono text-white/30 tracking-widest">{idNumber}</div>
      <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white group-hover:shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all"></div>
    </div>

    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:via-white transition-colors"></div>

    <div className="mb-10 mt-6 relative w-20 h-20 md:w-24 md:h-24 border border-white/20 flex items-center justify-center overflow-hidden group-hover:border-white/60 transition-colors" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
      <div className="text-[30px] font-black opacity-20 group-hover:opacity-100 transition-opacity" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{name.split(' ')[0][0]}</div>
      <div className="absolute inset-0 bg-white/[0.02]"></div>
    </div>

    <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-widest mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{name}</h3>
    <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/50 mb-6">{role}</div>

    <p className="text-[11px] font-light text-white/60 tracking-widest leading-[2]">
      {desc}
    </p>
  </div>
);

export default function Trust() {
  return (
    <section className="relative w-full min-h-screen bg-[#010101] text-white flex flex-col justify-center px-6 md:px-10 py-32 z-20 overflow-hidden border-t border-white/5">
      <div className="absolute top-1/4 left-[-10vw] w-[40vw] h-[60vh] bg-white/[0.015] blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[1400px] mx-auto relative z-10 flex flex-col">

        <div className="w-full flex flex-col gap-8 opacity-0 animate-fade-in-up mb-24 lg:mb-32">
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/30"></div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-bold">06 // Development Team</span>
          </div>

          <h2
            className="text-white leading-[0.85] tracking-tighter flex flex-col"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(60px, 8vw, 140px)' }}
          >
            <span>THE CORE</span>
            <span className="text-white/40">SYSTEM</span>
            <span className="ml-[10%]">ARCHITECTS</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 w-full relative">
          <div className="hidden lg:block absolute top-[180px] left-0 w-full h-[1px] bg-white/10 z-0"></div>

          <TeamBadge
            name="Muhammad Yousif"
            role="Final Year CS / Core Architect"
            desc="Engineered the core anti-cheating and impersonation algorithms to guarantee absolute academic integrity across remote environments."
            idNumber="ID: CS-9012"
            delay="animation-delay-200"
          />
          <TeamBadge
            name="Adam Ali"
            role="Final Year CS / Systems"
            desc="Designed the high-performance telemetry engine and biometric data pipelines to actively monitor exam sessions in real-time."
            idNumber="ID: CS-9034"
            delay="animation-delay-400"
          />
          <TeamBadge
            name="Hamza Riaz"
            role="Final Year CS / Platform"
            desc="Developed the robust architectural framework prioritizing algorithmic efficiency, seamless integration, and strict system tracking."
            idNumber="ID: CS-9056"
            delay="animation-delay-600"
          />
        </div>

      </div>
    </section>
  );
}
