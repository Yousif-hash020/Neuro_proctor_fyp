import React from 'react';

export default function FooterCTA() {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col bg-[#000] text-white px-6 md:px-10 border-t border-white/10 z-20 pt-32 pb-8 overflow-hidden">

      {/* Massive Aura background */}
      <div className="absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-[90vw] h-[70vw] bg-white/[0.02] blur-[200px] pointer-events-none rounded-full"></div>

      {/* Enormous Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35vw] font-black text-white/[0.015] pointer-events-none select-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        TERMINATE
      </div>

      <div className="w-full max-w-[1400px] mx-auto flex-1 flex flex-col justify-center opacity-0 animate-fade-in-up relative z-10 w-full">

        <div className="w-full flex flex-col gap-8 mb-20 mt-20">
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/30"></div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-bold">07 // Terminal Status</span>
          </div>

          <h2
            className="text-white leading-[0.85] tracking-tighter flex flex-col"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(60px, 8vw, 140px)' }}
          >
            <span>SECURE YOUR</span>
            <span className="text-white/40">DIGITAL</span>
            <span className="ml-[10%]">EXAMINATIONS</span>
          </h2>
        </div>

        <div className="ml-[10%] w-max">
          <button
            className="relative flex items-center justify-center gap-4 px-12 md:px-16 py-6 bg-white/[0.03] hover:bg-white/10 border border-white/20 hover:border-white/60 backdrop-blur-2xl transition-all duration-500 text-white cursor-pointer group"
            style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
          >
            <span className="absolute top-0 right-[-10px] w-32 h-[1px] bg-white/40 group-hover:bg-white transition-colors"></span>
            <span className="text-[11px] md:text-[13px] tracking-[0.4em] uppercase font-black">INITIALIZE PROCTORING</span>
            <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/50 group-hover:border-white transition-colors"></span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-center py-10 border-t border-white/10 mt-auto opacity-0 animate-fade-in-up animation-delay-300 gap-8 relative z-10">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-3 h-3 border border-white/40 flex items-center justify-center rotate-45 group-hover:border-white transition-colors">
            <div className="w-1 h-1 bg-white/60 group-hover:bg-white transition-colors"></div>
          </div>
          <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/60 group-hover:text-white transition-colors">NEURO PROCTOR © 2026</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {["System Architecture", "API Integration", "Privacy Protocol", "GitHub Repository"].map(link => (
            <a key={link} href={`#${link}`} className="text-[9px] uppercase tracking-[0.3em] font-medium text-white/40 hover:text-white transition-colors inline-block relative before:absolute before:bottom-[-4px] before:left-0 before:w-full before:h-[1px] before:bg-white before:scale-x-0 overflow-hidden before:origin-right hover:before:scale-x-100 hover:before:origin-left before:transition-transform">
              {link}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
