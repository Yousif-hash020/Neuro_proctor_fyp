import React, { useContext, useState } from 'react';
import { UserCircle2, Save, Lock, Mail, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
      };
      if (password.trim()) payload.password = password.trim();

      const result = await updateProfile(payload);
      if (!result.success) {
        setError(result.message);
        return;
      }

      setPassword('');
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <UserCircle2 className="w-6 h-6 text-white/70" />
          Profile Settings
        </h1>
        <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mt-1">Update your personal account information</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 border-white/10 space-y-5">
        <div>
          <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-3.5 h-4 w-4 text-white/50" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-black/50 border border-white/20 clip-chamfer py-3 pl-12 pr-4 text-[11px] tracking-widest text-white focus:outline-none focus:border-white transition-all font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-4 w-4 text-white/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/50 border border-white/20 clip-chamfer py-3 pl-12 pr-4 text-[11px] tracking-widest text-white focus:outline-none focus:border-white transition-all font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 mb-2">New Password (Optional)</label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-white/50" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              placeholder="Leave blank to keep current password"
              className="w-full bg-black/50 border border-white/20 clip-chamfer py-3 pl-12 pr-4 text-[11px] tracking-widest text-white focus:outline-none focus:border-white transition-all font-mono placeholder:text-white/20"
            />
          </div>
        </div>

        {message && (
          <div className="text-[10px] uppercase tracking-[0.2em] text-green-400 border border-green-500/30 bg-green-500/10 p-3 clip-chamfer font-mono">
            {message}
          </div>
        )}
        {error && (
          <div className="text-[10px] uppercase tracking-[0.2em] text-red-300 border border-red-500/30 bg-red-500/10 p-3 clip-chamfer font-mono">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="glass-button px-6 py-3 flex items-center text-white bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30 text-[10px] tracking-widest uppercase font-bold gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
