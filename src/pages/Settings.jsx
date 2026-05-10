import React from 'react';
import { Settings as SettingsIcon, Save, Sliders, Bell, Video, Database } from 'lucide-react';
import clsx from 'clsx';

const SettingSection = ({ title, icon: Icon, children }) => (
  <div className="glass-panel p-6 border-white/5 mb-6">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
      <div className="p-2 bg-white/5 rounded-lg text-white">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-sm font-bold tracking-widest uppercase text-white">{title}</h2>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const SettingToggle = ({ label, description, enabled }) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="text-sm font-medium text-white mb-1">{label}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-widest">{description}</div>
    </div>
    <div className={clsx("w-10 h-5 rounded-full relative cursor-pointer transition-colors", enabled ? "bg-blue-500" : "bg-white/10")}>
      <div className={clsx("absolute top-1 w-3 h-3 rounded-full bg-white transition-transform", enabled ? "right-1" : "left-1")}></div>
    </div>
  </div>
);

const SettingRange = ({ label, value, unit }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="text-xs text-blue-400 font-mono font-bold">{value}{unit}</div>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-blue-500" style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const Settings = () => {
  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <SettingsIcon className="w-6 h-6 text-gray-400" />
            System Configuration
          </h1>
          <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mt-1">Adjust AI thresholds and global parameters</p>
        </div>
        
        <button className="glass-button px-6 py-2 flex items-center text-white bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30 text-xs tracking-widest uppercase font-bold gap-2 transition-all">
          <Save className="w-4 h-4" /> Save Config
        </button>
      </div>

      <SettingSection title="YOLO Detection Engine" icon={Sliders}>
        <SettingRange label="Person Detection Confidence Threshold" value={65} unit="%" />
        <SettingRange label="Motion Sensitivity" value={80} unit="%" />
        <SettingToggle label="Hardware Acceleration (CUDA)" description="Use GPU for inference if available" enabled={true} />
      </SettingSection>

      <SettingSection title="Alerts & Notifications" icon={Bell}>
        <SettingToggle label="Push Notifications" description="Send real-time alerts to dashboard" enabled={true} />
        <SettingToggle label="Sound Alerts" description="Play warning tone on high severity" enabled={false} />
        <SettingRange label="Missing Person Timeout" value={30} unit="s" />
      </SettingSection>

      <SettingSection title="Camera Feeds" icon={Video}>
        <SettingToggle label="High Definition Streaming" description="Stream 1080p footage (High Bandwidth)" enabled={true} />
        <SettingToggle label="Auto-Reconnect" description="Attempt to restore dropped streams" enabled={true} />
      </SettingSection>
      
      <SettingSection title="Data Retention" icon={Database}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-white mb-2">Video Logs Retention</div>
            <select className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none">
              <option>7 Days</option>
              <option selected>30 Days</option>
              <option>90 Days</option>
            </select>
          </div>
          <div>
            <div className="text-sm font-medium text-white mb-2">Analytics Retention</div>
            <select className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none">
              <option>3 Months</option>
              <option>6 Months</option>
              <option selected>1 Year</option>
            </select>
          </div>
        </div>
      </SettingSection>
    </div>
  );
};

export default Settings;
