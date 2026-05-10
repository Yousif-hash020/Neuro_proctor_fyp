import React, { useState, useContext } from 'react';
import { LogIn, Lock, Mail, Terminal } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { email, password } = formData;
    const result = await login(email, password);
    if (result.success) {
      navigate('/app/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white relative overflow-hidden font-inter selection:bg-white selection:text-black p-4">
      {/* Background Decorators */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] w-[2px] h-[100px] bg-white"></div>
        <div className="absolute top-[20%] left-[10%] w-[100px] h-[2px] bg-white"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[2px] h-[100px] bg-white"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[100px] h-[2px] bg-white"></div>
      </div>

      <div className="w-full max-w-md p-6 md:p-8 glass-panel border-white/20 clip-chamfer relative z-10 bg-black/80 backdrop-blur-xl max-h-full flex flex-col justify-center">
        <div className="absolute top-0 right-0 p-4">
          <div className="flex gap-1 h-[15px] relative" style={{ transform: 'skewX(-25deg)' }}>
            <div className="w-[3px] bg-white/30"></div>
            <div className="w-[3px] bg-white/30"></div>
            <div className="w-[3px] bg-white/30"></div>
          </div>
        </div>

        <div className="text-center mb-4 md:mb-6 shrink-0">
          <div className="flex justify-center mb-2 md:mb-4">
            <Terminal className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse-slow" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Neuro<span className="text-white/50">Proctor</span>
          </h1>
          <p className="text-[8px] md:text-[9px] text-white/50 tracking-[0.4em] uppercase font-mono">Authentication Protocol</p>
        </div>

        {error && (
          <div className="mb-2 md:mb-4 p-2 bg-red-900/30 border border-red-500/50 text-red-200 text-xs text-center font-mono clip-chamfer shrink-0">
            [ERROR]: {error}
          </div>
        )}
        
        <form className="space-y-3 md:space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-1">Operator ID</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-white/50" />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/20 clip-chamfer py-2.5 md:py-3 pl-12 pr-4 text-[10px] md:text-[11px] tracking-widest text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all font-mono placeholder:text-white/20"
                placeholder="ADMIN@NEUROPROCTOR.AI"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-1">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-white/50" />
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/20 clip-chamfer py-2.5 md:py-3 pl-12 pr-4 text-[10px] md:text-[11px] tracking-widest text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all font-mono placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-1 md:pt-2">
            <label className="flex items-center cursor-pointer group">
              <div className="relative w-3 h-3 md:w-4 md:h-4 border border-white/30 bg-white/5 clip-chamfer flex items-center justify-center mr-2 md:mr-3 group-hover:border-white transition-colors">
                <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer" />
              </div>
              <span className="text-[8px] md:text-[9px] text-white/50 tracking-[0.2em] uppercase group-hover:text-white transition-colors">Persist Session</span>
            </label>
            <Link to="/register" className="text-[8px] md:text-[9px] text-white/50 tracking-[0.2em] uppercase hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">Initialize Operator?</Link>
          </div>
          
          <button type="submit" className="w-full py-3 md:py-4 px-4 bg-white hover:bg-white/90 text-black text-[10px] md:text-[11px] font-bold tracking-[0.3em] uppercase clip-chamfer shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all mt-2 flex items-center justify-center gap-3">
            <LogIn className="w-4 h-4" />
            Initialize System
          </button>
        </form>

        <div className="mt-4 md:mt-6 text-center border-t border-white/10 pt-4 shrink-0">
          <p className="text-[7px] md:text-[8px] text-white/30 tracking-[0.3em] uppercase font-mono">Restricted Access // Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
