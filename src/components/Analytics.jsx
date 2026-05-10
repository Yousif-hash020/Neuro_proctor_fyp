import React from 'react';

const AsymmetricStep = ({ number, tech, title, desc, alignMode, delay }) => {
  const isLeft = alignMode === 'left';
  return (
    <div className={`relative flex w-full opacity-0 animate-fade-in-up ${delay} ${isLeft ? 'justify-start' : 'justify-end'} mb-16 md:mb-32 group`}>

      {/* Massive Background Number Watermark */}
      <div className={`absolute top-[-30px] md:top-[-80px] ${isLeft ? 'left-[-20px] md:left-[-40px]' : 'right-[-20px] md:right-[-40px]'} text-[120px] md:text-[250px] font-black text-white/[0.02] select-none pointer-events-none`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {number}
      </div>

      {/* Central Node for Desktop Spine */}
      <div className={`hidden md:block absolute top-[50px] left-1/2 -translate-x-1/2 w-4 h-4 border border-white/40 bg-black rotate-45 group-hover:bg-white group-hover:shadow-[0_0_20px_rgba(255,255,255,1)] transition-all duration-700 z-20`}></div>

      {/* Horizontal connector line */}
      <div className={`hidden md:block absolute top-[57px] ${isLeft ? 'left-[45%] right-1/2 origin-right' : 'left-1/2 right-[45%] origin-left'} h-[1px] bg-white/20 group-hover:bg-white/60 transition-all z-10 duration-700 scale-x-0 group-hover:scale-x-100`}></div>

      <div className={`relative z-10 w-full md:w-[42%] flex flex-col ${isLeft ? 'items-start text-left' : 'items-end text-right'}`}>

        <div className={`flex items-center gap-4 mb-6 ${isLeft ? '' : 'flex-row-reverse'}`}>
          <div className="w-1.5 h-1.5 bg-white/40 group-hover:bg-white group-hover:shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all"></div>
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold text-white/50">{tech}</span>
        </div>

        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          {title}
        </h3>

        {/* Floating Data Slate */}
        <div
          className={`w-full p-8 md:p-10 transition-all duration-700 bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/20 relative backdrop-blur-md`}
          style={{
            clipPath: isLeft ?
              'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' :
              'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'
          }}
        >
          <p className="text-[11px] md:text-[13px] font-light text-white/60 tracking-widest leading-[2.2]">
            {desc}
          </p>
        </div>

      </div>
    </div>
  );
};

export default function Analytics() {
  return (
    <section className="relative w-full min-h-screen bg-[#010101] text-white flex flex-col items-center px-6 md:px-10 py-32 z-20 overflow-hidden border-t border-white/5">

      {/* Absolute Ambient Aura - Creating a breathtaking volumetric glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] md:w-[60vw] h-[60vh] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-[50vw] h-[60vh] bg-white/[0.015] blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[1400px] mx-auto relative z-10 flex flex-col items-center">

        <div className="w-full flex flex-col gap-8 opacity-0 animate-fade-in-up mb-24 md:mb-32">
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/30"></div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-bold">04 // How It Works</span>
          </div>

          <h2
            className="text-white leading-[0.85] tracking-tighter flex flex-col"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(60px, 8vw, 140px)' }}
          >
            <span>THE ANATOMY</span>
            <span className="text-white/40">OF SYSTEM</span>
            <span className="ml-[10%]">DETECTION</span>
          </h2>
        </div>

        <div className="relative w-full flex flex-col pt-10">

          {/* Central Neural Spine connecting everything on Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-[10%] w-[1px] bg-gradient-to-b from-white/30 via-white/10 to-transparent -translate-x-1/2"></div>

          <AsymmetricStep
            number="01"
            tech="Secure Protocol"
            title="Stream Initialization"
            desc="The frontend establishes encrypted camera parameters, initiating a secure localized video stream without ever uploading raw student surveillance data to the root servers in order to strictly maintain academic privacy."
            alignMode="left"
            delay="animation-delay-200"
          />
          <AsymmetricStep
            number="02"
            tech="YOLOv8 Engine"
            title="Spatial Parsing"
            desc="Individual frames are asynchronously routed into the YOLOv8 tensor module, actively mapping the localized environment for prohibited spatial anomalies like secondary persons and unauthorized electronic devices."
            alignMode="right"
            delay="animation-delay-400"
          />
          <AsymmetricStep
            number="03"
            tech="Biometric Neural Net"
            title="Skeletal & Facial Tracking"
            desc="Reticulating localized head poses and continuous gaze vectors, the deep-learning subsystem charts suspicious movement patterns and prolonged off-screen visual attention natively in real-time."
            alignMode="left"
            delay="animation-delay-500"
          />
          <AsymmetricStep
            number="04"
            tech="Heuristic Logic"
            title="Aggregated Threat Scoring"
            desc="All live telemetry streams converge into an instantaneous probability matrix—quantifying kinematic and spatial behavior into a strict threat score that forcibly flags the session upon a threshold breach."
            alignMode="right"
            delay="animation-delay-700"
          />

        </div>
      </div>
    </section>
  );
}
