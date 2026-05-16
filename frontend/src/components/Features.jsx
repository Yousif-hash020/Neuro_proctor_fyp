import React from 'react';

const BaseCard = ({ number, title, desc, delay }) => (
  <div
    className={`relative group cursor-pointer opacity-0 animate-fade-in-up ${delay} flex flex-col justify-between h-full min-h-[220px] p-[1px]`}
  >
    {/* Frame wrapper preserving the hollow border aesthetic they loved before but heavily balanced */}
    <div className="absolute inset-0 bg-white/20 transition-colors group-hover:bg-white/40" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)' }}></div>

    <div
      className="relative flex flex-col justify-between h-full bg-black/80 backdrop-blur-md px-6 py-8 transition-colors group-hover:bg-white/5"
      style={{ clipPath: 'polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 7px 100%, 0 calc(100% - 7px), 0 7px)' }}
    >
      <div className="flex justify-between items-start mb-12">
        <span className="text-[10px] font-bold text-white/40 tracking-widest">{number}</span>
        {/* Animated Tech Dot */}
        <div className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white group-hover:shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all"></div>
      </div>

      <div>
        <h3 className="text-white text-lg md:text-xl font-bold tracking-widest uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
        <p className="text-[10px] md:text-xs font-light text-white/50 tracking-wider leading-relaxed">
          {desc}
        </p>
      </div>

      {/* Decorative tracking line */}
      <div className="absolute bottom-[20px] right-[20px] w-8 h-[1px] bg-white/20 group-hover:w-16 group-hover:bg-white/60 transition-all duration-500"></div>
    </div>
  </div>
);

export default function Features() {
  return (
    <section className="relative w-full min-h-screen bg-[#030303] text-white flex flex-col justify-center px-6 md:px-10 py-24 selection:bg-white selection:text-black shrink-0 overflow-hidden z-20">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-white/[0.02] blur-[150px] pointer-events-none rounded-full"></div>

      <div className="w-full max-w-[1600px] mx-auto relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

        {/* Left Typography Block */}
        <div className="w-full lg:w-[40%] flex flex-col gap-8 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/30"></div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-bold">02 // Features</span>
          </div>

          <h2
            className="text-white leading-[0.85] tracking-tighter flex flex-col"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(60px, 8vw, 140px)' }}
          >
            <span>VISION AI</span>
            <span className="text-white/40">TRACKING</span>
            <span className="ml-[10%]">FEATURES</span>
          </h2>

          <p className="text-xs font-light text-white/60 tracking-wider leading-relaxed max-w-sm mt-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Our final year automated proctoring AI analyzes biometric and environmental datastreams in real-time to actively prevent cheating and securely detect impersonation attempts.
          </p>

          <div className="w-[1.5px] h-24 bg-gradient-to-b from-white/40 to-transparent mt-8 hidden lg:block"></div>
        </div>

        {/* Right Hex Grid */}
        <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative">
          <div className="md:mt-12 flex flex-col gap-4 md:gap-6">
            <BaseCard
              number="SYS.01"
              title="Facial Recognition"
              desc="Deep-learning facial mapping authenticates identities and actively scans for gaze diversions or absent subjects."
              delay="animation-delay-200"
            />
            <BaseCard
              number="SYS.02"
              title="Pose Detection"
              desc="Neural tracking maps continuous head vectors and body alignment to pinpoint suspicious movement patterns and off-screen glances."
              delay="animation-delay-400"
            />
          </div>
          <div className="flex flex-col gap-4 md:gap-6">
            <BaseCard
              number="SYS.03"
              title="Object Detection"
              desc="Real-time spatial scanning utilizing YOLOv8 immediately pinpoints unauthorized phones, devices, and multiple people."
              delay="animation-delay-300"
            />

            {/* Themed Data readout block mimicking the minimal tech UI */}
            <div className="relative opacity-0 animate-fade-in-up animation-delay-500 h-full min-h-[220px] flex flex-col justify-end p-6 border-l border-white/10">
              <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-white mb-2">Neural Engine</div>
              <div className="text-6xl font-black tracking-tighter" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                ACTIVE
                <span className="w-3 h-3 bg-white rounded-full inline-block ml-4 mb-2 animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)]"></span>
              </div>
              <div className="text-[9px] uppercase tracking-widest text-white/40 mt-4 leading-loose">
                [ Monitoring array initialized ] <br />
                [ Packet sniffing disabled ]
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
