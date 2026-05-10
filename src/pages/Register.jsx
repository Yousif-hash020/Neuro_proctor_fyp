import React, { useState, useContext } from 'react';
import { LogIn, Lock, Mail, Terminal, User, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'invigilator'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const { name, email, password, role } = formData;
    const result = await register(name, email, password, role);
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

        <div className="text-center pt-16 mb-4 md:mb-6 shrink-0">
          <div className="flex justify-center mb-2 md:mb-4">
            <Terminal className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse-slow" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Neuro<span className="text-white/50">Proctor</span>
          </h1>
          <p className="text-[8px] md:text-[9px] text-white/50 tracking-[0.4em] uppercase font-mono">Registration Protocol</p>
        </div>

        {error && (
          <div className="mb-2 md:mb-4 p-2 bg-red-900/30 border border-red-500/50 text-red-200 text-xs text-center font-mono clip-chamfer shrink-0">
            [ERROR]: {error}
          </div>
        )}

        <form className="space-y-3 md:space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-1">Operator Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-4 w-4 text-white/50" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/20 clip-chamfer py-2.5 md:py-3 pl-12 pr-4 text-[10px] md:text-[11px] tracking-widest text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all font-mono placeholder:text-white/20"
                placeholder="JOHN DOE"
              />
            </div>
          </div>

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
                placeholder="OPERATOR@NEUROPROCTOR.AI"
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
                minLength="6"
                className="w-full bg-white/5 border border-white/20 clip-chamfer py-2.5 md:py-3 pl-12 pr-4 text-[10px] md:text-[11px] tracking-widest text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all font-mono placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-1">Clearance Level</label>
            <div className="relative flex gap-2 md:gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="invigilator"
                  checked={formData.role === 'invigilator'}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="w-full text-center py-2 md:py-3 border border-white/20 bg-white/5 peer-checked:bg-white peer-checked:text-black peer-checked:border-white text-[9px] md:text-[10px] tracking-widest uppercase transition-all clip-chamfer">
                  Invigilator
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="w-full flex items-center justify-center gap-2 py-2 md:py-3 border border-white/20 bg-white/5 peer-checked:bg-white peer-checked:text-black peer-checked:border-white text-[9px] md:text-[10px] tracking-widest uppercase transition-all clip-chamfer">
                  <Shield className="w-3 h-3" /> Admin
                </div>
              </label>
            </div>
          </div>

          <button type="submit" className="w-full py-3 md:py-4 px-4 bg-white hover:bg-white/90 text-black text-[10px] md:text-[11px] font-bold tracking-[0.3em] uppercase clip-chamfer shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all mt-2 flex items-center justify-center gap-3">
            <User className="w-4 h-4" />
            Establish Identity
          </button>
        </form>

        <div className="mt-4 md:mt-4 mb-4 flex justify-center items-center shrink-0">
          <Link to="/login" className="text-[8px] md:text-[9px] text-white/50 tracking-[0.2em] uppercase hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">
            Return to Login Protocol
          </Link>
        </div>

        <div className="mt-4 md:mt-6 text-center border-t border-white/10 pt-4 shrink-0">
          <p className="text-[7px] md:text-[8px] text-white/30 tracking-[0.3em] uppercase font-mono">Restricted Access // Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
